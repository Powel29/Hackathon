// Mock Aadhaar Database (30 test entries)
const mockAadhaarDB = {
    '378282246310': {  // Valid Verhoeff
        fullName: 'Rajesh Kumar',
        dateOfBirth: '1985-05-15',
        gender: 'Male',
        address: '123, MG Road, Koramangala, Bangalore - 560034',
        mobileNumber: '9876543210'
    },
    '371449635398': {  // Valid Verhoeff
        fullName: 'Priya Sharma',
        dateOfBirth: '1990-08-20',
        gender: 'Female',
        address: '456, Park Street, Indiranagar, Bangalore - 560038',
        mobileNumber: '9876543211'
    },
    '378734493671': {  // Valid Verhoeff
        fullName: 'Arjun Singh',
        dateOfBirth: '1995-03-10',
        gender: 'Male',
        address: '789, Lake View, JP Nagar, Bangalore - 560078',
        mobileNumber: '9876543212'
    },
    // Add 27 more valid Verhoeff Aadhaar numbers...
};

/**
 * Fetch mock Aadhaar details
 */
function mockAadhaarFetch(aadhaar) {
    // Return from mock DB if exists
    if (mockAadhaarDB[aadhaar]) {
        return mockAadhaarDB[aadhaar];
    }

    // Generate deterministic data for testing
    const seed = parseInt(aadhaar.slice(0, 8));
    const names = ['Amit Kumar', 'Sneha Patel', 'Vikram Reddy', 'Anjali Nair', 'Rahul Sharma', 'Pooja Singh'];

    return {
        fullName: names[seed % names.length],
        dateOfBirth: new Date(1970 + (seed % 40), (seed % 12), 1 + (seed % 28))
            .toISOString().split('T')[0],
        gender: seed % 2 === 0 ? 'Male' : 'Female',
        address: `${seed % 999}, Demo Street, Test Area, Bangalore - ${560001 + (seed % 100)}`,
        mobileNumber: null  // Must be provided by user
    };
}

module.exports = {
    mockAadhaarFetch,
    mockAadhaarDB  // Export for testing
};
