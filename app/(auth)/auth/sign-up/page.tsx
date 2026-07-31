import type { Metadata } from "next";

import { SignUpForm } from "@/components/sign-up-form";

export const metadata: Metadata = {
  // 루트 layout의 title.template("%s | pitch-ac")이 적용된다
  title: "회원가입",
  description: "pitch-ac 계정을 새로 만듭니다.",
};

export default function Page() {
  return <SignUpForm />;
}
