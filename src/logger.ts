import { BrowserWindow, ipcMain, ipcRenderer } from 'electron'

export const log = (...args: any) => {
  console.log(args)
  const time = new Date()
  const timestamp = time.toLocaleTimeString()
  const logMessage = `[${timestamp}] : ${args.join('<br />')}`

  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('log-message', logMessage)
  })
}
