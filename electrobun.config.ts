export default {
  app: {
    name: 'YAML Studio',
    identifier: 'com.yamlstudio.app',
    version: '1.0.0',
  },
  build: {
    bun: {
      entrypoint: 'src/bun/index.ts',
    },
    views: {
      main: {
        entrypoint: 'index.tsx',
      }
    },
    buildFolder: 'out',
  }
};
