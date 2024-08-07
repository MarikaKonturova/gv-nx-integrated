import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      ciWebServerCommand: 'nx run gv:serve-static',
      cypressDir: 'src',
      webServerCommands: {
        default: 'nx run gv:serve:development',
        production: 'nx run gv:serve:production',
      },
    }),
    baseUrl: 'http://localhost:4200',
  },
});
