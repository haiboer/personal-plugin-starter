#!/usr/bin/env node
import { verifyPluginPackage } from '../src/package-files.mjs';

const [manifest, sums] = process.argv.slice(2);
if (!manifest || !sums) { console.error('Usage: check-package <plugin-manifest.json> <dist/SHA256SUMS>'); process.exitCode = 2; }
else {
  const errors = await verifyPluginPackage(manifest, sums);
  if (errors.length) { errors.forEach(error => console.error(error)); process.exitCode = 1; }
  else console.log('Plugin package files and manifest verified');
}
