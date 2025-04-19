/**
 * @typedef {object} MapSelectOption
 * @property {string} type - The type identifier ('mapselect').
 * @property {*} label - The display label for the select option.
 * @property {*} name - The internal name/key for the select option.
 * @property {*} value - The value associated with the select option.
 * @property {*} [img] - Optional value for an image or other auxiliary data.
 */

/**
 * Creates a standard select option object template.
 * @param {object} options - The properties for the select option.
 * @param {*} options.label - The label.
 * @param {*} options.name - The name.
 * @param {*} options.value - The value.
 * @param {*} [options.img] - Optional image/auxiliary data.
 * @returns {MapSelectOption} The formatted select option object.
 */
function MapselectTemplate(options) {
    return {
        type: 'mapselect',
        label: options.label,
        name: options.name,
        value: options.value,
        // Only include img if it's provided (not null or undefined)
        ...(options.img !== undefined && options.img !== null && { img: options.img })
    };
}

/**
 * Helper to get type and array status of an element.
 * @param {*} elm - The element to check.
 * @returns {{type: string, array: boolean, raw: *}} Information about the element.
 */
function typeofElm(elm) {
    return {
        type: typeof elm,
        array: elm && Array.isArray(elm),
        raw: elm
    };
}

/**
 * Defines the mapping configurations for different data types.
 * Specifies which input key maps to which output key (label, name, value, img).
 * @param {string} name - The identifier for the data type (e.g., "estadoscatalogos").
 * @returns {{labelKey: string, nameKey: string, valueKey: string, imgKey?: string} | null} The configuration for the specified name, or null if not found.
 */
function allMapSelectConfigurations(name) {
    const configs = {
        "estadoscatalogos": {
            labelKey: "nombreEstadoCatalogo",
            nameKey: "idEstadoCatalogo",
            valueKey: "idEstadoCatalogo",
            imgKey: "colorEstadoCatalogo", // Mapping 'img' to 'colorEstadoCatalogo'
        },
        "tiposcatalogos": {
            labelKey: "nombreTipoCatalogo",
            nameKey: "idTipoCatalogo",
            valueKey: "idTipoCatalogo",
            imgKey: null, // No specific key for 'img' in this data type
        },
        // Add more configurations here following the same structure
        /* Example for another type:
        "users": {
            labelKey: "fullName",
            nameKey: "userId",
            valueKey: "userId",
            imgKey: "profilePictureUrl",
        }
        */
    };
    return configs[name] || null;
}

/**
 * Maps an array of data objects to a standard array of select option objects
 * based on a predefined configuration type.
 * @param {string} configName - The name of the configuration to use (e.g., "estadoscatalogos").
 * @param {Array<object>} dataArray - The array of input data objects.
 * @returns {Array<MapSelectOption>} An array of formatted select option objects.
 */
function createSelectOptions(configName, dataArray) {
    const dataInfo = typeofElm(dataArray);

    if (!configName || typeof configName !== 'string') {
        console.error("createSelectOptions: Invalid configuration name provided.", configName);
        return [];
    }

    if (!dataInfo.array) {
        console.error(`createSelectOptions: Input data for "${configName}" is not an array.`, dataInfo.raw);
        return [];
    }

    const config = allMapSelectConfigurations(configName);

    if (!config) {
        console.error(`createSelectOptions: No configuration found for type "${configName}".`);
        return [];
    }

    const selectOptions = [];
    const requiredInputKeys = [config.labelKey, config.nameKey, config.valueKey]; // Keys *required* in the input item

    dataArray.forEach((item, index) => {
        const itemInfo = typeofElm(item);
        if (!itemInfo.type === 'object' || item === null) {
            console.error(`createSelectOptions: Skipping element at index ${index} for "${configName}". Expected object, but received:`, item);
            return; // Skip this element
        }

        // Extract values based on configuration keys
        const labelValue = item[config.labelKey];
        const nameValue = item[config.nameKey];
        const valueValue = item[config.valueKey];
        // Extract img value only if imgKey is defined in config
        const imgValue = config.imgKey ? item[config.imgKey] : undefined;

        // Basic validation for required input keys on the current item
        const missingRequiredKeys = requiredInputKeys.filter(key =>
            key === undefined || key === null || item[key] === undefined || item[key] === null
        );

        if (missingRequiredKeys.length > 0) {
            console.error(`createSelectOptions: Skipping element at index ${index} for "${configName}" due to missing required keys: ${missingRequiredKeys.join(', ')}.`, item);
            return; // Skip this element
        }

        // Create the standardized select option object
        selectOptions.push(MapselectTemplate({
            label: labelValue,
            name: nameValue,
            value: valueValue,
            img: imgValue // Pass undefined/null if imgKey was null or value missing
        }));
    });

    return selectOptions;
}

// --- Example Usage ---
const estadosData = [
    { "idEstadoCatalogo": 1, "nombreEstadoCatalogo": "En emision", "nsfwEstadoCatalogo": 0, "colorEstadoCatalogo": "#592AC2" },
    { "idEstadoCatalogo": 2, "nombreEstadoCatalogo": "Finalizado", "nsfwEstadoCatalogo": 0, "colorEstadoCatalogo": "#28A745" },
    { "idEstadoCatalogo": 3, "nombreEstadoCatalogo": "Pausado", "nsfwEstadoCatalogo": 0, "colorEstadoCatalogo": "#FFC107" },
    // Add one invalid item
    { "idEstadoCatalogo": 4, "nombreEstadoCatalogo": "Dropped", "nsfwEstadoCatalogo": 1 /* Missing colorEstadoCatalogo */ },
    null, // Add a non-object item
    "invalid item"
];

const tiposData = [
    { "idTipoCatalogo": 1, "nombreTipoCatalogo": "Anime", "nsfwTipoCatalogo": 0 },
    { "idTipoCatalogo": 2, "nombreTipoCatalogo": "Manga", "nsfwTipoCatalogo": 0 },
    // Add one missing label
    { "idTipoCatalogo": 3, /* Missing nombreTipoCatalogo */ "nsfwTipoCatalogo": 0 },
];

const invalidData = "this is not an array";

console.log("Mapping Estados Catalogos:", createSelectOptions("estadoscatalogos", estadosData));
console.log("\nMapping Tipos Catalogos:", createSelectOptions("tiposcatalogos", tiposData));
console.log("\nMapping with Invalid Data Type:", createSelectOptions("estadoscatalogos", invalidData));
console.log("\nMapping Unknown Type:", createSelectOptions("unknownType", estadosData));
console.log("\nMapping with null configName:", createSelectOptions(null, estadosData));
export default createSelectOptions;