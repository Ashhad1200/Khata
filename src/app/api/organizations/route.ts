import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/organizations - List user's organizations
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const organizations = await prisma.organization.findMany({
            where: {
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
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                _count: {
                    select: {
                        businesses: true,
                        members: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ organizations })
    } catch (error) {
        console.error("[ORGANIZATIONS_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/organizations - Create new organization
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, type, regNumber, address, phone, email, subscription } = body

        if (!name) {
            return NextResponse.json(
                { error: "Organization name is required" },
                { status: 400 }
            )
        }

        // Create organization with owner
        const organization = await prisma.organization.create({
            data: {
                name,
                type,
                regNumber,
                address,
                phone,
                email,
                subscription: subscription || "FREE",
                ownerId: session.user.id,
                // Create default OWNER role
                roles: {
                    create: {
                        name: "OWNER",
                        permissions: ["*"], // All permissions
                    }
                }
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                roles: true,
            }
        })

        // Add owner as an organization member with OWNER role
        const ownerRole = organization.roles.find(role => role.name === "OWNER")

        if (ownerRole) {
            await prisma.organizationMember.create({
                data: {
                    organizationId: organization.id,
                    userId: session.user.id,
                    roleId: ownerRole.id,
                    status: "ACTIVE",
                    joinedAt: new Date(),
                }
            })
        }

        return NextResponse.json(
            { organization, message: "Organization created successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("[ORGANIZATIONS_POST]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
