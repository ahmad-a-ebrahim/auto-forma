"use client";

import React, { useEffect, useState } from "react";
import { getQuestions } from "@/app/actions/getQuestions";
import { generateAnalytics } from "@/app/actions/generateAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { QuestionSelectModel } from "@/types/form-types";
import MessageUI from "@/components/MessageUI";
import errorImg from "@/public/error.svg";
import { useToast } from "@/hooks/use-toast";
import ChartBarLabel, { mapAnswersToChartData } from "@/components/Chart";

type QuestionsResponse = {
  success: boolean;
  data?: QuestionSelectModel[];
  message?: string;
} | null;

type AnalyticsResult = Record<string, Record<string, number>> | null;

export default function AnalyticsPage({
  params,
}: {
  params: { formId: string };
}) {
  const formId = parseInt(params.formId);
  const { toast } = useToast();

  const [questionsResponse, setQuestionsResponse] =
    useState<QuestionsResponse>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [analyticsResult, setAnalyticsResult] = useState<AnalyticsResult>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      setQuestionsLoading(true);
      try {
        const res = await getQuestions({ formId });
        setQuestionsResponse(res);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch questions",
        });
      } finally {
        setQuestionsLoading(false);
      }
    }

    fetchQuestions();
  }, [formId, toast]);

  const toggleSelect = (id: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!selectedQuestionIds.length) return;

    setGenerateLoading(true);
    setAnalyticsResult(null);

    try {
      const res = await generateAnalytics({
        formId,
        questionsIds: selectedQuestionIds,
      });

      if (res.success && res.data) {
        setAnalyticsResult(res.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res?.message || "Generate analytics failed",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong during analytics generation",
      });
    } finally {
      setGenerateLoading(false);
    }
  };

  if (questionsResponse?.success === false) {
    return (
      <MessageUI
        image={errorImg}
        message={questionsResponse?.message || "Error loading questions"}
        disableBtn
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {questionsLoading ? (
        <div className="text-center py-10 flex justify-center items-center gap-2">
          <Loader2 className="animate-spin" />
          <span>Getting form questions, please wait...</span>
        </div>
      ) : (
        <>
          <p>Choose questions to generate analytics for:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {questionsResponse &&
              questionsResponse?.data &&
              questionsResponse.data
                .filter(
                  (q) =>
                    q.fieldType === "Select" || q.fieldType === "RadioGroup"
                )
                .map((q) => (
                  <Card
                    key={q.id}
                    className={`cursor-pointer transition ${
                      selectedQuestionIds.includes(q.id)
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => toggleSelect(q.id)}
                  >
                    <CardContent className="p-4">{q.text}</CardContent>
                  </Card>
                ))}
          </div>

          <Button
            disabled={!selectedQuestionIds.length || generateLoading}
            onClick={handleGenerate}
            className="mt-4"
          >
            {generateLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Generating...
              </>
            ) : (
              "Generate Analytics"
            )}
          </Button>

          {analyticsResult && (
            <section className="mt-5">
              <h2 className="font-semibold mb-2">Analytics Result:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {Object.entries(analyticsResult).map(
                  ([question, answers], idx) => {
                    const data = mapAnswersToChartData(answers);
                    if (data.length === 0) return null;

                    return (
                      <ChartBarLabel
                        key={idx}
                        title={question}
                        chartData={data}
                        xKey="label"
                        barKeys={[
                          {
                            dataKey: "value",
                            label: "Value",
                            color: `hsl(var(--chart-${(idx % 5) + 1}))`,
                          },
                        ]}
                      />
                    );
                  }
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
