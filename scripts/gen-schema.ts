import * as TJS from 'typescript-json-schema';
import glob from 'glob-promise';
import { writeFile, mkdir } from 'fs/promises';
import { Definition } from 'typescript-json-schema';

const schemaDir = 'src/main/schemas';
const outDir = 'src/gen-schema'
const filenames = await glob.promise(`${schemaDir}/**/*.ts`);
const modelNames = filenames.map(filename => {
  filename = filename.split('/')[filename.split('/').length - 1];
  filename = filename.substring(0, filename.indexOf('.d.ts'));
  return filename;
});
console.log(`Model names: ${modelNames}`);

const compilerOptions = {
  strictNullChecks: true,
};

const program = TJS.getProgramFromFiles(
  filenames,
  compilerOptions
);

console.log(`Program root files: ${program.getRootFileNames()}`);

await mkdir(outDir, { recursive: true });

const prettyPrint = (schema: Definition): string =>
  JSON.stringify(schema, null, 2);

for (let i = 0; i < filenames.length; i++) {
  const filename = filenames[i];
  const modelName = modelNames[i];
  console.log(`Generating schema for ${filename} (${modelName})`);
  const schema = TJS.generateSchema(
    program,
    modelName,
    {
      id: modelName,
      required: true,
    }
  );
  const outFilename = `${outDir}/${modelName}.schema.json`;
  await writeFile(outFilename, prettyPrint(schema!));
}