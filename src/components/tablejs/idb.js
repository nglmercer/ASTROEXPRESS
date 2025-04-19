const databases = {
    commentEventsDB: { name: 'commentEvents', version: 1, store: 'commentEvents' },
    giftEventsDB: { name: 'giftEvents', version: 1, store: 'giftEvents' },
    bitsEventsDB: { name: 'bitsEvents', version: 1, store: 'bitsEvents' },
    likesEventsDB: { name: 'likesEvents', version: 1, store: 'likesEvents' },
    eventsDB: { name: 'Events', version: 1, store: 'events' },
    ActionsDB: { name: 'Actions', version: 1, store: 'actions' },
    banDB: { name: 'Bans', version: 1, store: 'bans' },
};

class IndexedDBManager {
    constructor(dbConfig, emitter) {
        this.dbConfig = dbConfig;
        this.emitter = emitter;
        this.db = null;
        this.defaultIndexes = []
    }
    async updateDataById(id, updatedData) {
        return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                // Convertir el id a número si es necesario y es requerido por la clave
                const numericId = typeof id === 'number' ? id : Number(id);

                if (isNaN(numericId)) {
                    return reject(new Error(`Invalid id: ${id}. The id must be a valid number.`));
                }

                // Intentar obtener el registro con el id especificado
                const getRequest = store.get(numericId);

                getRequest.onsuccess = () => {
                    if (getRequest.result) {
                        // Mezcla los datos existentes con los nuevos datos, manteniendo el id original
                        const newData = { ...getRequest.result, ...updatedData, id: numericId };
                        const putRequest = store.put(newData);

                        putRequest.onsuccess = () => {
                            this.emitter?.emit('update', { config: this.dbConfig, data: newData });
                            resolve(newData);
                        };
                        putRequest.onerror = () => reject(putRequest.error);
                    } else {
                        reject(new Error(`No data found with id ${numericId}`));
                    }
                };

                getRequest.onerror = () => reject(getRequest.error);
            });
        });
    }
    async getDataById(id) {
        return this.executeTransaction(this.dbConfig.store, 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                // Convertir el id a número si es necesario
                const numericId = typeof id === 'number' ? id : Number(id);

                if (isNaN(numericId)) {
                    return reject(new Error(`Invalid id: ${id}. The id must be a valid number.`));
                }

                const request = store.get(numericId);

                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result);
                    } else {
                        reject(new Error(`No data found with id ${numericId}`));
                    }
                };

                request.onerror = () => reject(request.error);
            });
        });
    }

    async openDatabase() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbConfig.name, this.dbConfig.version);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.dbConfig.store)) {
                    // Siempre usar 'id' como keyPath
                    const objectStore = db.createObjectStore(this.dbConfig.store, { keyPath: 'id', autoIncrement: false }); // autoIncrement: false porque asignaremos IDs
                    this.defaultIndexes.forEach(index => {
                        if (!objectStore.indexNames.contains(index.name)) {
                            // Manejar keyPath de array para índices compuestos
                            objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                        }
                    });
                    console.log(`Object store ${this.dbConfig.store} created with indexes.`);
                } else {
                    // Verificar y añadir índices si faltan en una versión existente
                    const transaction = event.target.transaction;
                    const objectStore = transaction.objectStore(this.dbConfig.store);
                    this.defaultIndexes.forEach(index => {
                        if (!objectStore.indexNames.contains(index.name)) {
                            objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                            console.log(`Index ${index.name} created for existing store ${this.dbConfig.store}.`);
                        }
                    });
                }
            };
            request.onsuccess = () => { this.db = request.result; resolve(this.db); };
            request.onerror = (e) => { console.error(`IDB Error opening ${this.dbConfig.name}:`, request.error); reject(request.error); };
        });
    }

    async executeTransaction(storeName, mode, callback) {
        // Asegurarse que la BD está abierta ANTES de la transacción
        try {
            const db = await this.openDatabase();
            return new Promise((resolve, reject) => {
                // Prevenir errores si la DB se cerró inesperadamente
                if (!db || !db.objectStoreNames.contains(storeName)) {
                    console.error(`DB not open or store ${storeName} not found`);
                    return reject(new Error(`DB not open or store ${storeName} not found`));
                }

                const transaction = db.transaction([storeName], mode);
                const store = transaction.objectStore(storeName);
                let result = null; // Para almacenar el resultado de la operación principal

                transaction.oncomplete = () => resolve(result !== undefined ? result : true); // Resolve con resultado o true
                transaction.onerror = () => { console.error('IDB Transaction Error:', transaction.error); reject(transaction.error); };
                transaction.onabort = () => { console.warn('IDB Transaction Aborted:', transaction.error); reject(transaction.error || new Error('Transaction aborted')); };

                try {
                    const promise = callback(store); // Callback ahora puede devolver una promesa
                    if (promise instanceof Promise) {
                        promise.then(res => { result = res; /* No resolver aquí, esperar oncomplete */ })
                            .catch(err => {
                                console.error("Error inside transaction callback promise:", err);
                                if (!transaction.error) { // Evitar abortar si ya hubo error
                                    transaction.abort();
                                }
                                reject(err); // Rechazar la promesa externa
                            });
                    } else {
                        result = promise; // Si no devuelve promesa, guarda resultado sincrónicamente
                    }
                } catch (error) {
                    console.error("Error inside transaction callback sync:", error);
                    if (!transaction.error) {
                        transaction.abort();
                    }
                    reject(error);
                }
            });
        } catch (dbOpenError) {
            console.error("Failed to open DB for transaction:", dbOpenError);
            return Promise.reject(dbOpenError);
        }
    }

    async getAllData() {
        return this.executeTransaction(this.dbConfig.store, 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    async findMissingIds(allData) {
        const existingIds = allData.map(item => Number(item.id)).filter(id => !isNaN(id)).sort((a, b) => a - b);
        const missingIds = [];
        let expectedId = 0;
        for (const id of existingIds) {
            while (expectedId < id) {
                missingIds.push(expectedId);
                expectedId++;
            }
            expectedId = id + 1;
        }
        return missingIds;
    }

    async saveData(data) {
        // Asegurar que data es un objeto
        if (typeof data !== 'object' || data === null) {
            return Promise.reject(new Error("Invalid data: must be an object."));
        }

        const allData = await this.getAllData();
        let targetId;
        let isUpdate = false;

        // FIX: Verifica si se proporcionó un ID válido Y no es vacío o undefined
        // Solo consideramos un ID válido si:
        // 1. Es un número
        // 2. No es NaN
        // 3. Es mayor o igual a 0
        // 4. Y el ID existe explícitamente en data (no undefined/null/"")
        const hasExplicitId = data.id !== undefined && data.id !== null && data.id !== "";
        const providedId = Number(data.id);
        
        if (hasExplicitId && !isNaN(providedId) && providedId >= 0) {
            targetId = providedId;
            // Verifica si este ID ya existe para determinar si es una actualización
            isUpdate = allData.some(item => Number(item.id) === targetId);
        } else {
            // Comportamiento original para asignar un nuevo ID
            const missingIds = await this.findMissingIds(allData);
            if (missingIds.length > 0) {
                targetId = missingIds[0];
            } else {
                const maxId = allData.length > 0 ? Math.max(-1, ...allData.map(item => Number(item.id)).filter(id => !isNaN(id))) : -1;
                targetId = maxId + 1;
            }
            isUpdate = false; // Es una inserción nueva si asignamos ID
        }

        // Clona data y asigna el ID numérico correcto
        const newData = { ...data, id: targetId };
        const actionType = isUpdate ? 'update' : 'save';
        // console.log("Action:", actionType, "Data:", newData);

        return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
            // No necesita devolver promesa explícita, executeTransaction la maneja
            const request = store.put(newData);
            // El resultado que se resuelve será `newData`
            request.onsuccess = () => {
                // Notificar DESPUÉS de que la transacción tenga éxito (en oncomplete)
                // Guardamos el resultado para resolverlo en oncomplete
                // Esto se maneja ahora en executeTransaction
            };
            request.onerror = (e) => {
                console.error("Error in store.put:", request.error);
                // El error se propaga a transaction.onerror
            };
            return newData; // Devuelve el dato para que executeTransaction lo resuelva
        }).then(savedData => {
            this.emitter?.emit(actionType, { config: this.dbConfig, data: savedData }); // Notificar fuera/después de la transacción
            return savedData;
        });
    }

    async deleteData(id) {
        const numericId = Number(id);
        if (isNaN(numericId)) {
            return Promise.reject(new Error(`Invalid id for delete: ${id}`));
        }
        return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
            // Devuelve la promesa de la operación delete
            return new Promise((resolve, reject) => {
                const request = store.delete(numericId);
                request.onsuccess = () => resolve(numericId); // Resolvemos con el ID eliminado
                request.onerror = () => reject(request.error);
            });
        }).then(deletedId => {
            this.emitter?.emit('delete', { config: this.dbConfig, data: deletedId }); // Notificar después
            return deletedId;
        });
    }

    async clearDatabase() {
        return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => {
                    this.emitter?.emit('clear', { config: this.dbConfig, data: null });
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        });
    }
    static async getAllOrCreate(dbConfig, indexes = []) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbConfig.name, dbConfig.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(dbConfig.store)) {
                    const objectStore = db.createObjectStore(dbConfig.store, { keyPath: 'id' });
                    // Crear índices adicionales si se proporcionan
                    indexes.forEach(index => {
                        objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                    });
                }
            };

            request.onsuccess = () => {
                const db = request.result;

                const transaction = db.transaction([dbConfig.store], 'readonly');
                const store = transaction.objectStore(dbConfig.store);

                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    resolve(getAllRequest.result);
                    db.close();
                };

                getAllRequest.onerror = () => {
                    reject(getAllRequest.error);
                    db.close();
                };
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

async function getAllDataFromDatabase(databaseConfig) {
    if (!databaseConfig || !databaseConfig.name || !databaseConfig.version) {
        console.error("Invalid database configuration:", databaseConfig);
        return [];
    }
    return new Promise((resolve) => {
        const request = indexedDB.open(databaseConfig.name, databaseConfig.version);

        request.onupgradeneeded = (event) => {
            // Crear el almacén de objetos si no existe
            const db = event.target.result;
            if (!db.objectStoreNames.contains(databaseConfig.store)) {
                db.createObjectStore(databaseConfig.store, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;

            // Verificar si el almacén de objetos existe
            if (!db.objectStoreNames.contains(databaseConfig.store)) {
                db.close();
                resolve([]); // Retorna un array vacío si no existe el almacén
                return;
            }

            // Si existe, realizar la transacción para obtener todos los datos
            const transaction = db.transaction([databaseConfig.store], 'readonly');
            const store = transaction.objectStore(databaseConfig.store);

            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
                db.close();
            };

            getAllRequest.onerror = () => {
                resolve([]); // Retorna un array vacío si ocurre un error al leer
                db.close();
            };
        };

        request.onerror = () => {
            resolve([]); // Retorna un array vacío si no se puede abrir la base de datos
        };
    });
}

class Emitter {
    constructor() {
        this.listeners = new Map();
        // Special key for listeners that respond to all events
        this.ALL_EVENTS = Symbol('ALL_EVENTS');
    }

    // Registra un listener que se ejecutará cada vez que se emita el evento
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ callback, once: false });
        // Devuelve una función para remover el listener
        return () => {
            const listeners = this.listeners.get(event);
            if (listeners) {
                this.listeners.set(event, listeners.filter(
                    listener => listener.callback !== callback
                ));
            }
        };
    }

    // Registra un listener que se ejecutará solo una vez
    once(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ callback, once: true });
        // Devuelve una función para remover el listener
        return () => {
            const listeners = this.listeners.get(event);
            if (listeners) {
                this.listeners.set(event, listeners.filter(
                    listener => listener.callback !== callback
                ));
            }
        };
    }

    // Registra un listener que se ejecutará para todos los eventos
    onAny(callback) {
        if (!this.listeners.has(this.ALL_EVENTS)) {
            this.listeners.set(this.ALL_EVENTS, []);
        }
        this.listeners.get(this.ALL_EVENTS).push({ callback, once: false });
        // Devuelve una función para remover el listener
        return () => {
            const listeners = this.listeners.get(this.ALL_EVENTS);
            if (listeners) {
                this.listeners.set(this.ALL_EVENTS, listeners.filter(
                    listener => listener.callback !== callback
                ));
            }
        };
    }

    // Registra un listener que se ejecutará una vez para cualquier evento
    onceAny(callback) {
        if (!this.listeners.has(this.ALL_EVENTS)) {
            this.listeners.set(this.ALL_EVENTS, []);
        }
        this.listeners.get(this.ALL_EVENTS).push({ callback, once: true });
        // Devuelve una función para remover el listener
        return () => {
            const listeners = this.listeners.get(this.ALL_EVENTS);
            if (listeners) {
                this.listeners.set(this.ALL_EVENTS, listeners.filter(
                    listener => listener.callback !== callback
                ));
            }
        };
    }

    // Emite un evento con los datos proporcionados
    emit(event, data) {
        // Primero, ejecutar listeners específicos del evento
        if (this.listeners.has(event)) {
            const listeners = this.listeners.get(event);
            
            // Ejecutar todos los listeners específicos del evento
            listeners.forEach(listener => {
                listener.callback(data);
            });
            
            // Filtrar los listeners de tipo "once" después de ejecutarlos
            this.listeners.set(event, listeners.filter(
                listener => !listener.once
            ));
            
            // Si no quedan listeners, eliminar el evento del Map
            if (this.listeners.get(event).length === 0) {
                this.listeners.delete(event);
            }
        }
        
        // Luego, ejecutar listeners que escuchan todos los eventos
        if (this.listeners.has(this.ALL_EVENTS)) {
            const allListeners = this.listeners.get(this.ALL_EVENTS);
            
            // Ejecutar todos los listeners de ALL_EVENTS con el nombre del evento y los datos
            allListeners.forEach(listener => {
                listener.callback(event, data);
            });
            
            // Filtrar los listeners de tipo "once" después de ejecutarlos
            this.listeners.set(this.ALL_EVENTS, allListeners.filter(
                listener => !listener.once
            ));
            
            // Si no quedan listeners, eliminar el ALL_EVENTS del Map
            if (this.listeners.get(this.ALL_EVENTS).length === 0) {
                this.listeners.delete(this.ALL_EVENTS);
            }
        }
    }
}

const emitter = new Emitter();
export { databases, IndexedDBManager, Emitter, emitter, getAllDataFromDatabase }

// Usage example
// IndexedDBManager.updateData({ name: 'User 1', points: 100 }, 'name');
// IndexedDBManager.saveData({ na,additionalDatame: 'User 1', points: 100 }, 'name');