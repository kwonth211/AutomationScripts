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

    let currentCourt = null
    if (dialog.message() === '본인인증에 성공하였습니다.') {
      try {
        for (let court of formData.courts) {
          currentCourt = court
          await reserve({ page, browser, formData, court })
        }
      } catch (error) {
        console.log('예약 중 오류 발생 다시 시도합니다..')
        if (currentCourt) {
          await reserve({ page, browser, formData, court: currentCourt })
        }
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
