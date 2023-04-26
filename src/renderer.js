
document.addEventListener('DOMContentLoaded', () => {
  const startMacroButton = document.getElementById('startMacro');
  console.log(window?.electron);

  if (startMacroButton) {
    startMacroButton.addEventListener('click', () => {
      window?.electron.send('start-macro');
    });
  }

  // 메인 프로세스에서 전달된 메시지 처리 (옵션)
  // window.electron.on('macro-finished', () => {
  //   console.log('매크로 작업 완료');
  // });
});
