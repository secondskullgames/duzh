/*
 * Build script to generate a list of filenames that exist in the png/ directory,
 * so that we can know which ones actually exist (to support the "_B" draw-behind nonsense) before
 * making HTTP requests to fetch them.
 *
 * Note: This is pure JS because it's a build script that runs directly through Node.
 * It's probably possible to update the build system to run it through Typescript as well,
 * but the cost-benefit isn't really there.
 */

const fs = require('fs');

/**
 * @param {string} directory
 * @return string[]
 */
const getFiles = (directory) => {
  /** @type {string[]} filenames */
  const filenames = [];
  /** @type {Dirent[]} files */
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const fullPath = `${directory}/${file.name}`;
    if (file.isDirectory()) {
      filenames.push(...getFiles(fullPath));
    } else {
      filenames.push(fullPath);
    }
  }
  return filenames;
};

/**
 * @param {string} data
 * @param {string} path
 */
const writeToFile = (data, path) => fs.writeFileSync(path, data);

const filenames = getFiles('png');
writeToFile(JSON.stringify(filenames, null, 2), 'data/filenames.json');
