import type { Metadata } from "next";

import { UpdatePasswordForm } from "@/components/update-password-form";

export const metadata: Metadata = {
  // 루트 layout의 title.template("%s | pitch-ac")이 적용된다
  title: "새 비밀번호 설정",
  description: "새로 사용할 비밀번호를 등록합니다.",
};

export default function Page() {
  return <UpdatePasswordForm />;
}
