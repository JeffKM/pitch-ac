"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GoogleOAuthButton, OAuthDivider } from "@/components/oauth-buttons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ERROR_ID = "login-error";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // 인증된 사용자용 경로로 이동
      router.push("/matchday");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const describedBy = error ? ERROR_ID : undefined;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle as="h1" className="text-2xl">
            로그인
          </CardTitle>
          <CardDescription>
            이메일과 비밀번호를 입력해 계정에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleOAuthButton />
          <OAuthDivider />
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  required
                  aria-invalid={!!error}
                  aria-describedby={describedBy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {/*
                탭 순서를 이메일 → 비밀번호 → 재설정 링크로 유지하기 위해
                DOM에서는 링크를 비밀번호 입력 뒤에 두고, 위치는 그리드로 잡는다.
              */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-2">
                <Label htmlFor="password" className="col-start-1 row-start-1">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={!!error}
                  aria-describedby={describedBy}
                  className="col-span-2 col-start-1 row-start-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Link
                  href="/auth/forgot-password"
                  className="col-start-2 row-start-1 justify-self-end text-sm underline-offset-4 hover:underline"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
              {error && (
                <p id={ERROR_ID} role="alert" className="text-sm text-red-500">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              계정이 없으신가요?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                회원가입
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
