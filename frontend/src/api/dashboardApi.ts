import axiosClient from "./axiosClient";

export interface DashboardStat { label: string; value: string; trend: string; positive: boolean; }
export interface DashboardData {
  stats: DashboardStat[];
  focus: { title: string; value: string };
  recent_leads: { account: string; contact: string; status: string; value: string; owner: string }[];
  monthly_activity: { label: string; value: number }[];
}

export const getDashboard = () => axiosClient.get<DashboardData>("/api/dashboard/").then(({ data }) => data);
