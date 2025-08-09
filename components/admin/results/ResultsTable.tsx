"use client";

import * as React from "react";
import { InferSelectModel } from "drizzle-orm";
import {
  forms,
  answers,
  formSubmissions,
  questions,
  fieldOptions,
} from "@/db/schema";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

type FieldOption = InferSelectModel<typeof fieldOptions>;

type Answer = InferSelectModel<typeof answers> & {
  fieldOption?: FieldOption | null;
};

type Question = InferSelectModel<typeof questions> & {
  fieldOptions: FieldOption[];
};

type FormSubmission = InferSelectModel<typeof formSubmissions> & {
  answers: Answer[];
};

export type Form =
  | (InferSelectModel<typeof forms> & {
      questions: Question[];
      submissions: FormSubmission[];
    })
  | undefined;

interface TableProps {
  data: FormSubmission[];
  columns: Question[];
}

const columnHelper = createColumnHelper<any>();

export function ResultsTable(
  props: TableProps & {
    columnVisibility: Record<string, boolean>;
    setColumnVisibility: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >;
  }
) {
  const { data, columnVisibility, setColumnVisibility } = props;

  const columns = [
    columnHelper.accessor("id", {
      cell: (info) => info.getValue(),
      header: "ID",
    }),
    ...props.columns.map((question: Question) => {
      return columnHelper.accessor(
        (row) => {
          const answer: Answer | undefined = row.answers.find(
            (a: Answer) => a.questionId === question.id
          );

          const value = answer?.fieldOption?.text ?? answer?.value ?? "—";

          return value;
        },
        {
          header: () => question.text ?? "—",
          id: question.id.toString(),
          cell: (info) => info.renderValue(),
        }
      );
    }),
  ];

  const [pageSize, setPageSize] = React.useState(10);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  React.useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  return (
    <div className="mt-4 space-y-4">
      <div className="shadow overflow-auto border border-gray-200 sm:rounded-lg h-[calc(100dvh-279px)] min-h-[400px]">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-background shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-left p-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="py-2">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1">
          <Button
            variant={"outline"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Back
          </Button>
          <Button
            variant={"outline"}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>

        <div className="text-sm text-muted-foreground font-medium">
          {`Page ${
            table.getState().pagination.pageIndex + 1
          } of ${table.getPageCount()}`}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span className="whitespace-nowrap">Rows per page:</span>
          <Select
            defaultValue={String(pageSize)}
            onValueChange={(value: string) => setPageSize(parseInt(value))}
          >
            <SelectTrigger className="w-14 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
