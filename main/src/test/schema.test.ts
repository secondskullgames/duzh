import { ConsumableItemModelSchema } from '@models/ConsumableItemModel';
import { DynamicSpriteModelSchema } from '@models/DynamicSpriteModel';
import { EquipmentModelSchema } from '@models/EquipmentModel';
import { GeneratedMapModelSchema } from '@models/GeneratedMapModel';
import { PredefinedMapModelSchema } from '@models/PredefinedMapModel';
import { StaticSpriteModelSchema } from '@models/StaticSpriteModel';
import { TileSetModelSchema } from '@models/TileSetModel';
import { UnitModelSchema } from '@models/UnitModel';
import * as fs from 'fs/promises';
import { ZodObject } from 'zod';

// TODO replace with glob
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

const loadFile = async (filename: string): Promise<ZodObject> => {
  const buffer = await fs.readFile(filename);
  return JSON.parse(buffer.toString('utf-8'));
};

const validate = async (schema: ZodObject, dataFilenames: string[]) => {
  for (const dataFilename of dataFilenames) {
    const data = await loadFile(dataFilename);
    const isValid = schema.safeParse(data);
    if (!isValid.success) {
      throw new Error(
        `Failed to validate ${dataFilename}:\n${JSON.stringify(isValid.error, null, 4)}`
      );
    }
  }
};

test('test validity of JSON data', async () => {
  await validate(UnitModelSchema, await getFilenamesRecursive('data/units'));
  await validate(EquipmentModelSchema, await getFilenamesRecursive('data/equipment'));
  await validate(
    PredefinedMapModelSchema,
    await getFilenamesRecursive('data/maps/predefined')
  );
  await validate(
    GeneratedMapModelSchema,
    await getFilenamesRecursive('data/maps/generated')
  );
  await validate(
    StaticSpriteModelSchema,
    await getFilenamesRecursive('data/sprites/static')
  );
  await validate(
    DynamicSpriteModelSchema,
    await getFilenamesRecursive('data/sprites/units')
  );
  await validate(
    DynamicSpriteModelSchema,
    await getFilenamesRecursive('data/sprites/equipment')
  );
  await validate(TileSetModelSchema, await getFilenamesRecursive('data/tilesets'));
  await validate(ConsumableItemModelSchema, await getFilenamesRecursive('data/items'));
});
