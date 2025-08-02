import React from "react";
import FormGenerator from "../../components/forms/form-generator";
import DotGrid from "@/components/blocks/Backgrounds/DotGrid/DotGrid";
import UserSubscriptionWrapper from "../../components/forms/form-generator/UserSubscriptionWrapper";

const LandingPage = () => {
  return (
    <section
      id="hero"
      className="flex justify-center w-full h-full relative flex-1"
    >
      <div className="absolute w-full h-full z-10">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#EEEEEE"
          activeColor="#2563EB"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      <div className="z-20 bg-transparent flex flex-col items-center space-y-8 px-4 pt-20 backdrop-blur-sm flex-1">
        <h1 className="text-4xl font-bold text-center tracking-tighter sm:text-5xl md:text-6xl leading-10">
          Create forms in seconds, not hours. 🚀
        </h1>
        <p className="max-w-[700px] mt-4 text-center text-gray-500 md:text-xl font-[500]">
          Create, distribute, and analyze your form effortlessly with AI,
          unlocking powerful insights and data-driven decisions in real time.
        </p>
        <UserSubscriptionWrapper>
          <FormGenerator size={"lg"} />
        </UserSubscriptionWrapper>
      </div>
    </section>
  );
};

export default LandingPage;
