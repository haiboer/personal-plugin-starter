#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { validateManifest } from '../src/validate.mjs';

const path = process.argv[2];
if (!path) { console.error('Usage: check-plugin <manifest.json>'); process.exitCode = 2; }
else {
  try {
    const manifest = JSON.parse(await readFile(path, 'utf8'));
    const errors = validateManifest(manifest);
    if (errors.length) { errors.forEach((error) => console.error(error)); process.exitCode = 1; }
    else console.log(`Valid plugin: ${manifest.id}@${manifest.version} (protocol ${manifest.schemaVersion})`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
