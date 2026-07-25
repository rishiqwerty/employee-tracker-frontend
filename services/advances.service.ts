import { api } from './api';

export interface EmployeeAdvance {
  id: string;
  employee_id: string;
  amount: number;
  advance_date: string; // YYYY-MM-DD
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeAdvanceCreate {
  employee_id: string;
  amount: number;
  advance_date: string;
  notes?: string;
}

export const advancesService = {
  createAdvance: async (data: EmployeeAdvanceCreate): Promise<EmployeeAdvance> => {
    const response = await api.post<EmployeeAdvance>('/advances/', data);
    return response.data;
  },

  getCompanyAdvances: async (
    companyId: string,
    startDate?: string,
    endDate?: string,
    skip = 0,
    limit = 100
  ): Promise<EmployeeAdvance[]> => {
    const response = await api.get<EmployeeAdvance[]>(`/advances/company/${companyId}`, {
      params: { start_date: startDate, end_date: endDate, skip, limit },
    });
    return response.data;
  },
};
