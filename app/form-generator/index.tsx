"use client";
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { generateForm } from '@/app/actions/generateForm';
import { useFormState, useFormStatus } from 'react-dom';
import { useSession, signIn } from "next-auth/react";
import { navigate } from '../actions/navigateToForm';
import { Plus, PlusCircle } from 'lucide-react';
import { DialogDescription } from '@radix-ui/react-dialog';

type Props = {
  size?: "sm" | "lg" | "default" | "icon" | null;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | null;
}

const initialState: {
  message: string;
  data?: any;
} = {
  message: ""
}

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Generating..." : "Generate with AI"}
    </Button>
  );
}

const FormGenerator = (props: Props) => {
  const [state, formAction] = useFormState(generateForm, initialState);
  const [open, setOpen] = useState(false);
  const session = useSession();

  useEffect(() => {
    if (state.message === "success") {
      setOpen(false);
      navigate(state.data.formId);
    }

  }, [state.message])

  const onFormCreate = () => {
    if (session.data?.user) {
      setOpen(true);
    } else {
      signIn();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={onFormCreate} size={props.size} variant={props.variant}>
        <PlusCircle className='w-4 h-4 mr-2' />
        Create form
      </Button>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create new form</DialogTitle>
          <DialogDescription className='sr-only'></DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className='grid gap-4 py-4'>
            <Textarea id="description" name="description" required placeholder='Share what your form is about, who is it for, and what information you would like to collect. And AI will do the magic ✨' />
          </div>
          <DialogFooter>
            {/* TODO */}
            <Button type='button' variant="ghost">Create manually</Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default FormGenerator
