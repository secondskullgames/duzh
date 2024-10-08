import * as TJS from 'typescript-json-schema';
import { glob } from 'glob';
import { Definition } from 'typescript-json-schema';
import { writeFile, mkdir, stat, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/* eslint-disable no-console */

const modelsDir = 'src/models';
const outDir = 'src/gen-schema';
const hashFilename = `${outDir}/HASH`;

const generateSchemas = async () => {
  const filenames = (await glob(`${modelsDir}/**/*.ts`)).sort();
  const updated = await checkForFileUpdates(filenames);
  if (!updated) {
    return;
  }

  const modelNames = filenames.map(filename => {
    const splitParts = filename.split(/[\\/]/);
    const lastPart = splitParts[splitParts.length - 1];
    return lastPart.substring(0, lastPart.indexOf('.ts'));
  });

  const program = TJS.getProgramFromFiles(filenames, { strictNullChecks: true });

  await mkdir(outDir, { recursive: true });

  const prettyPrint = (schema: Definition): string => JSON.stringify(schema, null, 2);

  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i];
    const modelName = modelNames[i];
    console.log(`Generating schema for ${filename} (${modelName})`);
    const schema = TJS.generateSchema(program, modelName, {
      id: modelName,
      required: true,
      noExtraProps: true
    }) as Definition;
    schema.properties ??= {};
    schema.properties['$schema'] = { type: 'string' };
    schema.required ??= [];
    schema.required.push('$schema');
    const outFilename = `${outDir}/${modelName}.schema.json`;
    await writeFile(outFilename, prettyPrint(schema));
  }
};

const checkForFileUpdates = async (filenames: string[]): Promise<boolean> => {
  const hash = await computeFileHash(filenames);

  try {
    const oldHash = await readFile(hashFilename, 'utf-8');
    if (oldHash && hash === oldHash) {
      console.log('Hash matches, skipping gen-schema');
      return false;
    } else {
      console.log('Hash file does not match content, regenerating schema');
    }
  } catch {
    console.log('Hash file does not exist, regenerating schema');
  }

  try {
    await mkdir(outDir, { recursive: true });
    await writeFile(hashFilename, hash);
  } catch (e) {
    console.log('Failed to save hash contents: ', e);
  }

  return true;
};

const computeFileHash = async (
  filenames: string[],
  baseDir?: string
): Promise<string> => {
  const hash = createHash('md5');
  // construct a string from the modification date, the filename and the filesize
  for (const filename of filenames) {
    const fullFilename = baseDir ? `${baseDir}/${filename}` : filename;
    const statInfo = await stat(fullFilename);
    // compute hash string name:size:mtime
    const fileInfo = `${fullFilename}:${statInfo.size}:${statInfo.mtimeMs}`;
    hash.update(fileInfo);
  }
  return hash.digest('base64');
};

await generateSchemas();
