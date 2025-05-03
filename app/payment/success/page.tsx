import React from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

const page = () => {
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <Alert variant="default" className='max-w-md'>
        <AlertTitle className='text-center text-lg font-[500] flex flex-col gap-2 items-center justify-center'>
          <CheckCircle2 className='text-green-600 h-8 w-8' />
          Success
        </AlertTitle>
        <AlertDescription className='text-center text-base'>
          Your account has been updated. <Link href="/view-forms" className='underline text-primary'>Go to the dashboard</Link> to create more forms.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default page
