import { Browser, Page } from 'puppeteer-core'
import { ReserveFormData, reserve } from './domain/buk-gu-football'

export const detectDialog = ({
  page,
  browser,
  formData,
}: {
  page: Page
  browser: Browser
  formData: ReserveFormData
}) => {
  page.on('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`)
    await dialog.accept() // 확인 버튼을 누릅니다.

    if (dialog.message() === '본인인증에 성공하였습니다.') {
      try {
        for (let court of formData.courts) {
          await reserve({ page, browser, formData, court })
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (dialog.message() === '잘못된 경로로 접근하였습니다.') {
      for (let court of formData.courts) {
        await reserve({ page, browser, formData, court })
      }
    }
  })
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
