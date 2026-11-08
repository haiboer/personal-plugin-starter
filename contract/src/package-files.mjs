import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { validateManifest } from './validate.mjs';

const digestPattern = /^[0-9a-f]{64}$/;
const safeName = name => name && !name.startsWith('/') && !name.includes('\\') &&
  name.split('/').every(part => part && part !== '.' && part !== '..');

async function filesIn(directory, prefix = '') {
  const names = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (!safeName(name)) throw Error('构建文件名无效');
    if (entry.isDirectory()) names.push(...await filesIn(join(directory, entry.name), name));
    else if (entry.isFile() && name !== 'SHA256SUMS') names.push(name);
    else if (!entry.isFile()) throw Error('构建目录包含链接或特殊文件');
  }
  return names.sort();
}

async function sha256(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

/** Produce a deterministic checksum list for every built file. */
export async function writePackageChecksums(directory) {
  const root = resolve(directory);
  const files = await filesIn(root);
  if (!files.length) throw Error('构建目录为空');
  const lines = [];
  for (const name of files) lines.push(`${await sha256(join(root, name))}  ${name}`);
  const path = join(root, 'SHA256SUMS');
  await writeFile(path, `${lines.join('\n')}\n`, { flag: 'w' });
  return { path, files: files.length, sha256: await sha256(path) };
}

/** Verify manifest, entry, checksums and the exact set of built files. */
export async function verifyPluginPackage(manifestFile, checksumFile) {
  const errors = [];
  const manifestPath = resolve(manifestFile);
  const checksumsPath = resolve(checksumFile);
  let manifest;
  try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); }
  catch { return ['manifest: unreadable JSON']; }
  errors.push(...validateManifest(manifest));
  if (errors.length) return errors;
  const entry = resolve(dirname(manifestPath), manifest.entry.shell);
  const root = dirname(checksumsPath);
  if (basename(checksumsPath) !== 'SHA256SUMS' || dirname(entry) !== root ||
      !entry.startsWith(`${root}${sep}`) || relative(dirname(manifestPath), root).startsWith('..')) {
    return ['package: checksum list must sit beside the manifest entry inside this project'];
  }
  let actual, lines;
  try {
    actual = await filesIn(root);
    lines = (await readFile(checksumsPath, 'utf8')).trimEnd().split('\n');
  } catch { return ['package: build files or SHA256SUMS are missing or invalid']; }
  const declared = new Map();
  for (const line of lines) {
    const match = /^([0-9a-f]{64})  ([^\r\n]+)$/.exec(line);
    if (!match || !safeName(match[2]) || !digestPattern.test(match[1]) || declared.has(match[2])) {
      errors.push('SHA256SUMS: invalid or duplicate entry');
      continue;
    }
    declared.set(match[2], match[1]);
  }
  const expected = [...declared.keys()].sort();
  if (expected.join('\n') !== actual.join('\n') || lines.length !== declared.size ||
      [...declared.keys()].join('\n') !== expected.join('\n')) {
    errors.push('SHA256SUMS: missing, extra or unsorted build files');
  }
  if (!declared.has(basename(entry))) errors.push('entry.shell: not included in SHA256SUMS');
  for (const name of actual) {
    if (declared.has(name) && await sha256(join(root, name)) !== declared.get(name)) errors.push(`SHA256SUMS: digest mismatch for ${name}`);
  }
  return errors;
}
