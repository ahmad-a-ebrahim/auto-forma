"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const MessageUI = ({
  image,
  message,
  disableBtn,
}: {
  image: string;
  message: string;
  disableBtn?: boolean;
}) => {
  const router = useRouter();
  return (
    <div className="flex flex-col justify-center items-center gap-7">
      <Image src={image} width={176} alt={message} />
      <p className="text-base">{message}</p>
      {!disableBtn && <Button onClick={() => router.back()}>Go back</Button>}
    </div>
  );
};

export default MessageUI;
