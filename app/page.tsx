import React from "react";
import FormGenerator from "./form-generator";
import Header from "@/components/header";

export default function Home() {
  return (
    <React.Fragment>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <FormGenerator />
      </main>
    </React.Fragment>
  )
}
