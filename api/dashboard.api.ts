import { api } from "@/lib/api";
import { DashboardData } from "@/types/DashboardData";


export const getDashboard = async (): Promise<DashboardData> => {
  const res = await api.get("/dashboard");
  return res.data.data;
};