import { Page } from 'puppeteer-core'
import { closePopups, detectDialog } from '../../utils'
import { SelectedOption, login } from '../cultureLand'
import { log } from '../../logger'

export const main = async ({ page, selectedOption }: { page: Page; selectedOption: SelectedOption }) => {
  await page.setViewport({ width: 375, height: 812 })
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
  )

  detectDialog({ page })
  closePopups({ page })

  try {
    await login({ page, selectedOption })
  } catch (error) {
    log('매크로 실행 중 오류 발생', error)
  }
}
