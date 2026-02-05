import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// GET /api/businesses/[businessId]/products - List products
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
        const category = searchParams.get('category')
        const search = searchParams.get('search')

        const products = await prisma.product.findMany({
            where: {
                businessId: params.businessId,
                ...(category && { category }),
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { sku: { contains: search, mode: 'insensitive' } },
                        { barcode: { contains: search } },
                    ]
                }),
            },
            include: {
                branchInventory: {
                    select: {
                        branchId: true,
                        stock: true,
                        branch: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json({ products })
    } catch (error) {
        console.error("[PRODUCTS_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/businesses/[businessId]/products - Create product
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
        const {
            name,
            description,
            sku,
            barcode,
            category,
            subcategory,
            costPrice,
            sellingPrice,
            unit,
            taxRate
        } = body

        if (!name || !costPrice || !sellingPrice) {
            return NextResponse.json(
                { error: "Product name, cost price, and selling price are required" },
                { status: 400 }
            )
        }

        // Check if SKU already exists
        if (sku) {
            const existing = await prisma.product.findUnique({
                where: { sku }
            })

            if (existing) {
                return NextResponse.json(
                    { error: "Product with this SKU already exists" },
                    { status: 400 }
                )
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                sku,
                barcode,
                businessId: params.businessId,
                category,
                subcategory,
                costPrice: new Decimal(costPrice),
                sellingPrice: new Decimal(sellingPrice),
                unit: unit || "piece",
                taxRate: taxRate ? new Decimal(taxRate) : null,
            }
        })

        return NextResponse.json(
            { product, message: "Product created successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("[PRODUCTS_POST]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
