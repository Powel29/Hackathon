const bcrypt = require('bcryptjs');
require('dotenv').config();
const prisma = require('../src/config/prisma');


const ADMINS = [
    {
        departmentId: 'SUPER-ADMIN-000',
        name: 'Super Admin',
        email: 'admin@suvidha.gov.in',
        password: 'admin@123',   // ← change before production
        department: 'all',
        role: 'super_admin',
        avatar: 'SA',
    },
    {
        departmentId: 'ELEC-ADMIN-001',
        name: 'Electricity Admin',
        email: 'elec@suvidha.gov.in',
        password: 'admin@123',
        department: 'electricity',
        role: 'dept_admin',
        avatar: 'EA',
    },
    {
        departmentId: 'WATER-ADMIN-002',
        name: 'Water Admin',
        email: 'water@suvidha.gov.in',
        password: 'admin@123',
        department: 'water',
        role: 'dept_admin',
        avatar: 'WA',
    },
    {
        departmentId: 'GAS-ADMIN-003',
        name: 'Gas Admin',
        email: 'gas@suvidha.gov.in',
        password: 'admin@123',
        department: 'gas',
        role: 'dept_admin',
        avatar: 'GA',
    },
    {
        departmentId: 'MUNI-ADMIN-004',
        name: 'Municipal Admin',
        email: 'muni@suvidha.gov.in',
        password: 'admin@123',
        department: 'municipal',
        role: 'dept_admin',
        avatar: 'MA',
    },
];

async function main() {
    for (const admin of ADMINS) {
        const passwordHash = await bcrypt.hash(admin.password, 12);
        const { password, ...data } = admin;

        const result = await prisma.admin.upsert({
            where: { departmentId: data.departmentId },
            update: { passwordHash },   // only update hash if re-run
            create: { ...data, passwordHash },
        });
        console.log(`✅  Seeded admin: ${result.name} (${result.departmentId})`);
    }

    console.log('\nAll admins seeded successfully.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
