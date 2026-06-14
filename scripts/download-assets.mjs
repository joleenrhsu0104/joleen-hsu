#!/usr/bin/env node
/**
 * One-shot script to download all Figma MCP asset URLs into
 * /public/images/ so we don't depend on short-lived URLs at runtime.
 *
 * Run from the project root:  node scripts/download-assets.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images");

const ASSETS = {
  // Hero project images (cycle through on scroll)
  "hero-wonder.png":      "https://www.figma.com/api/mcp/asset/c3b0024c-b60e-480b-b14d-08a4f3bc88b5",
  "hero-blue-apron.png":  "https://www.figma.com/api/mcp/asset/3ccfa91d-e20a-427e-a2bf-c479c98d5bf6",
  "hero-noom.png":        "https://www.figma.com/api/mcp/asset/0c75cf47-17e0-450a-8a49-942539acd639",
  "hero-neuday.png":      "https://www.figma.com/api/mcp/asset/e25b9b36-226b-41a1-80bf-2190beea98de",

  // Logo (top nav wordmark)
  "logo-headline.png":    "https://www.figma.com/api/mcp/asset/aa8cd86a-abed-42af-97bd-2406a42797b9",

  // About section
  "flower.png":           "https://www.figma.com/api/mcp/asset/a5f15a56-4e29-4ef3-ac0b-1f76245e09ac",
  "flower-mask.png":      "https://www.figma.com/api/mcp/asset/0ed5bcba-89ad-4f42-80bc-c51b773db490",

  // Ethos image grid
  "ethos-1-paint.png":    "https://www.figma.com/api/mcp/asset/de6f137a-4e55-422e-9ae3-00b34636af3c",
  "ethos-2-food.png":     "https://www.figma.com/api/mcp/asset/6cc4b4bf-bb51-4638-82b5-fbadb896bc48",
  "ethos-3-orange.png":   "https://www.figma.com/api/mcp/asset/d9b7e326-a017-4255-906c-57bd3ea62172",
  "ethos-4-window.png":   "https://www.figma.com/api/mcp/asset/312808bb-464a-446a-a8ea-e68f196da0cd",
  "ethos-5-field.png":    "https://www.figma.com/api/mcp/asset/9513abae-befe-4aeb-b242-f510f722010e",
  "ethos-6-abstract.png": "https://www.figma.com/api/mcp/asset/798fc598-5d4a-4f76-850e-7a5118f7945a",

  // Signature / closing
  "portrait-bw.png":       "https://www.figma.com/api/mcp/asset/8bb8b6fa-691d-47a5-96c3-296fb8a1d053",
  "headline-texture.png":  "https://www.figma.com/api/mcp/asset/2c900cbd-d587-4822-8aef-6df1bc31e8f8",
};

async function downloadOne(filename, url) {
  process.stdout.write(`  ${filename} ... `);
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`FAILED (${res.status} ${res.statusText})`);
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(OUT_DIR, filename), buf);
  console.log(`${(buf.length / 1024).toFixed(1)} KB`);
  return true;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Downloading ${Object.keys(ASSETS).length} assets to ${OUT_DIR}\n`);

  let ok = 0,
    fail = 0;
  for (const [filename, url] of Object.entries(ASSETS)) {
    try {
      const success = await downloadOne(filename, url);
      success ? ok++ : fail++;
    } catch (e) {
      console.log(`ERROR (${e.message})`);
      fail++;
    }
  }

  console.log(`\nDone. ${ok} succeeded, ${fail} failed.`);
  if (fail > 0) {
    console.log(
      "\nIf assets failed, the Figma MCP URLs likely expired or require\n" +
        "auth. Re-export the failed images directly from Figma's Export\n" +
        "panel into /public/images/ and update app/lib/assets.ts.",
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
