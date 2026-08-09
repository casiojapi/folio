import photosData from "../../data/photos.json";

export type Photo = {
  slug: string;
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  title: string;
  description: string;
  location: string;
  order: number | null;
  featured: boolean;
  camera: string | null;
  lens: string | null;
  focalLength: string | null;
  aperture: string | null;
  shutterSpeed: string | null;
  iso: string | null;
  takenAt: string;
  originalWidth: number | null;
  originalHeight: number | null;
};

export const photos: Photo[] = photosData as Photo[];

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
