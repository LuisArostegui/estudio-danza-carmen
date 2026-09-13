import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '0b9n06q6',
    dataset: 'production',
  },
  deployment: {
    // Keep CI and local builds on the versions resolved by the workspace lockfile.
    autoUpdates: false,
  },
})
