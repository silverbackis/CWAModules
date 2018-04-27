const { readdirSync, statSync } = require('fs');
const { join } = require('path');

/**
 * Sync is best/fastest
 * @see https://gist.github.com/timoxley/0cb5053dec107499c8aabad8dfd651ea
 * @param dir
 * @param allFiles
 * @param subDir
 * @returns Array
 */
module.exports = function rreaddirSync(dir, allFiles = [], subDir = '') {
  const files = readdirSync(dir)
  files.forEach(f => {
    if (statSync(join(dir, f)).isDirectory()) {
      rreaddirSync(join(dir, f), allFiles, join(subDir, f))
    } else {
      allFiles.push(join(subDir, f))
    }
  })
  return allFiles
};
