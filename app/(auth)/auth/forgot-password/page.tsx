import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  // 루트 layout의 title.template("%s | pitch-ac")이 적용된다
  title: "비밀번호 재설정",
  description: "가입한 이메일로 비밀번호 재설정 링크를 받습니다.",
};

export default function Page() {
  return <ForgotPasswordForm />;
}
