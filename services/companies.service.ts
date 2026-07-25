import { api } from './api';

export interface Company {
  id: string;
  company_name: string;
  registration_number: string | null;
  gst_number: string | null;
  address: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CompanyCreate = Omit<Company, 'id' | 'created_at' | 'updated_at'>;
export type CompanyUpdate = Partial<CompanyCreate>;

export const companiesService = {
  getCompanies: async (skip = 0, limit = 100): Promise<Company[]> => {
    const response = await api.get<Company[]>('/companies/', {
      params: { skip, limit },
    });
    return response.data;
  },

  createCompany: async (data: CompanyCreate): Promise<Company> => {
    const response = await api.post<Company>('/companies/', data);
    return response.data;
  },

  updateCompany: async (id: string, data: CompanyUpdate): Promise<Company> => {
    const response = await api.patch<Company>(`/companies/${id}`, data);
    return response.data;
  },
};
