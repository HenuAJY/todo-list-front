const { app, BrowserWindow, Menu } = require("electron");

Menu.setApplicationMenu(null);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile("./dist/index.html");
};

(async () => {
  await app.whenReady();
  createWindow();
})();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
