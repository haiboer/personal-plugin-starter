import { writePackageChecksums } from '../contract/src/package-files.mjs';
import { fileURLToPath } from 'node:url';

const result = await writePackageChecksums(fileURLToPath(new URL('../dist/', import.meta.url)));
console.log(`Built ${result.files} files; SHA256SUMS SHA-256: ${result.sha256}`);
