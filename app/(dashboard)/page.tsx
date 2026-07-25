export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Employees</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
