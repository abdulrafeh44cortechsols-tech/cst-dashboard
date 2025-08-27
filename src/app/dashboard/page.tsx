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
  ArrowRight
} from "lucide-react";
import { useBlogStore, useServiceStore, useEditorStore, usePageStore, useMediaStore } from "@/stores";
import { useBlogs } from "@/hooks/useBlogs";
import { useServices } from "@/hooks/useServices";
import { useEditors } from "@/hooks/useEditors";
import { usePages } from "@/hooks/usePages";
import { useMedia } from "@/hooks/useMedia";
import { useRouter } from "next/navigation";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { blogs } = useBlogStore();
  const { services } = useServiceStore();
  const { editors } = useEditorStore();
  const { pages } = usePageStore();
  const { media } = useMediaStore();
  
  // Fetch all data when dashboard loads
  useBlogs(1, 1000);
  useServices();
  useEditors();
  usePages();
  useMedia();

  // Get recent items (last 5)
  const recentBlogs = blogs.slice(0, 5);
  const recentServices = services.slice(0, 5);
  const recentPages = pages.slice(0, 5);

  // Calculate stats
  const publishedBlogs = blogs.filter(blog => blog.published).length;
  const publishedServices = services.filter(service => service.is_active).length;
  const publishedPages = pages.filter(page => page.is_published).length;

  // Get media stats
  const totalMediaFiles = media?.data ? 
    Object.values(media.data).reduce((total, files) => total + (Array.isArray(files) ? files.length : 0), 0) : 0;

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

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats Cards - Keep as is */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages ? pages.length : '--'}</div>
            <p className="text-xs text-muted-foreground">
              {publishedPages} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedBlogs} published
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
              {publishedServices} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Editors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{editors.length}</div>
            <p className="text-xs text-muted-foreground">
              {editors.filter(editor => editor.is_active).length} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Blogs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Blogs</CardTitle>
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
                    <div key={blog.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm truncate">{blog.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className={`px-2 py-1 rounded-full ${getStatusColor(blog.published)}`}>
                            {getStatusText(blog.published)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(blog.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/blogs`)}
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
                      <Plus className="mr-2 h-4 w-4" />
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
              <CardTitle className="text-lg">Recent Services</CardTitle>
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
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm truncate">{service.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className={`px-2 py-1 rounded-full ${getStatusColor(service.is_active)}`}>
                            {getStatusText(service.is_active)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(service.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/services`)}
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
                      <Plus className="mr-2 h-4 w-4" />
                      Create Service
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
              <Button 
                className="w-full justify-start" 
                variant="blue"
                onClick={() => router.push('/dashboard/pages/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Page
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="blue"
                onClick={() => router.push('/dashboard/blogs/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Blog
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="blue"
                onClick={() => router.push('/dashboard/services/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Service
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="blue"
                onClick={() => router.push('/dashboard/media')}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload Media
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
                  <span className="font-medium">{editors.filter(editor => editor.is_active).length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published Content</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{publishedBlogs + publishedServices + publishedPages}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPages.length > 0 ? (
                  recentPages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{page.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className={`px-2 py-1 rounded-full ${getStatusColor(page.is_published)}`}>
                            {getStatusText(page.is_published)}
                          </span>
                          <span className="truncate">{page.template}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/pages`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm">No pages yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
