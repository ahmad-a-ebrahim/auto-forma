"use client"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquareWarning, PlusCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { generateForm } from '../actions/generateForm'
import { useSession, signIn } from "next-auth/react"

export const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type='submit' disabled={pending}>
      {pending ? "Generating form..." : "Submit"}
    </Button>
  )
}

const initialState : {
  message: string;
  data?: any;
} = {
  message: ""
}

const FormGenerator = () => {
    const [state, formAction] = useFormState(generateForm, initialState);

    const [open, setOpen] = useState(false)

    const session = useSession()

    const onFormCreate = () => {
      if (session.data?.user) {
        setOpen(true)
      } else {
        signIn();
      }
    }

    useEffect(() => {
      if (state.message === "success") {
        setOpen(false);
      }

      console.log("DATA", state.data);
    }, [state.data, state.message])

    return (
      <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={onFormCreate}>
            <PlusCircle className='w-4 h-4 mr-2' />
            Generate Form
          </Button>
          <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Generate Form With AI</DialogTitle>
                <DialogDescription className='sr-only'></DialogDescription>
              </DialogHeader>
              <form action={formAction}>
                  <div className='grid gap-4 py-4'>
                      <Textarea
                        className='min-h-24'
                        id="description"
                        name="description"
                        required
                        placeholder='Share what your form is about, who is it for, and what information you would like to collect. And AI will do the magic ✨'
                      />
                      {state.message && state.message !== "success" && (
                        <p className='text-destructive text-sm font-[600] flex items-center gap-2'>
                          <MessageSquareWarning /> {state.message}
                        </p>
                      )}
                  </div>
                  <DialogFooter>
                    <SubmitButton />
                    <Button type='button' variant="link">Create Manually</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    )
}

export default FormGenerator
