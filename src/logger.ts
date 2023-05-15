import { BrowserWindow, ipcMain, ipcRenderer } from 'electron'

export const log = (message: string) => {
  console.log(message)
  const time = new Date()
  const timestamp = time.toLocaleTimeString()
  const logMessage = `[${timestamp}] : ${message}`

  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('log-message', logMessage)
  })
}
