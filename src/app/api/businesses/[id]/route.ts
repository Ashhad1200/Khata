import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/businesses/[id] - Get business details
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

        const business = await prisma.business.findUnique({
            where: { id: params.id },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        ownerId: true,
                    }
                },
                branches: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        status: true,
                        _count: {
                            select: {
                                departments: true,
                                transactions: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        customers: true,
                        products: true,
                        expenses: true,
                    }
                }
            }
        })

        if (!business) {
            return NextResponse.json(
                { error: "Business not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ business })
    } catch (error) {
        console.error("[BUSINESS_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// PATCH /api/businesses/[id] - Update business
export async function PATCH(
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

        const updated = await prisma.business.update({
            where: { id: params.id },
            data: body
        })

        return NextResponse.json({ business: updated })
    } catch (error) {
        console.error("[BUSINESS_PATCH]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// DELETE /api/businesses/[id] - Delete business
export async function DELETE(
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

        await prisma.business.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: "Business deleted successfully" })
    } catch (error) {
        console.error("[BUSINESS_DELETE]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
