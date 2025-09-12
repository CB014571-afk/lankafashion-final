import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalStudio: true,
    defaultCommandTimeout: 10000, // 10 seconds
    pageLoadTimeout: 60000, // 60 seconds
    retries: {
      runMode: 3, // Retry failed tests up to 3 times in CLI
      openMode: 1  // Retry failed tests once in interactive mode
    },
  },
});
