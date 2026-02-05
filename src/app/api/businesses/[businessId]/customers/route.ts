import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/businesses/[businessId]/customers - List customers
export async function GET(
    request: Request,
    { params }: { params: { businessId: string } }
) {
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

        const customers = await prisma.customer.findMany({
            where: {
                businessId: params.businessId,
                ...(status && { status }),
                ...(branchId && { branchId }),
            },
            include: {
                branch: {
                    select: {
                        id: true,
                        name: true,
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
            }
        })

        return NextResponse.json({ customers })
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
    { params }: { params: { businessId: string } }
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
                businessId: params.businessId,
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
                businessId: params.businessId,
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
