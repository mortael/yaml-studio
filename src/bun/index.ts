import Electrobun from 'electrobun';

const win = new Electrobun.BrowserWindow({
  title: 'YAML Studio',
  frame: {
    width: 1200,
    height: 800,
    x: 0,
    y: 0
  },
  url: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : `file://${process.cwd()}/dist/index.html`,
});

// In Electrobun, the app stays alive as long as there are windows or active listeners
// You can handle window close if needed
win.on('close', () => {
  // Handle cleanup
});
