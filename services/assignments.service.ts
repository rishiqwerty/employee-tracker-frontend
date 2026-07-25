import { api } from './api';

export interface EmployeeSiteHistory {
  id: string;
  employee_id: string;
  site_id: string;
  job_role_id: string;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeTransfer {
  site_id: string;
  job_role_id: string;
  effective_from: string;
}

export const assignmentsService = {
  getActiveAssignment: async (employeeId: string): Promise<EmployeeSiteHistory | null> => {
    try {
      const response = await api.get<EmployeeSiteHistory>(`/assignments/${employeeId}/active`);
      return response.data;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  transferEmployee: async (employeeId: string, data: EmployeeTransfer): Promise<EmployeeSiteHistory> => {
    const response = await api.post<EmployeeSiteHistory>(`/assignments/${employeeId}/transfer`, data);
    return response.data;
  },

  getCompanyActiveAssignments: async (companyId: string): Promise<EmployeeSiteHistory[]> => {
    const response = await api.get<EmployeeSiteHistory[]>(`/assignments/company/${companyId}/active`);
    return response.data;
  },

  getEmployeeHistory: async (employeeId: string): Promise<EmployeeSiteHistory[]> => {
    const response = await api.get<EmployeeSiteHistory[]>(`/assignments/${employeeId}/history`);
    return response.data;
  },
};
