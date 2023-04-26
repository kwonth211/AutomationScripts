const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, callback) => {
    const newCallback = (_, ...args) => callback(...args);
    ipcRenderer.on(channel, newCallback);

    // Clean up the listener when the window is closed
    window.addEventListener('beforeunload', () => {
      ipcRenderer.removeListener(channel, newCallback);
    });
  },
});
