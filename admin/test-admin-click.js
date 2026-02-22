const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        await page.goto('http://localhost:5174/account-approvals', { waitUntil: 'networkidle0' });

        // Find and click the green approve button (contains text "Approve")
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const approveBtn = btns.find(b => b.textContent.includes('Approve'));
            if (approveBtn) approveBtn.click();
        });

        await new Promise(r => setTimeout(r, 1000));

        // check if modal is open by checking for its overlay style or text
        const hasModal = await page.evaluate(() => {
            return document.body.innerText.includes('Enter the account details for');
        });

        console.log('Modal visible:', hasModal);

        // Count input/select elements in modal
        const inputs = await page.evaluate(() => {
            return document.querySelectorAll('input, select').length;
        });
        console.log('Inputs found inside page:', inputs);

        await page.screenshot({ path: 'admin-modal-screenshot.png' });
        await browser.close();
    } catch (err) {
        console.error('Puppeteer error:', err);
    }
})();
