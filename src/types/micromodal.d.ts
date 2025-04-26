declare module 'micromodal' {
  interface MicroModalType {
    show: (modalId: string) => void;
    close: (modalId: string) => void;
    init: (options?: any) => void;
  }
  
  const MicroModal: MicroModalType;
  export default MicroModal;
} 