import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string
    description?: string
    icon: LucideIcon
    trend?: string
    trendColor?: "green" | "red" | "yellow"
}

export function StatsCard({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    trendColor = "green" 
}: StatsCardProps) {
    const trendClass = {
        green: "text-green-600",
        red: "text-red-600",
        yellow: "text-yellow-600"
    }[trendColor]

    return (
        <Card className="hover:shadow-md transition-shadow overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
                <div className="p-2 bg-primary/5 rounded-full">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
                {trend && (
                    <p className={`text-xs mt-2 font-medium ${trendClass}`}>
                        {trend}
                    </p>
                )}
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/10" />
        </Card>
    )
}
