const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream('output.txt'));

        const documentData = {
            citizenId: '111122223333',
            department: 'municipal',
            relatedEntity: 'BILL',
            relatedId: 'b55b5555-5555-4555-8555-555555555555',
            documentType: 'PAYMENT_RECEIPT'
        };

        Object.keys(documentData).forEach(key => {
            if (documentData[key]) {
                formData.append(key, documentData[key]);
            }
        });

        const response = await axios.post('http://localhost:5000/api/upload', formData, {
            headers: formData.getHeaders()
        });

        console.log("Success:", response.data);
    } catch (err) {
        console.error("Failed:", err.response?.data || err.message);
    }
}

testUpload();
