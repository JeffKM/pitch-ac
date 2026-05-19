import { Suspense } from "react";

import { ComicFooter } from "./_components/comic-footer";
import { ComicHeader } from "./_components/comic-header";
import { HomeContent } from "./_components/home-content";
import { HomeContentSkeleton } from "./_components/home-content-skeleton";

export default function HomePage() {
  return (
    <div className="min-h-screen paper-texture">
      <ComicHeader />
      <Suspense fallback={<HomeContentSkeleton />}>
        <HomeContent />
      </Suspense>
      <ComicFooter />
    </div>
  );
}
