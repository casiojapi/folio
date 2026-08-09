import { Gallery } from "@/components/Gallery";
import { Header } from "@/components/Header";
import { photos } from "@/lib/photos";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-3 pb-16 sm:px-4">
        <Gallery photos={photos} />
      </div>
    </main>
  );
}
