import { siteConfig } from "@/lib/site-config";

export function Header() {
  const { name, pitch, contact } = siteConfig;

  return (
    <header className="mx-auto max-w-3xl px-5 pb-10 pt-14 text-center sm:pt-20">
      <h1 className="text-sm font-medium uppercase tracking-[0.3em] text-white/90">
        {name}
      </h1>
      <p className="mx-auto mt-5 max-w-lg text-balance text-base leading-relaxed text-white/60">
        {pitch}
      </p>
      <div className="mt-6 flex items-center justify-center gap-4 text-xs uppercase tracking-widest text-white/40">
        <a href={`mailto:${contact.email}`} className="transition hover:text-white">
          {contact.email}
        </a>
        <span>&middot;</span>
        <a
          href={`https://instagram.com/${contact.instagram}`}
          target="_blank"
          rel="noreferrer"
          className="transition hover:text-white"
        >
          @{contact.instagram}
        </a>
      </div>
    </header>
  );
}
