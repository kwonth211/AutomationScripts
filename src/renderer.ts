document.addEventListener('DOMContentLoaded', () => {
  const macroForm = document.getElementById('macro-form')
  console.log(macroForm)

  if (macroForm) {
    macroForm.addEventListener('submit', (e) => {
      e.preventDefault()
      let options = document.getElementsByName('options') as NodeListOf<HTMLInputElement>

      let selectedOption
      for (let i = 0; i < options.length; i++) {
        if (options[i].checked) {
          selectedOption = options[i].value
          break
        }
      }

      ;(window as any)?.electron.send('start-macro', {
        selectedOption,
      })
    })
  }
  // 메인 프로세스에서 전달된 메시지 처리 (옵션)
  // window.electron.on('macro-finished', () => {
  //   console.log('매크로 작업 완료');
  // });
})
