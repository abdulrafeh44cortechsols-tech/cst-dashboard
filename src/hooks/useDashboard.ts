import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard";

export function useDashboard() {
    const dashboardStats = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: dashboardService.getDashboardStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
    });

    return {
        dashboardStats,
    };
}
