import { ComicFooter } from "./_components/comic-footer";
import { ComicHeader } from "./_components/comic-header";
import { ComicHome } from "./_components/comic-home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-comic-white">
      <ComicHeader />
      <ComicHome />
      <ComicFooter />
    </div>
  );
}
