import { api } from './api';

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Holiday';

export interface Attendance {
  id: string;
  employee_id: string;
  site_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeAttendanceMark {
  employee_id: string;
  status: AttendanceStatus;
}

export interface BulkAttendanceMarkPayload {
  date: string; // YYYY-MM-DD
  site_id: string;
  records: EmployeeAttendanceMark[];
}

export const attendanceService = {
  getSiteAttendance: async (siteId: string, date?: string): Promise<Attendance[]> => {
    const response = await api.get<Attendance[]>(`/attendance/site/${siteId}`, {
      params: date ? { date } : undefined,
    });
    return response.data;
  },

  getEmployeeAttendance: async (
    employeeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Attendance[]> => {
    const response = await api.get<Attendance[]>(`/attendance/employee/${employeeId}`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  bulkMarkAttendance: async (payload: BulkAttendanceMarkPayload): Promise<{ processed: number; success: number; skipped_or_unchanged: number }> => {
    const response = await api.post<{ processed: number; success: number; skipped_or_unchanged: number }>(
      '/attendance/bulk',
      payload
    );
    return response.data;
  },
};
