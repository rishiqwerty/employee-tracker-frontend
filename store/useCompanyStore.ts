import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyState {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
  appBrandName: string;
  setAppBrandName: (name: string) => void;
  customLogoUrl: string | null;
  setCustomLogoUrl: (url: string | null) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      activeCompanyId: null,
      setActiveCompanyId: (id) => set({ activeCompanyId: id }),
      appBrandName: 'EmployeeTracker',
      setAppBrandName: (name) => set({ appBrandName: name }),
      customLogoUrl: null,
      setCustomLogoUrl: (url) => set({ customLogoUrl: url }),
    }),
    {
      name: 'company-context-storage',
    }
  )
);
