function exactcompareObjectKeys(obj1, obj2) {
    // Get arrays of keys from both objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    // Check if both arrays have the same length
    if (keys1.length !== keys2.length) {
        return false;
    }
    // Check if all keys from obj1 exist in obj2
    return keys1.every(key => keys2.includes(key));
}

function filterRequiredFields({required, actualObj}) {
    // Validate input parameters
    if (!required || !actualObj) {
        throw new Error('Both required and actualObj parameters must be provided');
    }

    if (typeof actualObj !== 'object' || actualObj === null) {
        throw new Error('actualObj must be a valid object');
    }

    if (!Array.isArray(required) && (typeof required !== 'object' || required === null)) {
        throw new Error('required parameter must be either an array or an object');
    }

    // Create a new object to store filtered fields
    const filteredObj = {};

    // Get required keys - handle both array and object input
    const requiredKeys = Array.isArray(required) ? required : Object.keys(required);

    // Validate that requiredKeys is not empty
    if (requiredKeys.length === 0) {
        throw new Error('required parameter cannot be empty');
    }

    // Validate that all required keys are strings
    if (!requiredKeys.every(key => typeof key === 'string')) {
        throw new Error('All required keys must be strings');
    }

    // Iterate through required keys
    for (const key of requiredKeys) {
        // Check if the key exists in actual object
        if (key in actualObj) {
            // Add the field from actual object to filtered object
            filteredObj[key] = actualObj[key];
        }
    }

    return filteredObj;
}

function validateFields({required, actualObj, options = {}}) {
    // First filter the required fields
    const filteredObj = filterRequiredFields({required, actualObj});
    
    // Initialize validation results
    const validationResults = {
        isValid: true,
        errors: [],
        filteredObj
    };

    // Get required keys
    const requiredKeys = Array.isArray(required) ? required : Object.keys(required);

    // Validate each field according to options
    for (const key of requiredKeys) {
        // Check if field exists
        if (!(key in filteredObj)) {
            validationResults.isValid = false;
            validationResults.errors.push(`Missing required field: ${key}`);
            continue;
        }

        // Check type constraints if specified
        if (options.types && options.types[key]) {
            const expectedType = options.types[key];
            const actualType = typeof filteredObj[key];
            
            if (actualType !== expectedType) {
                validationResults.isValid = false;
                validationResults.errors.push(`Invalid type for ${key}: expected ${expectedType}, got ${actualType}`);
            }
        }

        // Check custom validation functions if specified
        if (options.validators && options.validators[key]) {
            try {
                const isValid = options.validators[key](filteredObj[key]);
                if (!isValid) {
                    validationResults.isValid = false;
                    validationResults.errors.push(`Validation failed for field: ${key}`);
                }
            } catch (error) {
                validationResults.isValid = false;
                validationResults.errors.push(`Validation error for ${key}: ${error.message}`);
            }
        }
    }

    return validationResults;
}

// Example usage tests with valid data
function runValidExamples() {
    // Test Case 1: Basic filtering with array of required fields
    console.log('\nTest Case 1: Basic filtering - Valid data');
    const requiredFields1 = ['name', 'email', 'age'];
    const actualObject1 = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        phone: '123-456-7890' // Extra field that won't be filtered
    };
    console.log('Filtered Result:', filterRequiredFields({
        required: requiredFields1,
        actualObj: actualObject1
    }));

    // Test Case 2: Validation with type checking
    console.log('\nTest Case 2: Validation with type checking - Valid data');
    const requiredFields2 = ['username', 'age', 'isActive'];
    const actualObject2 = {
        username: 'johndoe',
        age: 25, // Correct type - number
        isActive: true
    };
    const options2 = {
        types: {
            username: 'string',
            age: 'number',
            isActive: 'boolean'
        }
    };
    console.log('Validation Result:', validateFields({
        required: requiredFields2,
        actualObj: actualObject2,
        options: options2
    }));

    // Test Case 3: Custom validation functions
    console.log('\nTest Case 3: Custom validation - Valid data');
    const requiredFields3 = ['email', 'password'];
    const actualObject3 = {
        email: 'john.doe@example.com', // Valid email with @
        password: 'SecurePassword123' // Valid password length >= 8
    };
    const options3 = {
        validators: {
            email: (value) => value.includes('@'),
            password: (value) => value.length >= 8
        }
    };
    console.log('Validation Result:', validateFields({
        required: requiredFields3,
        actualObj: actualObject3,
        options: options3
    }));

    // Test Case 4: All required fields present
    console.log('\nTest Case 4: All fields present - Valid data');
    const requiredFields4 = ['name', 'email', 'phone'];
    const actualObject4 = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1-555-123-4567'
    };
    console.log('Validation Result:', validateFields(
        requiredFields4,
        actualObject4
    ));
}

// Run the valid examples
//runValidExamples();
export { exactcompareObjectKeys, filterRequiredFields, validateFields };