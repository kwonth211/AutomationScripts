import { Page } from 'puppeteer-core'
import { closePopups, detectDialog } from '../../utils'
import { SelectedOption, login } from '../cultureLand'
import { log } from '../../logger'

export const main = async ({
  page,
  selectedOption,
  phonePart1,
  phonePart2,
  phonePart3,
}: {
  page: Page
  selectedOption: SelectedOption
  phonePart1: string
  phonePart2: string
  phonePart3: string
}) => {
  detectDialog({ page })
  closePopups({ page })

  try {
    await login({ page, selectedOption, phonePart1, phonePart2, phonePart3 })
  } catch (error) {
    log('매크로 실행 중 오류 발생', error)
  }
}
