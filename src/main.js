const { app, BrowserWindow, ipcMain } = require('electron')
const puppeteer = require('puppeteer-core')
const path = require('path')
const chromeLauncher = require('chrome-launcher')

async function runMacro() {
  const chromePath = await chromeLauncher.Launcher.getFirstInstallation()

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null, // 기본 뷰포트를 사용하지 않습니다.
    executablePath: chromePath,
    args: [
      '--start-maximized', // 크롬 창을 최대화하여 시작합니다.
    ],
  })
  const page = await browser.newPage()

  await page.goto('https://www.zerogangnam.com/reservation/')

  // 로그인 버튼을 찾아 클릭합니다.

  const $buttonSelector = '#themeChoice > label:nth-child(5)'

  await page.waitForSelector($buttonSelector)

  page.click($buttonSelector)
}

ipcMain.on('start-macro', () => {
  runMacro()
    .then(() => {
      // 매크로 작업이 완료되면 렌더러 프로세스에 알립니다.
      // win.webContents.send('macro-finished');
    })
    .catch((error) => {
      console.error('매크로 실행 중 오류 발생:', error)
    })
})

function createWindow() {
  const win = new BrowserWindow({
    width: 200,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js'),
    },
  })

  win.loadFile('./public/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
  // if (process.platform !== 'darwin') {
  // }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
