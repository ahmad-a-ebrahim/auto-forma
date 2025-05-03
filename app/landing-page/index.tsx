import React from 'react'
import FormGenerator from '../form-generator'

type Props = {}

const LandingPage = (props: Props) => {
  return (
    <section
      id="hero"
      className="flex flex-col items-center space-y-8 p-4 sm:pt-24 w-full min-h-screen bg-[url('/texture.svg')]"
      style={{
        backgroundColor: "#f0f9ff",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23ffffff' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`
      }}
    >
      <h1 className='text-4xl font-bold text-center tracking-tighter sm:text-5xl md:text-6xl leading-10'>
        Create forms in seconds, not hours. 🚀
      </h1>
      <p className='max-w-[600px] mt-4 text-center text-gray-500 md:text-xl'>
        Create, distribute, and analyze your form effortlessly with AI, unlocking powerful insights and data-driven decisions in real time.
      </p>
      <FormGenerator />
    </section>
  )
}

export default LandingPage
