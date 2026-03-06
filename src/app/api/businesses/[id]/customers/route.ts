import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/businesses/[businessId]/customers - List customers
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const branchId = searchParams.get('branchId')
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const where = {
            businessId: params.id,
            ...(status && { status }),
            ...(branchId && { branchId }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as any } },
                    { phone: { contains: search, mode: 'insensitive' as any } },
                    { email: { contains: search, mode: 'insensitive' as any } },
                ]
            }),
        }

        const [customersData, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                include: {
                    branch: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    transactions: {
                        select: {
                            amount: true,
                            type: true,
                        }
                    },
                    _count: {
                        select: {
                            transactions: true,
                            invoices: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip
            }),
            prisma.customer.count({ where })
        ])

        // Calculate current balance for each customer
        const customers = customersData.map(customer => {
            const currentBalance = customer.transactions.reduce((acc, tx) => {
                if (tx.type === 'CREDIT') return acc + Number(tx.amount)
                if (tx.type === 'DEBIT') return acc - Number(tx.amount)
                return acc
            }, 0)

            // Remove transactions from response to keep it light
            const { transactions, ...customerWithoutTransactions } = customer
            return {
                ...customerWithoutTransactions,
                currentBalance
            }
        })

        return NextResponse.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error("[CUSTOMERS_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/businesses/[businessId]/customers - Add customer
export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, phone, email, address, branchId, creditLimit, customerType, status } = body

        if (!name || !phone) {
            return NextResponse.json(
                { error: "Customer name and phone are required" },
                { status: 400 }
            )
        }

        // Check if phone already exists for this business
        const existing = await prisma.customer.findFirst({
            where: {
                businessId: params.id,
                phone
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: "Customer with this phone number already exists" },
                { status: 400 }
            )
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                phone,
                email,
                address,
                businessId: params.id,
                branchId,
                creditLimit,
                customerType: customerType || "RETAIL",
                status: status || "ACTIVE",
            },
            include: {
                branch: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return NextResponse.json(
            { customer, message: "Customer created successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("[CUSTOMERS_POST]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
