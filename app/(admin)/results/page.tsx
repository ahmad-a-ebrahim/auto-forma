import React from 'react'
import ResultsDisplay from './ResultsDisplay'

type Props = {}

const page = async ({ searchParams }: {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}) => {
  return (
    <div className='p-2 sm:p-4'>
      <ResultsDisplay formId={parseInt(searchParams.formId as string)} />
    </div>
  )
}

export default page
