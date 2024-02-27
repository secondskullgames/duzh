import { schemaNames } from '@main/utils/ModelLoader';
import Ajv, { AnySchema } from 'ajv';
import { test } from '@jest/globals';
import * as fs from 'fs/promises';

const getFilenamesRecursive = async (baseDir: string): Promise<string[]> => {
  const allFilenames: string[] = [];
  const filenames = await fs.readdir(baseDir);
  for (const filename of filenames) {
    const fullFilename = `${baseDir}/${filename}`;
    const isDirectory = (await fs.stat(fullFilename)).isDirectory();
    if (isDirectory) {
      const filesInDirectory = await getFilenamesRecursive(fullFilename);
      allFilenames.push(...filesInDirectory);
    } else {
      allFilenames.push(fullFilename);
    }
  }
  return allFilenames;
};

const loadFile = async (filename: string): Promise<AnySchema> => {
  const buffer = await fs.readFile(filename);
  return JSON.parse(buffer.toString('utf-8'));
};

const ajv = new Ajv();

const validate = async (schemaName: string, dataFilenames: string[]) => {
  const validate = ajv.getSchema(schemaName);
  if (!validate) {
    throw new Error(`Failed to load schema ${schemaName}`);
  }
  for (const dataFilename of dataFilenames) {
    const data = await loadFile(dataFilename);
    const isValid = validate(data);
    if (!isValid) {
      throw new Error(
        `Failed to validate ${dataFilename}:\n${JSON.stringify(validate.errors, null, 4)}`
      );
    }
  }
};

test('test validity of JSON data', async () => {
  for (const schemaName of schemaNames) {
    const filename = `src/gen-schema/${schemaName}.schema.json`;
    const schema = await loadFile(filename);
    ajv.addSchema(schema);
  }
  await validate('UnitModel', await getFilenamesRecursive('data/units'));
  await validate('EquipmentModel', await getFilenamesRecursive('data/equipment'));
  await validate(
    'PredefinedMapModel',
    await getFilenamesRecursive('data/maps/predefined')
  );
  await validate('GeneratedMapModel', await getFilenamesRecursive('data/maps/generated'));
  await validate('StaticSpriteModel', await getFilenamesRecursive('data/sprites/static'));
  await validate('DynamicSpriteModel', await getFilenamesRecursive('data/sprites/units'));
  await validate(
    'DynamicSpriteModel',
    await getFilenamesRecursive('data/sprites/equipment')
  );
  await validate('TileSetModel', await getFilenamesRecursive('data/tilesets'));
  await validate('ConsumableItemModel', await getFilenamesRecursive('data/items'));
});

export {};
