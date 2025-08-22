import DashboardWidget from "@/components/dashboard/DashboardWidget";
import QuickDraft from "@/components/dashboard/QuickDraft";
import RecentPosts from "@/components/dashboard/RecentPosts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockEditors } from "@/data/mockEditorsList";
import { Users, FileText, BookOpen, Briefcase } from "lucide-react";
import {services} from "@/data/mockServicesList"

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              {"+20.1%"} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30</div>
            <p className="text-xs text-muted-foreground">
              {"+15%"} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Services
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              {"+8%"} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEditors.length}</div>
            <p className="text-xs text-muted-foreground">
              {"+5%"} from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="text-lg font-bold">
          <p>Overview & Updates</p>
        </CardHeader>
        <CardContent>
          {/* Dashboard Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <DashboardWidget title="Recent Posts">
                <RecentPosts />
              </DashboardWidget>
            </div>

            <div className="space-y-6">
              <DashboardWidget title="Quick Draft">
                <QuickDraft />
              </DashboardWidget>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
