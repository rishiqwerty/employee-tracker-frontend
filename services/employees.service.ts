import { api } from './api';

export interface Employee {
  id: string;
  company_id: string;
  employee_code: string;
  full_name: string;
  father_name: string | null;
  phone: string;
  alternate_phone: string | null;
  pan: string | null;
  aadhaar: string | null;
  dob: string | null;
  address: string | null;
  joining_date: string;
  bank_account: string | null;
  ifsc: string | null;
  upi: string | null;
  emergency_contact: string | null;
  photo_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type EmployeeCreate = Omit<Employee, 'id' | 'company_id' | 'created_at' | 'updated_at'>;
export type EmployeeUpdate = Partial<EmployeeCreate>;

export const employeesService = {
  getEmployees: async (companyId: string, skip = 0, limit = 100): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/companies/${companyId}/employees/`, {
      params: { skip, limit },
    });
    return response.data;
  },

  createEmployee: async (companyId: string, data: EmployeeCreate): Promise<Employee> => {
    const response = await api.post<Employee>(`/companies/${companyId}/employees/`, data);
    return response.data;
  },

  updateEmployee: async (companyId: string, employeeId: string, data: EmployeeUpdate): Promise<Employee> => {
    const response = await api.patch<Employee>(`/companies/${companyId}/employees/${employeeId}`, data);
    return response.data;
  },
};
