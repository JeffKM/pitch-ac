import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  // 루트 layout의 title.template("%s | pitch-ac")이 적용된다
  title: "인증 오류",
  description: "인증 처리 중 오류가 발생했습니다.",
};

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return params?.error ? (
    <p role="alert" className="text-sm text-muted-foreground">
      오류 코드: {params.error}
    </p>
  ) : (
    <p role="alert" className="text-sm text-muted-foreground">
      알 수 없는 오류가 발생했습니다.
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h1" className="text-2xl">
          문제가 발생했습니다
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense>
          <ErrorContent searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
