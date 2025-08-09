"use client";

import React, { useEffect, useState } from "react";
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

type Props = {
  formId: number;
};

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

  useEffect(() => {
    (async () => {
      const res = await getResults({ formId });
      if (res.success && res.form) {
        const initialVisibility: Record<string, boolean> = {};
        res.form.questions.forEach((q) => {
          initialVisibility[q.id.toString()] = true;
        });
        initialVisibility["id"] = true;
        setColumnVisibility(initialVisibility);
      }
      setData(res);
      setLoading(false);
    })();
  }, [formId]);

  if (loading)
    return (
      <div className="text-center">Getting your results, please wait...</div>
    );

  if (!data?.success) {
    return (
      <MessageUI image={error} message={data?.message as string} disableBtn />
    );
  }

  const form = data.form;

  if (!form?.submissions.length)
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
          <Button variant={"outline"}>
            <ListFilter />
            Filter data
          </Button>

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

              <div className="space-y-2">
                {form.questions.map((q) => (
                  <div key={q.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`column_${q.id}`}
                      checked={columnVisibility[q.id.toString()]}
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
                    form.questions.forEach((q) => {
                      allVisible[q.id.toString()] = true;
                    });
                    setColumnVisibility(allVisible);
                  }}
                  disabled={form.questions.every(
                    (q) => columnVisibility[q.id.toString()]
                  )}
                >
                  Select all
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const allHidden: Record<string, boolean> = {};
                    form.questions.forEach((q) => {
                      allHidden[q.id.toString()] = false;
                    });
                    setColumnVisibility(allHidden);
                  }}
                  disabled={form.questions.every(
                    (q) => !columnVisibility[q.id.toString()]
                  )}
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
        data={form.submissions}
        columns={form.questions}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
    </div>
  );
};

export default ResultsDisplay;
