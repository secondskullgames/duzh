import { compileFromFile } from 'json-schema-to-typescript'
import glob from 'glob-promise';
import { mkdir, readFile, writeFile, stat } from 'fs/promises';
import { createHash } from 'crypto';

const schemaDir = 'schema';
const outDir = 'src/gen-schema';
const hashFilename = `${outDir}/HASH`;

const main = async () => {
  const filenames = await glob.promise('**/*.schema.json', { cwd: schemaDir });

  // hash the list of filenames and compare to the contents of the hash file, if it exists
  const hash = await computeFileHash(filenames, schemaDir);

  try {
    const oldHash = await readFile(hashFilename, 'utf-8');
    if (oldHash && hash === oldHash) {
      console.log('Hash matches, skipping gen-schema');
      return;
    } else {
      console.log('Hash file does not match content, regenerating schema');
    }
  } catch (e) {
    // hash file doesn't exist
    console.log('Hash file does not exist, regenerating schema');
  }
  await mkdir(outDir, { recursive: true });
  await writeFile(hashFilename, hash);

  for (const filename of filenames) {
    const compiled = await compileFromFile(`${schemaDir}/${filename}`, {
      cwd: schemaDir,
      style: {
        singleQuote: true
      }
    });
    const outFilename = `${outDir}/${filename.substring(0, filename.indexOf('.json'))}.ts`;
    await writeFile(outFilename, compiled)
    console.log(`wrote ${outFilename}`);
  }
};

const computeFileHash = async (filenames: string[], baseDir?: string) => {
  const hash = createHash('md5');
  // construct a string from the modification date, the filename and the filesize
  for (let filename of filenames) {
    const fullFilename = baseDir ? `${baseDir}/${filename}` : filename;
    const statInfo = await stat(fullFilename);
    // compute hash string name:size:mtime
    const fileInfo = `${fullFilename}:${statInfo.size}:${statInfo.mtimeMs}`;
    hash.update(fileInfo);
  }

  return hash.digest('base64');
}

main().then(() => {}).catch(e => console.error(e));
