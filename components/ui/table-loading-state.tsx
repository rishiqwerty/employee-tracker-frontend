"use client";

import { Loader2 } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

interface TableLoadingStateProps {
  colSpan: number;
  message?: string;
}

export function TableLoadingState({ colSpan, message = "Loading data from server..." }: TableLoadingStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-36 text-center">
        <div className="flex flex-col items-center justify-center gap-2.5 py-6">
          <div className="bg-primary/10 text-primary p-3 rounded-full animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
