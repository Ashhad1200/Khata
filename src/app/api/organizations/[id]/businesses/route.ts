import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/organizations/[id]/businesses - List businesses in organization
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

        // Check access to organization
        const hasAccess = await prisma.organization.findFirst({
            where: {
                id: params.id,
                OR: [
                    { ownerId: session.user.id },
                    {
                        members: {
                            some: {
                                userId: session.user.id,
                                status: "ACTIVE"
                            }
                        }
                    }
                ]
            }
        })

        if (!hasAccess) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            )
        }

        const businesses = await prisma.business.findMany({
            where: {
                organizationId: params.id
            },
            include: {
                _count: {
                    select: {
                        branches: true,
                        customers: true,
                        products: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ businesses })
    } catch (error) {
        console.error("[BUSINESSES_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/organizations/[id]/businesses - Create business under organization
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

        // Check access to organization
        const hasAccess = await prisma.organization.findFirst({
            where: {
                id: params.id,
                OR: [
                    { ownerId: session.user.id },
                    {
                        members: {
                            some: {
                                userId: session.user.id,
                                status: "ACTIVE"
                            }
                        }
                    }
                ]
            }
        })

        if (!hasAccess) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { name, type, address, phone, logoUrl, currency, timezone, language, taxNumber, gstNumber } = body

        if (!name || !type) {
            return NextResponse.json(
                { error: "Business name and type are required" },
                { status: 400 }
            )
        }

        const business = await prisma.business.create({
            data: {
                name,
                type,
                organizationId: params.id,
                address,
                phone,
                logoUrl,
                currency: currency || "PKR",
                timezone: timezone || "Asia/Karachi",
                language: language || "en",
                taxNumber,
                gstNumber,
            }
        })

        return NextResponse.json(
            { business, message: "Business created successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("[BUSINESSES_POST]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
