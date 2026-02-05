import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/customers/[id] - Get customer details with balance
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const customer = await prisma.customer.findUnique({
            where: { id: params.id },
            include: {
                business: {
                    select: {
                        id: true,
                        name: true,
                        currency: true,
                    }
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                transactions: {
                    take: 10,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        id: true,
                        type: true,
                        amount: true,
                        description: true,
                        status: true,
                        createdAt: true,
                    }
                },
                invoices: {
                    where: {
                        status: {
                            in: ['SENT', 'OVERDUE']
                        }
                    },
                    select: {
                        id: true,
                        invoiceNumber: true,
                        totalAmount: true,
                        balanceAmount: true,
                        status: true,
                        dueDate: true,
                    }
                }
            }
        })

        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 }
            )
        }

        // Calculate current balance
        const balanceResult = await prisma.transaction.aggregate({
            where: {
                customerId: params.id,
                status: 'COMPLETED'
            },
            _sum: {
                amount: true
            }
        })

        const currentBalance = balanceResult._sum.amount || 0

        return NextResponse.json({
            customer: {
                ...customer,
                currentBalance
            }
        })
    } catch (error) {
        console.error("[CUSTOMER_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// PATCH /api/customers/[id] - Update customer
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()

        const updated = await prisma.customer.update({
            where: { id: params.id },
            data: body
        })

        return NextResponse.json({ customer: updated })
    } catch (error) {
        console.error("[CUSTOMER_PATCH]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Check if customer has transactions
        const transactionCount = await prisma.transaction.count({
            where: { customerId: params.id }
        })

        if (transactionCount > 0) {
            return NextResponse.json(
                { error: "Cannot delete customer with existing transactions" },
                { status: 400 }
            )
        }

        await prisma.customer.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: "Customer deleted successfully" })
    } catch (error) {
        console.error("[CUSTOMER_DELETE]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
