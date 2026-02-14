const { validateAadhaar } = require('./src/utils/aadhaarValidator');

const testAadhaar = '378282246310';
const result = validateAadhaar(testAadhaar);

console.log(`Aadhaar: ${testAadhaar}`);
console.log(`IsValid: ${result}`);

if (!result) {
    console.log('Searching for valid Aadhaar...');
    // Brute force check nearby numbers? Or implement generation loop
    // Verhoeff check digit calculation

    // Just try to find one valid one using the validator
    let seed = 999999990000;
    for (let i = 0; i < 10000; i++) {
        let candidate = (seed + i).toString();
        if (validateAadhaar(candidate)) {
            console.log(`Found valid: ${candidate}`);
            break;
        }
    }
}
