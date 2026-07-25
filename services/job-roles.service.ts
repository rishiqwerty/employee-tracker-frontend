import { api } from './api';

export interface JobRole {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type JobRoleCreate = Omit<JobRole, 'id' | 'company_id' | 'created_at' | 'updated_at'>;
export type JobRoleUpdate = Partial<JobRoleCreate>;

export const jobRolesService = {
  getJobRoles: async (companyId: string): Promise<JobRole[]> => {
    const response = await api.get<JobRole[]>(`/companies/${companyId}/job-roles/`);
    return response.data;
  },

  createJobRole: async (companyId: string, data: JobRoleCreate): Promise<JobRole> => {
    const response = await api.post<JobRole>(`/companies/${companyId}/job-roles/`, data);
    return response.data;
  },

  seedDefaultRoles: async (companyId: string): Promise<JobRole[]> => {
    const response = await api.post<JobRole[]>(`/companies/${companyId}/job-roles/seed-defaults`);
    return response.data;
  },

  updateJobRole: async (companyId: string, jobRoleId: string, data: JobRoleUpdate): Promise<JobRole> => {
    const response = await api.patch<JobRole>(`/companies/${companyId}/job-roles/${jobRoleId}`, data);
    return response.data;
  },

  deleteJobRole: async (companyId: string, jobRoleId: string): Promise<JobRole> => {
    const response = await api.delete<JobRole>(`/companies/${companyId}/job-roles/${jobRoleId}`);
    return response.data;
  },
};
