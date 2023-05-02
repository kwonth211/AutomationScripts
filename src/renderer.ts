document.addEventListener('DOMContentLoaded', () => {
  const startMacroButton = document.getElementById('startMacro')

  if (startMacroButton) {
    startMacroButton.addEventListener('click', () => {
      const timeCheckboxes = document.querySelectorAll(
        "input[type='checkbox']:not([name^='doctor'])",
      )
      const doctorCheckboxes = document.querySelectorAll(
        "input[type='checkbox'][name^='doctor']",
      )

      const selectedTimes: string[] = []
      const selectedTeachers: string[] = []

      timeCheckboxes.forEach((checkbox: any) => {
        if (checkbox.checked) {
          selectedTimes.push(checkbox.value)
        }
      })
      doctorCheckboxes.forEach((checkbox: any) => {
        if (checkbox.checked) {
          selectedTeachers.push(checkbox.value)
        }
      })
      ;(window as any)?.electron.send('start-macro', {
        selectedTimes,
        selectedTeachers,
      })
    })
  }

  // 메인 프로세스에서 전달된 메시지 처리 (옵션)
  // window.electron.on('macro-finished', () => {
  //   console.log('매크로 작업 완료');
  // });
})
