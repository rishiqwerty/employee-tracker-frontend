"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, MapPin, IndianRupee, Eye } from "lucide-react";

import { Site } from "@/services/sites.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SiteDialog } from "./site-dialog";
import { PayscaleDialog } from "./payscale-dialog";
import { SiteDetailsDrawer } from "./site-details-drawer";
import { TablePagination } from "@/components/ui/table-pagination";

interface SitesTableProps {
  data: Site[];
  isLoading: boolean;
}

export function SitesTable({ data, isLoading }: SitesTableProps) {
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);

  const [payscaleSite, setPayscaleSite] = useState<Site | null>(null);
  const [payscaleDialogOpen, setPayscaleDialogOpen] = useState(false);

  const [detailsSite, setDetailsSite] = useState<Site | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Site>[] = [
    {
      accessorKey: "name",
      header: "Site Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-semibold">
          <div className="bg-primary/10 text-primary p-1.5 rounded-md">
            <MapPin className="h-4 w-4" />
          </div>
          <button
            type="button"
            onClick={() => {
              setDetailsSite(row.original);
              setDetailsDialogOpen(true);
            }}
            className="hover:underline text-left cursor-pointer"
          >
            {row.getValue("name")}
          </button>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "state",
      header: "State",
    },
    {
      accessorKey: "contact_person",
      header: "Contact Person",
      cell: ({ row }) => row.getValue("contact_person") || "-",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const site = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Site Operations</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setDetailsSite(site);
                    setDetailsDialogOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4 text-primary" />
                  View Crew & Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setEditingSite(site);
                    setSiteDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Site
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setPayscaleSite(site);
                    setPayscaleDialogOpen(true);
                  }}
                >
                  <IndianRupee className="mr-2 h-4 w-4 text-emerald-600" />
                  Manage Payscale
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search sites..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Loading sites...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No sites found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination table={table} />

      <SiteDialog 
        open={siteDialogOpen} 
        onOpenChange={(open) => {
          setSiteDialogOpen(open);
          if (!open) setTimeout(() => setEditingSite(null), 200);
        }} 
        site={editingSite} 
      />

      <PayscaleDialog
        open={payscaleDialogOpen}
        onOpenChange={(open) => {
          setPayscaleDialogOpen(open);
          if (!open) setTimeout(() => setPayscaleSite(null), 200);
        }}
        siteId={payscaleSite?.id || null}
        siteName={payscaleSite?.name}
      />

      <SiteDetailsDrawer
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        site={detailsSite}
      />
    </div>
  );
}
