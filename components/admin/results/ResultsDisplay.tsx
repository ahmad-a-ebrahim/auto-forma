"use client";

import React, { useEffect, useState } from "react";
import { Form, ResultsTable } from "./ResultsTable";
import MessageUI from "@/components/MessageUI";
import empty from "@/public/no-data.svg";
import error from "@/public/error.svg";
import { getResults } from "@/app/actions/getResults";
import { Button } from "@/components/ui/button";
import { BarChart2, ListFilter } from "lucide-react";

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

  useEffect(() => {
    (async () => {
      const res = await getResults({ formId });
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
          <Button variant={"outline"}>
            <ListFilter />
            Filter columns
          </Button>
        </div>
        <Button className="self-end">
          <BarChart2 />
          Generate analytics
        </Button>
      </div>
      <ResultsTable data={form.submissions} columns={form.questions} />
    </div>
  );
};

export default ResultsDisplay;
