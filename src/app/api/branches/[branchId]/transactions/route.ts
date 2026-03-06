import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// GET /api/branches/[branchId]/transactions - List transactions
// GET /api/branches/[branchId]/transactions - List transactions
export async function GET(
    request: Request,
    props: { params: Promise<{ branchId: string }> }
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
        const customerId = searchParams.get('customerId')
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const transactions = await prisma.transaction.findMany({
            where: {
                branchId: params.branchId,
                ...(customerId && { customerId }),
                ...(type && { type }),
                ...(status && { status }),
                ...(startDate && endDate && {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                }),
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })

        return NextResponse.json({ transactions })
    } catch (error) {
        console.error("[TRANSACTIONS_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/branches/[branchId]/transactions - Create transaction
// POST /api/branches/[branchId]/transactions - Create transaction
export async function POST(
    request: Request,
    props: { params: Promise<{ branchId: string }> }
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
        const {
            type,
            customerId,
            businessId,
            departmentId,
            amount,
            description,
            referenceNumber,
            paymentMethod,
            status,
            dueDate,
            items
        } = body

        if (!type || !customerId || !businessId || !amount || !paymentMethod) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Create transaction with items
        const transaction = await prisma.transaction.create({
            data: {
                type,
                customerId,
                businessId,
                branchId: params.branchId,
                departmentId,
                amount: new Decimal(amount),
                description,
                referenceNumber,
                paymentMethod,
                status: status || "COMPLETED",
                dueDate: dueDate ? new Date(dueDate) : null,
                createdById: session.user.id,
                ...(items && {
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            description: item.description,
                            quantity: new Decimal(item.quantity),
                            unitPrice: new Decimal(item.unitPrice),
                            totalPrice: new Decimal(item.totalPrice),
                            taxAmount: item.taxAmount ? new Decimal(item.taxAmount) : null,
                        }))
                    }
                })
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    }
                },
                items: true
            }
        })

        return NextResponse.json(
            { transaction, message: "Transaction created successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("[TRANSACTIONS_POST]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
