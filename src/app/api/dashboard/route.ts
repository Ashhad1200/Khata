import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDashboardMetrics } from "@/lib/metrics"

// GET /api/dashboard - Dashboard summary statistics
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const metrics = await getDashboardMetrics(session.user.id)

        return NextResponse.json(metrics)
    } catch (error) {
        console.error("Dashboard API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
