const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApi(name, fn) {
    try {
        console.log(`Testing ${name}...`);
        await fn();
        console.log(`✓ ${name} passed\n`);
    } catch (error) {
        console.error(`✗ ${name} failed:`, error.message, '\n');
    }
}

async function runTests() {
    const email = 'syedashhad17@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        console.error('User not found. Please run seed-test-data.js first.');
        return;
    }

    console.log('--- STARTING COMPREHENSIVE API TEST ---\n');

    // 1. Dashboard Metrics
    await testApi('Dashboard Metrics', async () => {
        const organizations = await prisma.organization.findMany({
            where: { ownerId: user.id },
            include: {
                businesses: {
                    include: {
                        branches: {
                            include: {
                                transactions: {
                                    where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
                                },
                                _count: { select: { transactions: true } }
                            }
                        },
                        _count: { select: { customers: true } }
                    }
                }
            }
        });
        if (!organizations) throw new Error('Failed to fetch dashboard orgs');
        console.log(`  Orgs found: ${organizations.length}`);
    });

    // 2. Organizations API
    await testApi('Organizations List', async () => {
        const orgs = await prisma.organization.findMany({
            where: { ownerId: user.id }
        });
        if (orgs.length === 0) throw new Error('No organizations found');
        console.log(`  Org Name: ${orgs[0].name}`);
    });

    // 3. Customers API
    await testApi('Customers Logic', async () => {
        const biz = await prisma.business.findFirst({
            where: { organization: { ownerId: user.id } }
        });
        if (!biz) throw new Error('Business not found for user');
        
        const customers = await prisma.customer.findMany({
            where: { businessId: biz.id },
            include: { transactions: true }
        });
        if (customers.length === 0) throw new Error('No customers found');
        
        const cust = customers[0];
        const balance = cust.transactions.reduce((acc, tx) => {
            if (tx.type === 'CREDIT') return acc + Number(tx.amount);
            if (tx.type === 'DEBIT') return acc - Number(tx.amount);
            return acc;
        }, 0);
        console.log(`  Customer: ${cust.name}, Calculated Balance: ${balance}`);
    });

    // 4. Transactions API
    await testApi('Transactions Logic', async () => {
        const biz = await prisma.business.findFirst({
            where: { organization: { ownerId: user.id } }
        });
        const txs = await prisma.transaction.findMany({
            where: { businessId: biz.id },
            include: { customer: true }
        });
        console.log(`  Total Transactions: ${txs.length}`);
        if (txs.length > 0) {
            console.log(`  Latest Tx Amount: ${txs[0].amount} (${txs[0].type})`);
        }
    });

    // 5. Inventory API
    await testApi('Inventory Logic', async () => {
        const branch = await prisma.branch.findFirst({
            where: { business: { organization: { ownerId: user.id } } }
        });
        if (!branch) throw new Error('Branch not found');
        
        const inventory = await prisma.branchInventory.findMany({
            where: { branchId: branch.id },
            include: { product: true }
        });
        console.log(`  Inventory Items: ${inventory.length}`);
    });

    // 6. Expenses API
    await testApi('Expenses Logic', async () => {
        const biz = await prisma.business.findFirst({
            where: { organization: { ownerId: user.id } }
        });
        const expenses = await prisma.expense.findMany({
            where: { businessId: biz.id }
        });
        console.log(`  Total Expenses: ${expenses.length}`);
    });

    console.log('--- API LOGIC VERIFICATION COMPLETE ---');
}

runTests()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());