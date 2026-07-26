import { api } from './api';

export interface Site {
  id: string;
  company_id: string;
  name: string;
  address: string;
  city: string
  state: string
  contact_person: string | null;
  contact_number: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type SiteCreate = Omit<Site, 'id' | 'company_id' | 'created_at' | 'updated_at'>;
export type SiteUpdate = Partial<SiteCreate>;

export const sitesService = {
  getSites: async (companyId: string, skip = 0, limit = 100): Promise<Site[]> => {
    const response = await api.get<Site[]>(`/companies/${companyId}/sites/`, {
      params: { skip, limit },
    });
    return response.data;
  },

  createSite: async (companyId: string, data: SiteCreate): Promise<Site> => {
    const response = await api.post<Site>(`/companies/${companyId}/sites/`, data);
    return response.data;
  },

  updateSite: async (companyId: string, siteId: string, data: SiteUpdate): Promise<Site> => {
    const response = await api.patch<Site>(`/companies/${companyId}/sites/${siteId}`, data);
    return response.data;
  },

  deleteSite: async (companyId: string, siteId: string): Promise<Site> => {
    const response = await api.delete<Site>(`/companies/${companyId}/sites/${siteId}`);
    return response.data;
  }
};
