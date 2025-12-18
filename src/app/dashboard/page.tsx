"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  BookOpen,
  Briefcase,
  ImageIcon,
  Plus,
  Calendar,
  Eye,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { dashboardStats } = useDashboard();

  // Get data from API
  const stats = dashboardStats.data;
  const isLoading = dashboardStats.isLoading;

  // Get recent items (already limited to 5 from API)
  const recentBlogs = stats?.blogs.recent || [];
  const recentServices = stats?.services.recent || [];
  const recentProjects = stats?.projects.recent || [];
  const recentIndustries = stats?.industries.recent || [];

  // Get stats from API
  const totalBlogs = stats?.blogs.total || 0;
  const publishedBlogs = stats?.blogs.published || 0;
  const totalServices = stats?.services.total || 0;
  const publishedServices = stats?.services.published || 0;
  const totalProjects = stats?.projects.total || 0;
  const publishedProjects = stats?.projects.published || 0;
  const totalIndustries = stats?.industries.total || 0;
  const publishedIndustries = stats?.industries.published || 0;
  const totalEditors = stats?.total_editors || 0;
  const activeEditors = stats?.active_editors || 0;
  const totalMediaFiles = stats?.system_status.total_media || 0;
  const publishedContent = stats?.system_status.published_content || 0;

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Published' : 'Draft';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats Cards */}
      <div className={`grid gap-4 md:gap-8 ${user?.userType === "admin" ? "sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nowrap">Total Blogs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBlogs}</div>
            <p className="text-xs text-muted-foreground">
              {publishedBlogs} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nowrap">
              Total Services
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {publishedServices} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nowrap">
              Total Projects
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {publishedProjects} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nowrap">
              Total Industries
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIndustries}</div>
            <p className="text-xs text-muted-foreground">
              {publishedIndustries} published
            </p>
          </CardContent>
        </Card>
        {/* {user?.userType === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-nowrap">Total Editors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEditors}</div>
              <p className="text-xs text-muted-foreground">
                {activeEditors} active
              </p>
            </CardContent>
          </Card>
        )} */}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Blogs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-nowrap">Recent Blogs</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/blogs')}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBlogs.length > 0 ? (
                  recentBlogs.map((blog) => (
                    <div key={blog.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{blog.title}</h4>
                        <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className={`px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(blog.is_published)}`}>
                            {getStatusText(blog.is_published)}
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {formatDate(blog.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => router.push(`/dashboard/blogs/${blog.id}/edit`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2" />
                    <p>No blogs yet</p>
                    <Button
                      variant="blue"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push('/dashboard/blogs/new')}
                    >
                      <Plus className=" h-4 w-4" />
                      Create Blog
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Services */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-nowrap">Recent Services</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/services')}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentServices.length > 0 ? (
                  recentServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{service.title}</h4>
                        <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className={`px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(service.is_published)}`}>
                            {getStatusText(service.is_published)}
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {formatDate(service.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2" />
                    <p>No services yet</p>
                    <Button
                      variant="blue"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push('/dashboard/services/new')}
                    >
                      <Plus className=" h-4 w-4" />
                      Create Service
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-nowrap">Recent Projects</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/projects')}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{project.title}</h4>
                        <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className={`px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(project.is_published)}`}>
                            {getStatusText(project.is_published)}
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {formatDate(project.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => router.push(`/dashboard/projects/${project.id}/edit`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2" />
                    <p>No projects yet</p>
                    <Button
                      variant="blue"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push('/dashboard/projects/new')}
                    >
                      <Plus className=" h-4 w-4" />
                      Create Project
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Industries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Industries</CardTitle>
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => router.push('/dashboard/industries')}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIndustries.length > 0 ? (
                  recentIndustries.map((industry) => (
                    <div key={industry.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{industry.title}</h4>
                        <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className={`px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(industry.is_published)}`}>
                            {getStatusText(industry.is_published)}
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {formatDate(industry.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => router.push(`/dashboard/industries/${industry.id}/edit`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>No industries yet</p>
                    <Button
                      variant="blue"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push('/dashboard/industries/new')}
                    >
                      <Plus className=" h-4 w-4" />
                      Create Industry
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Available to both admin and editor */}
              <Button
                className="w-full justify-start"
                variant="blue"
                onClick={() => router.push('/dashboard/blogs/new')}
              >
                <Plus className=" h-4 w-4" />
                New Blog
              </Button>
              <Button
                className="w-full justify-start"
                variant="blue"
                onClick={() => router.push('/dashboard/services/new')}
              >
                <Plus className=" h-4 w-4" />
                New Service
              </Button>
              <Button
                className="w-full justify-start"
                variant="blue"
                onClick={() => router.push('/dashboard/projects/new')}
              >
                <Plus className=" h-4 w-4" />
                New Project
              </Button>
              <Button
                className="w-full justify-start"
                variant="blue"
                onClick={() => router.push('/dashboard/industries/new')}
              >
                <Plus className=" h-4 w-4" />
                New Industry
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Media Files</span>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{totalMediaFiles}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Editors</span>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{activeEditors}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published Content</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{publishedContent}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
//         </div >
//       </div >
//     </div >
//   );
// }