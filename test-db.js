const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        await prisma.$connect()
        console.log('✅ Successfully connected to database!')

        // Try a simple query
        const result = await prisma.$queryRaw`SELECT version();`
        console.log('Database version:', result)

    } catch (error) {
        console.error('❌ Error connecting to database:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
