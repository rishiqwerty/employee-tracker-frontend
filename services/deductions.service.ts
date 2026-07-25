import { api } from './api';

export interface EmployeeDeduction {
  id: string;
  employee_id: string;
  deduction_type: string; // e.g. "UNIFORM"
  amount: number;
  deduction_date: string; // YYYY-MM-DD
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeDeductionCreate {
  employee_id: string;
  deduction_type?: string;
  amount: number;
  deduction_date: string;
  notes?: string;
}

export const deductionsService = {
  createDeduction: async (data: EmployeeDeductionCreate): Promise<EmployeeDeduction> => {
    const response = await api.post<EmployeeDeduction>('/deductions/', data);
    return response.data;
  },

  getCompanyDeductions: async (
    companyId: string,
    startDate?: string,
    endDate?: string,
    skip = 0,
    limit = 100
  ): Promise<EmployeeDeduction[]> => {
    const response = await api.get<EmployeeDeduction[]>(`/deductions/company/${companyId}`, {
      params: { start_date: startDate, end_date: endDate, skip, limit },
    });
    return response.data;
  },
};
