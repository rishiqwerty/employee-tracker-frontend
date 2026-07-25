"use client";

import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function TablePagination<TData>({
  table,
  pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs">
      {/* Total Entries & Page Info */}
      <div className="flex items-center gap-4 text-muted-foreground font-medium flex-wrap sm:flex-nowrap">
        <span>
          Showing <strong className="text-foreground font-bold">{startRow}</strong> to{" "}
          <strong className="text-foreground font-bold">{endRow}</strong> of{" "}
          <strong className="text-foreground font-bold">{totalRows}</strong> entries
        </span>

        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="h-8 rounded-xl border border-input/80 bg-background/60 dark:bg-muted/30 px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Pagination Buttons */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          title="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="gap-1 font-semibold"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>

        {/* Page Badge Indicator */}
        <span className="px-3 py-1 bg-muted/60 dark:bg-muted/30 rounded-full font-bold font-mono text-xs text-foreground border border-white/20">
          {pageIndex + 1} / {Math.max(1, pageCount)}
        </span>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="gap-1 font-semibold"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          title="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
