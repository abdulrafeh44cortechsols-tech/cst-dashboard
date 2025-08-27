"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import type { Editor } from "@/types/types"

interface TeamOverviewProps {
  editors: Editor[]
}

export function TeamOverview({ editors }: TeamOverviewProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Team Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="font-medium">{editors.length}</span>
            <span className="text-muted-foreground ml-1">Total Editors</span>
          </div>
          <div>
            <span className="font-medium">0</span>
            <span className="text-muted-foreground ml-1">Managing Editors</span>
          </div>
          <div>
            <span className="font-medium">0</span>
            <span className="text-muted-foreground ml-1">Senior Editors</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
