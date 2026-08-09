"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import type { Photo } from "@/lib/photos";
import { Lightbox } from "./Lightbox";

export function Gallery({ photos }: { photos: Photo[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]
  );

  return (
    <>
      <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3">
        {photos.map((photo, index) => (
          <button
            key={photo.slug}
            onClick={() => setActiveIndex(index)}
            className="group mb-3 block w-full break-inside-avoid overflow-hidden bg-white/5 sm:mb-4"
          >
            <div
              className="relative w-full"
              style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            >
              <Image
                src={photo.src}
                alt={photo.title || "Photo"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
              />
            </div>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          photo={photos[activeIndex]}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
