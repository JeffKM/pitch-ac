import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  // 루트 layout의 title.template("%s | pitch-ac")이 적용된다
  title: "가입 완료",
  description: "이메일 인증 후 로그인할 수 있습니다.",
};

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h1" className="text-2xl">
          가입해 주셔서 감사합니다!
        </CardTitle>
        <CardDescription>이메일에서 인증을 완료해 주세요</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          회원가입이 완료되었습니다. 로그인하기 전에 이메일함에서 계정 인증
          메일을 확인해 주세요.
        </p>
      </CardContent>
    </Card>
  );
}
