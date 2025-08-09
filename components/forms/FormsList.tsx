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
import { BarChart, Copy, Edit, Globe, Trash } from "lucide-react";
import { deleteForm } from "@/app/actions/deleteForm";
import MessageUI from "../MessageUI";
import idea from "@/public/idea.svg";
import { publishForm } from "@/app/actions/mutateForm";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Form = InferSelectModel<typeof forms>;

type Props = {
  forms: Form[];
};

const FormsList = (props: Props) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [formId, setFormId] = useState<number>();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (form_id: number) => {
    startTransition(async () => {
      try {
        const res = await deleteForm({ formId: form_id });
        if (res.success) {
          toast({
            variant: "success",
            title: "Success",
            description: "Form deleted",
          });
          setDeleteOpen(false);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: res?.error || "Deleting failed",
          });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Deleting failed",
        });
      }
    });
  };

  const handlePublish = async (form_id: number) => {
    startTransition(async () => {
      try {
        const res = await publishForm({ formId: form_id });
        if (res.success) {
          toast({
            variant: "success",
            title: "Success",
            description: "Form published",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: res?.error || "Publishing failed",
          });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Publishing failed",
        });
      }
    });
  };

  if (!props.forms.length) {
    return (
      <MessageUI
        image={idea}
        message="No forms added yet, Let's create your first form"
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
          <CardContent className="flex items-center justify-between gap-1">
            {form.published ? (
              <div className="px-4 py-1 font-[500] bg-green-700 text-white text-xs rounded-full flex items-center gap-4 max-w-fit">
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
                  <Copy />
                </Button>
              </div>
            ) : (
              <div className="px-4 py-1 font-[500] bg-secondary text-secondary-foreground text-xs rounded-full w-fit">
                Draft
              </div>
            )}
            <Link href={`/forms/preview/${form.id}`}>
              <Button
                variant="link"
                className="w-full px-0"
                size="sm"
                disabled={isPending}
              >
                Preview
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-start gap-1">
            {form.published ? (
              <Link href={`/results?formId=${form.id}`}>
                <Button
                  variant="default"
                  className="w-full"
                  size="sm"
                  disabled={isPending}
                >
                  <BarChart />
                  Results
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => handlePublish(form.id)}
                  disabled={isPending}
                >
                  <Globe />
                  Publish
                </Button>
                <Link href={`/forms/edit/${form.id}`}>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    disabled={isPending}
                  >
                    <Edit />
                    Edit
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setFormId(form.id);
                setDeleteOpen(true);
              }}
              disabled={isPending}
            >
              <Trash />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}

      <FormPublishSuccess
        formId={formId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this form and all its data?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                if (!formId) return;
                handleDelete(formId);
              }}
              disabled={isPending}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormsList;
