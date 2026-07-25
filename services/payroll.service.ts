import { api } from './api';

export interface PayrollRecord {
  employee_id: string;
  employee_code: string;
  full_name: string;
  phone: string;
  site_id: string | null;
  site_name: string;
  job_role_id: string | null;
  job_role_name: string;
  present_days: number;
  half_days: number;
  paid_days: number;
  daily_wage: number;
  gross_salary: number;
  advance_amount: number;
  uniform_deduction: number;
  total_deductions: number;
  net_salary: number;
}

export interface PayrollSummaryTotals {
  total_gross: number;
  total_advances: number;
  total_uniforms: number;
  total_net: number;
}

export interface PayrollResponseOut {
  summary: PayrollSummaryTotals;
  records: PayrollRecord[];
}

export interface PayrollDeductionsStore {
  advance: number;
  uniform: number;
}

const STORAGE_KEY = 'payroll_deductions_store';

export const payrollService = {
  getCompanyPayrollSummary: async (
    companyId: string,
    startDate: string,
    endDate: string,
    siteId?: string
  ): Promise<PayrollResponseOut> => {
    const response = await api.get<PayrollResponseOut>(`/companies/${companyId}/payroll/summary`, {
      params: {
        start_date: startDate,
        end_date: endDate,
        site_id: siteId && siteId !== 'ALL' ? siteId : undefined,
      },
    });
    return response.data;
  },

  // Get stored advance and uniform deductions for a month (key format: `YYYY-MM_employeeId`)
  getStoredDeductions: (monthKey: string, employeeId: string): PayrollDeductionsStore => {
    if (typeof window === 'undefined') return { advance: 0, uniform: 0 };
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${monthKey}_${employeeId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore JSON parse errors
    }
    return { advance: 0, uniform: 0 };
  },

  // Save advance and uniform deductions for an employee in a specific month
  saveDeductions: (monthKey: string, employeeId: string, deductions: PayrollDeductionsStore) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        `${STORAGE_KEY}_${monthKey}_${employeeId}`,
        JSON.stringify(deductions)
      );
    } catch {
      // Ignore storage write errors
    }
  },
};
