import { contextBridge, ipcRenderer } from 'electron'
import { log } from './logger'

contextBridge.exposeInMainWorld('electron', {
  send: (channel: any, data: any) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel: any, callback: any) => {
    const newCallback = (_: any, ...args: any) => callback(...args)
    ipcRenderer.on(channel, newCallback)
    // Clean up the listener when the window is closed
    window.addEventListener('beforeunload', () => {
      ipcRenderer.removeListener(channel, newCallback)
    })
  },
})
