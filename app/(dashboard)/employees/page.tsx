"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { employeesService } from "@/services/employees.service";
import { Button } from "@/components/ui/button";
import { EmployeesTable } from "@/components/employees/employees-table";
import { EmployeeDialog } from "@/components/employees/employee-dialog";
import { useCompanyStore } from "@/store/useCompanyStore";

export default function EmployeesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const activeCompanyId = useCompanyStore((state) => state.activeCompanyId);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees", activeCompanyId],
    queryFn: () => activeCompanyId ? employeesService.getEmployees(activeCompanyId) : Promise.resolve([]),
    enabled: !!activeCompanyId,
    placeholderData: (previousData) => previousData,
  });

  if (!activeCompanyId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Company Selected</h2>
          <p className="text-muted-foreground">
            Please select a company from the top navigation bar to view and manage its employees.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your workforce and employee records.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <EmployeesTable data={employees} isLoading={isLoading} />

      <EmployeeDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}
