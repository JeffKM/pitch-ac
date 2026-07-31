import type { Metadata } from "next";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  // 루트 layout의 title.template("%s | pitch-ac")이 적용된다
  title: "로그인",
  description: "pitch-ac 계정으로 로그인합니다.",
};

export default function Page() {
  return <LoginForm />;
}
