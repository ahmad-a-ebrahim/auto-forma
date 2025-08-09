"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Form, ResultsTable } from "./ResultsTable";
import MessageUI from "@/components/MessageUI";
import empty from "@/public/no-data.svg";
import error from "@/public/error.svg";
import { getResults } from "@/app/actions/getResults";
import { Button } from "@/components/ui/button";
import { BarChart2, ListFilter, Columns } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Props = {
  formId: number;
};

// sentinel for the "Any / no filter" option (must be non-empty)
const ANY_SENTINEL = "__ANY__";

// fieldTypes that behave like selects (we compare exact value)
// NOTE: Switch is intentionally NOT included since we skip Switch filters entirely
const SELECT_LIKE = ["Select", "RadioGroup"];

const ResultsDisplay = ({ formId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    form?: Form;
    success: boolean;
    message?: string;
  } | null>(null);

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  // definitive filters (used by the table)
  const [filters, setFilters] = useState<Record<string, string>>({});

  // dialog open state and working copy of filters (applied only on Apply)
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [workingFilters, setWorkingFilters] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    (async () => {
      const res = await getResults({ formId });
      if (res.success && res.form) {
        const initialVisibility: Record<string, boolean> = {};
        res.form.questions.forEach((q) => {
          initialVisibility[q.id.toString()] = true;
        });
        // keep ID visible by default
        initialVisibility["id"] = true;
        setColumnVisibility(initialVisibility);
      }
      setData(res);
      setLoading(false);
    })();
  }, [formId]);

  const form = data?.form;
  const questions = useMemo(() => form?.questions ?? [], [form]);
  const submissions = useMemo(() => form?.submissions ?? [], [form]);

  // ensure workingFilters is initialised from filters when opening dialog
  useEffect(() => {
    if (filtersDialogOpen) {
      setWorkingFilters(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersDialogOpen]); // intentionally only when dialog open state changes

  // Filtered data (applies the official `filters` only)
  const filteredData = useMemo(() => {
    const hasAnyFilter = Object.values(filters).some(
      (v) => v && v.trim() !== ""
    );
    if (!hasAnyFilter) return submissions;

    return submissions.filter((submission) => {
      return Object.entries(filters).every(([questionId, filterValue]) => {
        if (!filterValue || filterValue.trim() === "") return true;

        const answer = submission.answers.find(
          (a: any) => String(a.questionId) === questionId
        );

        const answerValueRaw =
          answer?.fieldOption?.value ??
          answer?.fieldOption?.text ??
          answer?.value ??
          "";

        const answerValue = String(answerValueRaw).toLowerCase();
        const f = filterValue.toLowerCase();

        const question = questions.find((q) => q.id.toString() === questionId);
        const isSelectLike = SELECT_LIKE.includes(String(question?.fieldType));

        if (isSelectLike) {
          // exact match (compare on value if possible)
          return answerValue === f;
        } else {
          // contains match
          return answerValue.includes(f);
        }
      });
    });
  }, [submissions, filters, questions]);

  const areAllColumnsVisible = questions.length
    ? questions.every((q) => columnVisibility[q.id.toString()])
    : false;
  const areAllColumnsHidden = questions.length
    ? questions.every((q) => !columnVisibility[q.id.toString()])
    : false;

  if (loading)
    return (
      <div className="text-center">Getting your results, please wait...</div>
    );

  if (!data?.success) {
    return (
      <MessageUI image={error} message={data?.message as string} disableBtn />
    );
  }

  if (!form || !submissions.length)
    return (
      <MessageUI
        image={empty}
        message="No submissions on this form yet"
        disableBtn
      />
    );

  return (
    <div className="flex flex-col">
      <div className="w-full flex flex-wrap items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {/* Data filter dialog (controlled) */}
          <Dialog open={filtersDialogOpen} onOpenChange={setFiltersDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={"outline"}>
                <ListFilter />
                Filter data
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Filter data</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 max-h-[60vh] overflow-auto p-1">
                {questions.map((q) => {
                  // skip Switch filters entirely
                  if (q.fieldType === "Switch") return null;

                  const qKey = q.id.toString();
                  const currentValue = workingFilters[qKey] ?? "";

                  const isSelectLike = SELECT_LIKE.includes(
                    String(q.fieldType)
                  );
                  return (
                    <div key={q.id} className="space-y-1">
                      <label className="text-sm font-medium">{q.text}</label>

                      {isSelectLike ? (
                        <Select
                          value={
                            currentValue === "" ? ANY_SENTINEL : currentValue
                          }
                          onValueChange={(val) =>
                            setWorkingFilters((prev) => ({
                              ...prev,
                              [qKey]: val === ANY_SENTINEL ? "" : val,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any (no filter)" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* sentinel option (must be non-empty) */}
                            <SelectItem value={ANY_SENTINEL}>Any</SelectItem>
                            {q.fieldOptions.map((opt) => {
                              const optValue =
                                opt.value ?? opt.text ?? String(opt.id);
                              return (
                                <SelectItem key={opt.id} value={optValue}>
                                  {opt.text ?? opt.value ?? optValue}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type="text"
                          className="w-full"
                          placeholder="Filter by value (contains)"
                          value={currentValue}
                          onChange={(e) =>
                            setWorkingFilters((prev) => ({
                              ...prev,
                              [qKey]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setWorkingFilters({})}
                  disabled={Object.values(workingFilters).every(
                    (v) => !v || v === ""
                  )}
                >
                  Clear filters
                </Button>

                <Button
                  onClick={() => {
                    // Apply working filters to the real filters and close dialog
                    setFilters(workingFilters);
                    setFiltersDialogOpen(false);
                  }}
                >
                  Apply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Columns filter dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"outline"}>
                <Columns />
                Filter columns
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select columns</DialogTitle>
              </DialogHeader>

              <div className="space-y-2 max-h-[50vh] overflow-auto">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`column_${q.id}`}
                      checked={Boolean(columnVisibility[q.id.toString()])}
                      onCheckedChange={(checked) => {
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [q.id.toString()]: Boolean(checked),
                        }));
                      }}
                    />
                    <label htmlFor={`column_${q.id}`}>{q.text}</label>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    const allVisible: Record<string, boolean> = {};
                    questions.forEach((q) => {
                      allVisible[q.id.toString()] = true;
                    });
                    allVisible["id"] = true;
                    setColumnVisibility(allVisible);
                  }}
                  disabled={areAllColumnsVisible}
                >
                  Select all
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const allHidden: Record<string, boolean> = {};
                    questions.forEach((q) => {
                      allHidden[q.id.toString()] = false;
                    });
                    // keep id visible
                    allHidden["id"] = true;
                    setColumnVisibility(allHidden);
                  }}
                  disabled={areAllColumnsHidden}
                >
                  Deselect all
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Button className="self-end">
          <BarChart2 />
          Generate analytics
        </Button>
      </div>

      <ResultsTable
        data={filteredData}
        columns={questions}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
    </div>
  );
};

export default ResultsDisplay;
