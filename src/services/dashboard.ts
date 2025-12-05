import api from "@/lib/api";

export interface DashboardItem {
    id: number;
    title: string;
    is_published: boolean;
    created_at: string;
}

export interface DashboardStats {
    services: {
        total: number;
        published: number;
        recent: DashboardItem[];
    };
    blogs: {
        total: number;
        published: number;
        recent: DashboardItem[];
    };
    projects: {
        total: number;
        published: number;
        recent: DashboardItem[];
    };
    industries: {
        total: number;
        published: number;
        recent: DashboardItem[];
    };
    total_editors: number;
    active_editors: number;
    system_status: {
        total_media: number;
        published_content: number;
        total_editors: number;
    };
}

export const dashboardService = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await api.get("/api/v1/sols-dashboard/");
        return response.data;
    },
};
