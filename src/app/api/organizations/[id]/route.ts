import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/organizations/[id] - Get organization details
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

        const organization = await prisma.organization.findUnique({
            where: { id: params.id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                businesses: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        address: true,
                        _count: {
                            select: {
                                branches: true,
                                customers: true,
                            }
                        }
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        },
                        role: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                roles: true,
            }
        })

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            )
        }

        // Check if user has access to this organization
        const hasAccess = organization.ownerId === session.user.id ||
            organization.members.some(m => m.userId === session.user.id && m.status === "ACTIVE")

        if (!hasAccess) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            )
        }

        return NextResponse.json({ organization })
    } catch (error) {
        console.error("[ORGANIZATION_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// PATCH /api/organizations/[id] - Update organization
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
        const { name, type, regNumber, address, phone, email, subscription, settings } = body

        // Check if user is owner
        const organization = await prisma.organization.findUnique({
            where: { id: params.id },
            select: { ownerId: true }
        })

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            )
        }

        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Only organization owner can update" },
                { status: 403 }
            )
        }

        const updated = await prisma.organization.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(regNumber !== undefined && { regNumber }),
                ...(address !== undefined && { address }),
                ...(phone !== undefined && { phone }),
                ...(email !== undefined && { email }),
                ...(subscription && { subscription }),
                ...(settings && { settings }),
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })

        return NextResponse.json({ organization: updated })
    } catch (error) {
        console.error("[ORGANIZATION_PATCH]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// DELETE /api/organizations/[id] - Delete organization
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

        // Check if user is owner
        const organization = await prisma.organization.findUnique({
            where: { id: params.id },
            select: { ownerId: true }
        })

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            )
        }

        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Only organization owner can delete" },
                { status: 403 }
            )
        }

        await prisma.organization.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: "Organization deleted successfully" })
    } catch (error) {
        console.error("[ORGANIZATION_DELETE]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
