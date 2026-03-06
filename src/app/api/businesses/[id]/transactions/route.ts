import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "50")
        const skip = (page - 1) * limit

        // Verify business access
        const business = await prisma.business.findUnique({
            where: { id: params.id },
            include: {
                organization: {
                    include: {
                        members: {
                            where: {
                                user: { email: session.user.email },
                                status: "ACTIVE"
                            }
                        }
                    }
                }
            }
        })

        if (!business || business.organization.members.length === 0) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 })
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    branch: {
                        businessId: params.id
                    }
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true
                        }
                    },
                    branch: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    sku: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip
            }),
            prisma.transaction.count({
                where: {
                    branch: {
                        businessId: params.id
                    }
                }
            })
        ])

        return NextResponse.json({
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("Error fetching transactions:", error)
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        )
    }
}

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Verify business access
        const business = await prisma.business.findUnique({
            where: { id: params.id },
            include: {
                organization: {
                    include: {
                        members: {
                            where: {
                                userId: user.id,
                                status: "ACTIVE"
                            }
                        }
                    }
                },
                branches: {
                    take: 1,
                    orderBy: { createdAt: "asc" }
                }
            }
        })

        if (!business || business.organization.members.length === 0) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 })
        }

        if (business.branches.length === 0) {
            return NextResponse.json(
                { error: "No branches found for this business" },
                { status: 400 }
            )
        }

        const body = await request.json()
        const {
            type,
            customerId,
            amount,
            description,
            paymentMethod,
            referenceNumber,
            dueDate,
            items = []
        } = body

        // Validate required fields
        if (!type || !customerId || !amount || !paymentMethod) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Use the first/main branch for this business
        const branchId = business.branches[0].id

        // Create transaction with items
        const transaction = await prisma.transaction.create({
            data: {
                type,
                customerId,
                businessId: params.id,
                branchId,
                amount: parseFloat(amount),
                description,
                paymentMethod,
                referenceNumber,
                dueDate: dueDate ? new Date(dueDate) : null,
                createdById: user.id,
                status: "COMPLETED",
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId || null,
                        description: item.description || item.name,
                        quantity: parseFloat(item.quantity),
                        unitPrice: parseFloat(item.unitPrice),
                        totalPrice: parseFloat(item.totalPrice),
                        taxAmount: item.taxAmount ? parseFloat(item.taxAmount) : null
                    }))
                }
            },
            include: {
                customer: true,
                branch: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })

        return NextResponse.json(transaction, { status: 201 })

    } catch (error) {
        console.error("Error creating transaction:", error)
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        )
    }
}
