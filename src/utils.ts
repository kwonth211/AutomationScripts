import { Page } from 'puppeteer-core'

export const detectDialog = ({ page }: { page: Page }) => {
  page.on('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`)
    await dialog.accept() // 확인 버튼을 누릅니다.
  })
}
export const closePopups = ({ page }: { page: Page }) => {
  page.on('popup', async (popupPage: Page) => {
    // 새로운 팝업 창이 생성되면 바로 닫음
    await popupPage.close()
  })
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
