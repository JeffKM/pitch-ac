import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { AppHeader } from "@/components/nav/app-header";

import { ComicFooter } from "./_components/comic-footer";
import { HomeContent } from "./_components/home-content";
import { HomeContentSkeleton } from "./_components/home-content-skeleton";

export default function HomePage() {
  return (
    <div className="min-h-screen paper-texture">
      <AppHeader
        authSlot={
          <Suspense>
            <AuthButton />
          </Suspense>
        }
      />
      <Suspense fallback={<HomeContentSkeleton />}>
        <HomeContent />
      </Suspense>
      <ComicFooter />
    </div>
  );
}
