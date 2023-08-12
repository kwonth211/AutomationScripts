import { Page } from 'puppeteer-core'
import { closePopups, detectDialog } from '../../utils'
import { SelectedOption, login } from '../cultureLand'
import { log } from '../../logger'

export const main = async ({ page, selectedOption }: { page: Page; selectedOption: SelectedOption }) => {
  detectDialog({ page })
  closePopups({ page })

  try {
    await login({ page, selectedOption })
  } catch (error) {
    log('매크로 실행 중 오류 발생', error)
  }
}
