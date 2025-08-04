"use client";

import React, { useState, useTransition } from "react";
import { forms } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormPublishSuccess from "./FormPublishSuccess";
import { Copy } from "lucide-react";
import { deleteForm } from "@/app/actions/deleteForm";
import { useSession } from "next-auth/react";
import MessageUI from "../MessageUI";
import idea from "@/public/idea.svg";

type Form = InferSelectModel<typeof forms>;

type Props = {
  forms: Form[];
};

const FormsList = (props: Props) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [formId, setFormId] = useState<number>();
  const [isPending, startTransition] = useTransition();

  const session = useSession();
  const userId = session.data?.user?.id;

  const handleDelete = (form_id: number) => {
    if (!userId) return;

    const confirmDelete = confirm(
      "Are you sure you want to delete this form and all its data?"
    );
    if (!confirmDelete) return;

    startTransition(async () => {
      await deleteForm({ formId: form_id, userId });
    });
  };

  if (!props.forms.length) {
    return (
      <MessageUI
        image={idea}
        message="No forms added yet, Create your first form!"
        disableBtn
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 p-2 sm:p-4 gap-4">
      {props.forms.map((form: Form) => (
        <Card key={form.id} className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
            <CardDescription>{form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {form.published && (
              <div className="px-4 py-1 font-[500] bg-green-600 text-white text-xs rounded-full flex items-center gap-4 max-w-fit">
                Published
                <Button
                  size={"icon"}
                  variant="ghost"
                  onClick={() => {
                    setFormId(form.id);
                    setDialogOpen(true);
                  }}
                  className="hover:bg-transparent hover:text-white w-fit h-fit border-l border-white rounded-none pl-2"
                >
                  <Copy size={16} />
                </Button>
              </div>
            )}
            {!form.published && (
              <span className="px-4 py-1 font-[500] bg-gray-600 text-white text-xs rounded-full">
                Draft
              </span>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-start gap-1">
            <Link
              href={
                form.published
                  ? `/forms/preview/${form.id}`
                  : `/forms/edit/${form.id}`
              }
            >
              <Button className="w-full" size="sm">
                {/* {form.published ? <Eye /> : <Edit />} */}
                {form.published ? "Preview" : "Edit"}
              </Button>
            </Link>
            {form.published && (
              <Link href={`/results?formId=${form.id}`}>
                <Button variant="outline" className="w-full" size="sm">
                  {/* <BarChart /> */}
                  Results
                </Button>
              </Link>
            )}
            <Button
              variant="destructive"
              size={"sm"}
              onClick={() => handleDelete(form.id)}
              disabled={isPending}
            >
              {/* <Trash /> */}
              {"Delete"}
            </Button>
          </CardFooter>
        </Card>
      ))}
      <FormPublishSuccess
        formId={formId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default FormsList;
