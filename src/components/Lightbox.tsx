"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { formatDate, type Photo } from "@/lib/photos";

type LightboxProps = {
  photo: Photo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function Lightbox({ photo, onClose, onPrev, onNext }: LightboxProps) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) onPrev();
      else onNext();
    }
    touchStartX.current = null;
  }

  const caption = [photo.title, photo.location].filter(Boolean).join(" — ");

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-white/70 transition hover:text-white"
      >
        &times;
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photo"
        className="absolute left-1 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl text-white/50 transition hover:text-white sm:flex"
      >
        &#8249;
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next photo"
        className="absolute right-1 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl text-white/50 transition hover:text-white sm:flex"
      >
        &#8250;
      </button>

      <div
        className="relative flex flex-1 items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative h-full max-h-full w-auto max-w-full"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
          <Image
            src={photo.src}
            alt={caption || "Photo"}
            fill
            sizes="100vw"
            className="object-contain"
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            priority
          />
        </div>
      </div>

      {(caption || photo.takenAt) && (
        <div
          className="shrink-0 px-6 pb-8 pt-2 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {caption && (
            <p className="text-sm tracking-wide text-white">{caption}</p>
          )}
          {photo.takenAt && (
            <p className="mt-1 text-xs uppercase tracking-widest text-white/40">
              {formatDate(photo.takenAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
