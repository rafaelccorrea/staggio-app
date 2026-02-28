import { api } from './api';

export interface RentalDashboardFilters {
  periodMonths?: 6 | 12;
  status?: 'active' | 'pending' | 'expired' | 'cancelled';
  propertyId?: string;
}

export interface RentalDashboardData {
  totalRentals: number;
  activeRentals: number;
  expiredRentals: number;
  pendingRentals: number;
  totalMonthlyRevenue: number;
  paidThisMonth: number;
  pendingThisMonth: number;
  overduePayments: number;
  occupancyRate: number;
  averageRentalValue: number;
  expiringContracts: number;
  recentRentals: Array<{
    id: string;
    tenantName: string;
    propertyAddress: string;
    monthlyValue: number;
    startDate: string;
    status: string;
  }>;
  paymentsByStatus: Array<{
    status: string;
    count: number;
    totalValue: number;
  }>;
  monthlyRevenueChart: Array<{
    month: string;
    revenue: number;
    paid: number;
    pending: number;
  }>;
}

const rentalDashboardService = {
  getDashboard: async (filters?: RentalDashboardFilters): Promise<RentalDashboardData> => {
    const params: Record<string, string> = {};
    if (filters?.periodMonths) params.periodMonths = String(filters.periodMonths);
    if (filters?.status) params.status = filters.status;
    if (filters?.propertyId) params.propertyId = filters.propertyId;
    const response = await api.get<RentalDashboardData>('/rental/dashboard/stats', { params });
    return response.data;
  },
};

export default rentalDashboardService;
