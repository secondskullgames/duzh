const { cp } = require('fs/promises');

module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32', 'linux']
    }
  ],
  hooks: {
    prePackage: async () => {
      await cp('../main/build', './build', { recursive: true });
    }
  }
};
