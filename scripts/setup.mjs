#!/usr/bin/env node
// Interactive setup: writes src/lib/site-config.ts from a few prompts.
// Re-run any time you want to repurpose this template for a new portfolio.

import { createInterface } from "node:readline";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONFIG_PATH = path.join(ROOT, "src", "lib", "site-config.ts");

async function loadDefaults() {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const get = (key, fallback) => {
      const match = raw.match(new RegExp(`${key}:\\s*"([^"]*)"`));
      return match ? match[1] : fallback;
    };
    return {
      name: get("name", "YOUR NAME"),
      pitch: get("pitch", ""),
      email: raw.match(/email:\s*"([^"]*)"/)?.[1] ?? "you@example.com",
      instagram: raw.match(/instagram:\s*"([^"]*)"/)?.[1] ?? "yourhandle",
      metaTitle: get("metaTitle", ""),
      metaDescription: get("metaDescription", ""),
    };
  } catch {
    return {
      name: "YOUR NAME",
      pitch: "",
      email: "you@example.com",
      instagram: "yourhandle",
      metaTitle: "",
      metaDescription: "",
    };
  }
}

function question(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function ask(rl, prompt, fallback) {
  const suffix = fallback ? ` (${fallback})` : "";
  const answer = (await question(rl, `${prompt}${suffix}: `)).trim();
  return answer || fallback;
}

async function main() {
  const defaults = await loadDefaults();
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log("\nSet up your folio—press enter to keep the current value.\n");

  const name = await ask(rl, "Display name / tag", defaults.name);
  const pitch = await ask(
    rl,
    "One-line pitch (what are you offering, and why)",
    defaults.pitch || "Say what this portfolio is for in one sentence."
  );
  const email = await ask(rl, "Contact email", defaults.email);
  const instagram = await ask(
    rl,
    "Instagram handle (no @)",
    defaults.instagram
  );
  const metaTitle = await ask(rl, "Browser tab title", defaults.metaTitle || name);
  const metaDescription = await ask(
    rl,
    "Meta description (for search/social previews)",
    defaults.metaDescription || pitch
  );

  rl.close();

  const contents = `// Single place to edit when reusing this template for a different project
// (e.g. swap this out for a straight photography portfolio).
export const siteConfig = {
  name: ${JSON.stringify(name)},
  pitch: ${JSON.stringify(pitch)},
  contact: {
    email: ${JSON.stringify(email)},
    instagram: ${JSON.stringify(instagram)},
  },
  metaTitle: ${JSON.stringify(metaTitle)},
  metaDescription: ${JSON.stringify(metaDescription)},
};
`;

  await writeFile(CONFIG_PATH, contents);
  console.log(`\nWrote ${path.relative(ROOT, CONFIG_PATH)}`);
  console.log("Next: drop photos in photos-source/ and run `npm run photos`.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
