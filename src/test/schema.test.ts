import Ajv from 'ajv';
import fs from 'fs/promises';
import { test, expect } from '@jest/globals';

const schemaNames = ['palette-swaps', 'unit', 'equipment', 'predefined-map', 'generated-map', 'static-sprite', 'dynamic-sprite', 'tile-set'];

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

const loadFile = async (filename: string): Promise<any> => {
  const buffer = await fs.readFile(filename);
  return JSON.parse(buffer.toString('utf-8'));
};

const ajv = new Ajv();

const validate = async (schemaName: string, dataFilenames: string[]) => {
  const validate = ajv.getSchema(`${schemaName}.schema.json`);
  if (!validate) {
    throw new Error(`Failed to load schema ${schemaName}`);
  }
  for (const dataFilename of dataFilenames) {
    console.log(`Validating ${dataFilename}`);
    const data = await loadFile(dataFilename);
    const isValid = validate(data);
    if (!validate(data)) {
      throw new Error(`Failed to validate ${dataFilename}: ${JSON.stringify(validate.errors)}`);
    }
  }
};

test('test validity of JSON data', async () => {
  for (const schemaName of schemaNames) {
    const filename = `data/schema/${schemaName}.schema.json`;
    console.log(`Loading schema ${filename}`);
    const schema = await loadFile(filename);
    ajv.addSchema(schema);
  }
  await validate('unit', await getFilenamesRecursive('data/units'));
  await validate('equipment', await getFilenamesRecursive('data/equipment'));
  await validate('predefined-map', await getFilenamesRecursive('data/maps/predefined'));
  await validate('generated-map', await getFilenamesRecursive('data/maps/generated'));
  await validate('static-sprite', await getFilenamesRecursive('data/sprites/static'));
  await validate('dynamic-sprite', await getFilenamesRecursive('data/sprites/units'));
  await validate('dynamic-sprite', await getFilenamesRecursive('data/sprites/equipment'));
  await validate('tile-set', await getFilenamesRecursive('data/tilesets'));
});

export {};
