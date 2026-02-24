export default {
  name: 'YAML Studio',
  id: 'com.yamlstudio.app',
  version: '1.0.0',
  main: './main.ts',
  views: {
    main: {
      url: 'http://localhost:3000',
      width: 1200,
      height: 800,
    }
  },
  build: {
    distDir: './dist-native',
    outDir: './out',
  }
};
