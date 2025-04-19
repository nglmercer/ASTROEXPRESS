let activelogs = false;

// Permite activar o desactivar los logs desde fuera
const setActiveLogs = (active) => {
    activelogs = !!active;
};

const loggerdebug = () => {
    if (!activelogs) return {
        log: () => {},
        debug: () => {},
        warn: () => {},
        error: () => {}
    };
    return {
        log: (msg) => {
            console.log(msg);
        },
        debug: (msg) => {
            console.debug(msg);
        },
        warn: (msg) => {
            console.warn(msg);
        },
        error: (msg) => {
            console.error(msg);
        }
    };
};
