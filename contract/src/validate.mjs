import schema from '../plugin-manifest.schema.json' with { type: 'json' };

function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function validateSchema(value, rule, path, errors) {
  if ('const' in rule && value !== rule.const) errors.push(`${path}: expected ${JSON.stringify(rule.const)}`);
  if ('enum' in rule && !rule.enum.includes(value)) errors.push(`${path}: unsupported value`);
  if (rule.type === 'object') {
    if (!isRecord(value)) { errors.push(`${path}: expected object`); return; }
    for (const key of rule.required ?? []) if (!(key in value)) errors.push(`${path}.${key}: required`);
    if (rule.additionalProperties === false) for (const key of Object.keys(value)) if (!(key in (rule.properties ?? {}))) errors.push(`${path}.${key}: unknown field`);
    for (const [key, child] of Object.entries(rule.properties ?? {})) if (key in value) validateSchema(value[key], child, `${path}.${key}`, errors);
  } else if (rule.type === 'array') {
    if (!Array.isArray(value)) { errors.push(`${path}: expected array`); return; }
    if (value.length < (rule.minItems ?? 0)) errors.push(`${path}: too few items`);
    if (rule.uniqueItems && new Set(value.map(JSON.stringify)).size !== value.length) errors.push(`${path}: duplicate items`);
    value.forEach((item, index) => validateSchema(item, rule.items, `${path}[${index}]`, errors));
  } else if (rule.type === 'string') {
    if (typeof value !== 'string') { errors.push(`${path}: expected string`); return; }
    if (value.length < (rule.minLength ?? 0) || value.length > (rule.maxLength ?? Infinity)) errors.push(`${path}: invalid length`);
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) errors.push(`${path}: invalid format`);
    if (rule.format === 'uri') { try { new URL(value); } catch { errors.push(`${path}: invalid URI`); } }
  } else if (rule.type === 'integer' && (!Number.isInteger(value) || value < (rule.minimum ?? -Infinity))) errors.push(`${path}: invalid integer`);
}

export function validateManifest(value, { approvedCapabilities = ['profile.basic', 'navigation.openExternal'] } = {}) {
  const errors = [];
  validateSchema(value, schema, '$', errors);
  if (errors.length || !isRecord(value)) return errors;
  if (value.entry.shell.includes('..') || value.entry.shell.includes('//')) errors.push('entry.shell: traversal not allowed');
  for (const field of ['entry.standalone', 'backend.origin']) {
    if (field === 'entry.standalone' && value.entry.standalone === undefined) continue;
    const url = new URL(field === 'entry.standalone' ? value.entry.standalone : value.backend.origin);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) errors.push(`${field}: must be a clean HTTPS URL`);
    if (field === 'backend.origin' && url.pathname !== '/') errors.push(`${field}: must contain origin only`);
  }
  const paths = new Set();
  for (const route of value.routes) {
    if (!/^(?:[a-z][a-z0-9-]*(?:\/[a-z][a-z0-9-]*|\/:\w+)*)?$/.test(route.path) || route.path.includes('..')) errors.push(`routes: invalid path ${route.path}`);
    if (paths.has(route.path)) errors.push(`routes: duplicate path ${route.path}`);
    paths.add(route.path);
  }
  if (!paths.has('')) errors.push('routes: home path required');
  for (const item of value.menu) if (!paths.has(item.route)) errors.push(`menu: unknown route ${item.route}`);
  for (const capability of value.capabilities) if (!approvedCapabilities.includes(capability)) errors.push(`capabilities: not approved ${capability}`);
  return errors;
}
