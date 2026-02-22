require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.accountRequest.findMany({ include: { citizen: { select: { fullName: true, mobileNumber: true } } } })
    .then(r => { console.log('AccountRequests count:', r.length); console.log(JSON.stringify(r, null, 2)); })
    .catch(e => console.error('ERROR:', e.message))
    .finally(() => p.$disconnect());
