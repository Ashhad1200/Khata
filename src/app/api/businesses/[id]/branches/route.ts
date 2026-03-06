import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/businesses/[id]/branches - List branches
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

        const branches = await prisma.branch.findMany({
            where: {
                businessId: params.id
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                _count: {
                    select: {
                        departments: true,
                        inventory: true,
                        transactions: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ branches })
    } catch (error) {
        console.error("[BRANCHES_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/businesses/[id]/branches - Create branch
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
        const { name, address, phone, managerId, status } = body

        if (!name) {
            return NextResponse.json(
                { error: "Branch name is required" },
                { status: 400 }
            )
        }

        const branch = await prisma.branch.create({
            data: {
                name,
                address,
                phone,
                managerId,
                status: status || "ACTIVE",
                businessId: params.id,
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })

        return NextResponse.json(
            { branch, message: "Branch created successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("[BRANCHES_POST]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
