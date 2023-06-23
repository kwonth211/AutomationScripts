document.addEventListener('DOMContentLoaded', () => {
  const macroForm = document.getElementById('macro-form')
  const clearButton = document.getElementById('clear-button')

  if (macroForm) {
    macroForm.addEventListener('submit', (e) => {
      e.preventDefault()

      const startYear = (document.getElementById('startYear') as HTMLInputElement).value
      const endYear = (document.getElementById('endYear') as HTMLInputElement).value
      const city = (document.getElementById('city') as HTMLInputElement).value
      const gu = (document.getElementById('gu') as HTMLInputElement).value
      const dong = (document.getElementById('dong') as HTMLInputElement).value

      window?.electron.send('start-macro', {
        startYear,
        endYear,
        city,
        gu,
        dong,
      })
    })
  }
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      const logElement = document.querySelector('#log') as HTMLDivElement
      logElement.innerHTML = ''
    })
  }
})

window.electron.on('log-message', (logMessage: any) => {
  const logElement = document.querySelector('#log') as HTMLDivElement
  const messageElement = document.createElement('div')
  messageElement.innerHTML = logMessage
  logElement.appendChild(messageElement)
})
