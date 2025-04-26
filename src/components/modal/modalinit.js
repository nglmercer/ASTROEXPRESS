import MicroModal from 'micromodal';
  
// Initialize MicroModal when the component is mounted
document.addEventListener('DOMContentLoaded', () => {
  console.log("document.ready", Mi)
  MicroModal.init({
    onShow: modal => console.info(`${modal.id} mostrado`),
    onClose: modal => console.info(`${modal.id} cerrado`),
    openTrigger: 'data-micromodal-trigger',
    closeTrigger: 'data-micromodal-close',
    disableScroll: true,
    disableFocus: false,
    awaitOpenAnimation: false,
    awaitCloseAnimation: false,
    debugMode: true
  });
});