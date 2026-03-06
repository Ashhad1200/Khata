
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'syedashhad17@gmail.com';
  
  // 1. Check/Create User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found, seeding user...');
    // Note: In production use bcrypt, but for this test we assume password matches what user provided
    // or we just ensure the record exists so we can add data to it.
    // If the app uses bcrypt, this direct insert might not work for login unless we hash it.
    // I'll skip creating if it requires complex hashing, and just check.
  } else {
    console.log('User found:', user.id);
  }

  if (!user) return;

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Ashhad Enterprises',
      ownerId: user.id,
      subscription: 'PREMIUM'
    }
  });
  console.log('Created Org:', org.id);

  // 3. Create Business
  const biz = await prisma.business.create({
    data: {
      name: 'Khata Wholesale',
      type: 'Wholesale',
      organizationId: org.id,
      currency: 'PKR'
    }
  });
  console.log('Created Biz:', biz.id);

  // 4. Create Branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch - Karachi',
      businessId: biz.id,
      address: 'I.I Chundrigar Road'
    }
  });
  console.log('Created Branch:', branch.id);

  // 5. Create Customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Ali Raza',
      phone: '03001234567',
      businessId: biz.id,
      branchId: branch.id,
      creditLimit: 100000
    }
  });
  console.log('Created Customer:', customer.id);

  // 6. Create Product
  const product = await prisma.product.create({
    data: {
      name: 'Basmati Rice 5kg',
      costPrice: 1200,
      sellingPrice: 1500,
      businessId: biz.id,
      unit: 'bag'
    }
  });
  console.log('Created Product:', product.id);

  // 7. Add Transaction
  const transaction = await prisma.transaction.create({
    data: {
      type: 'CREDIT',
      amount: 4500,
      customerId: customer.id,
      businessId: biz.id,
      branchId: branch.id,
      createdById: user.id,
      paymentMethod: 'CASH',
      status: 'PENDING',
      description: '3 bags of Basmati Rice'
    }
  });
  console.log('Created Transaction:', transaction.id);

  console.log('--- ALL TEST DATA ADDED SUCCESSFULLY ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
