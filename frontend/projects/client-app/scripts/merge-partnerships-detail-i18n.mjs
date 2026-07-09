#!/usr/bin/env node
/**
 * Merge partnerships detail i18n keys into public locale JSON files (sorted keys).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(__dirname, "..", "public", "i18n");
const DATA_PATH = join(__dirname, "partnerships-detail-i18n-data.json");

const LOCALES = ["de", "en", "fr", "pl", "pt", "ru"];
const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));

let totalAdded = 0;
const perFile = {};

for (const locale of LOCALES) {
  const filePath = join(I18N_DIR, `${locale}.json`);
  const existing = JSON.parse(readFileSync(filePath, "utf8"));
  const incoming = data[locale];
  if (!incoming) {
    throw new Error(`Missing locale ${locale} in data file`);
  }

  let added = 0;
  for (const [key, value] of Object.entries(incoming)) {
    if (!(key in existing)) {
      added += 1;
      totalAdded += 1;
    }
    existing[key] = value;
  }

  const sorted = Object.fromEntries(
    Object.keys(existing)
      .sort((a, b) => a.localeCompare(b))
      .map((k) => [k, existing[k]]),
  );

  writeFileSync(filePath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
  JSON.parse(readFileSync(filePath, "utf8"));
  perFile[locale] = { added, total: Object.keys(sorted).length };
}

const uniqueIncoming = Object.keys(data.pl ?? {}).length;
console.log(
  JSON.stringify(
    {
      uniqueKeysInPayload: uniqueIncoming,
      keysNewlyAddedAcrossAllFiles: totalAdded,
      perLocale: perFile,
    },
    null,
    2,
  ),
);
