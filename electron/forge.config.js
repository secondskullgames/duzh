const { cp } = require('fs/promises');

module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32']
    }
  ],
  hooks: {
    prePackage: async () => {
      await cp('../build', './build', { recursive: true });
    }
  }
};
