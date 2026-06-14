#!/usr/bin/env node
/**
 * One-shot script to download Wonder case-study assets from Figma's
 * MCP rendering endpoint. URLs are short-lived (~7 days) — re-run the
 * MCP get_screenshot calls if any fail.
 *
 * Run from the project root:  node scripts/download-wonder-assets.mjs
 *
 * After running, check file sizes. Anything <10 KB is almost certainly
 * a placeholder; export it manually from Figma instead.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images", "wonder");

const ASSETS = {
  // Brand logos
  "wonder-logo.png":      "https://www.figma.com/api/mcp/asset/89c79598-e29a-47d5-ae27-5d8752d0531d",
  "wonder-plus-logo.png": "https://www.figma.com/api/mcp/asset/f04d54a1-a71f-4a8b-bd0e-04466a338a69",

  // 5 app screens used in the top intro row (~367×710)
  "app-screen-1.png": "https://www.figma.com/api/mcp/asset/e92df274-d8e0-49dd-a9b5-0f3fb3f5549a",
  "app-screen-2.png": "https://www.figma.com/api/mcp/asset/24536eb3-c7a0-4f0d-b90f-dab9ce411ddc",
  "app-screen-3.png": "https://www.figma.com/api/mcp/asset/b6ad84f7-8a89-4831-aa1b-9d4ff3374b70",
  "app-screen-4.png": "https://www.figma.com/api/mcp/asset/a3a3dddd-c9f4-4e01-b441-55ffd132e867",
  "app-screen-5.png": "https://www.figma.com/api/mcp/asset/d0b61ccd-db21-42bc-8a03-a0abfc9da3da",

  // 4 Wonder+ membership screens (~369×710)
  "membership-1.png": "https://www.figma.com/api/mcp/asset/e463e0e7-b948-4efa-b07a-f803f63b5ab5",
  "membership-2.png": "https://www.figma.com/api/mcp/asset/c419e4b2-67f5-4ad3-a9b3-2e836d6cddf7",
  "membership-3.png": "https://www.figma.com/api/mcp/asset/7b647985-8ea2-4ef8-bac2-a858c5f6df3c",
  "membership-4.png": "https://www.figma.com/api/mcp/asset/1bfea7b2-6e22-4b91-89d8-4094c437d8f8",

  // 4 "original" order-state mockups (208×450 — small reference set)
  "original-order-received.png":  "https://www.figma.com/api/mcp/asset/80054acf-c8ac-4c8f-ae47-e23124512118",
  "original-preparing.png":       "https://www.figma.com/api/mcp/asset/479c7427-2847-4a05-b325-1c44253a5f14",
  "original-on-the-way.png":      "https://www.figma.com/api/mcp/asset/5ea4fac4-6f28-41d3-8109-f06b5a511b9d",
  "original-delivered.png":       "https://www.figma.com/api/mcp/asset/58a83b14-adc6-41cb-a221-66d5ad501bf6",

  // 4 redesigned iPhone 14 mockups for the post-purchase flow (412×833)
  "iphone-order-received.png": "https://www.figma.com/api/mcp/asset/b12d5d0a-90a9-45e4-8306-f0a651f7ad83",
  "iphone-preparing.png":      "https://www.figma.com/api/mcp/asset/4063d7c1-87e1-46f4-97c3-fe43c17e963c",
  "iphone-on-the-way.png":     "https://www.figma.com/api/mcp/asset/256b410b-1cb0-48ed-b503-ce56649a77c7",
  "iphone-delivered.png":      "https://www.figma.com/api/mcp/asset/2ceab708-16b6-4604-be38-a87c9964517b",

  // Web ordering browser mockup (the "Pickup" landing page)
  "web-ordering.png": "https://www.figma.com/api/mcp/asset/ae62b906-6c9a-429d-a49c-15c3d87f7462",

  // Restaurant brand cards row (9 cards rendered as one 1920×376 strip)
  "restaurant-cards.png": "https://www.figma.com/api/mcp/asset/4d8b32d1-7c32-4c13-8e77-73f8d822f040",

  // Big cover image at the bottom of the case study (1920×656)
  "cover.png": "https://www.figma.com/api/mcp/asset/ecc990eb-1f63-4e5f-9016-48abaea128ee",
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
      "\nFailures usually mean the short-lived Figma URL expired.\n" +
        "If that happens, ask Claude to re-fetch the asset URLs.",
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
