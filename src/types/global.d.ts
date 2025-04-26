declare module 'micromodal' {
    interface Options {
        onShow?: (modal: { id: string }) => void;
        onClose?: (modal: { id: string }) => void;
        openTrigger?: string;
        closeTrigger?: string;
        disableScroll?: boolean;
        disableFocus?: boolean;
        awaitOpenAnimation?: boolean;
        awaitCloseAnimation?: boolean;
        debugMode?: boolean;
    }

    interface MicroModal {
        init(targetModal: string, options?: Options): void;
        show(targetModal: string, options?: Options): void;
        close(targetModal: string): void;
    }

    const MicroModal: MicroModal;
    export default MicroModal;
}

interface Window {
    RecoveryOBJ: {
        path: string;
        email: string | null;
    }
    StatusNotification: any;
    Modaloptions: any;
} 