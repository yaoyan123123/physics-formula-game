import vm from 'node:vm';

function scanBalanced(source, start, open, close) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Unbalanced ${open}${close}`);
}

export function extractConst(source, name) {
  const marker = new RegExp(`const\\s+${name}\\s*=\\s*`, 'm');
  const match = marker.exec(source);
  if (!match) throw new Error(`Missing const ${name}`);
  const start = match.index + match[0].length;
  const first = source[start];
  const pairs = { '[': ']', '{': '}' };
  if (!pairs[first]) throw new Error(`const ${name} must start with an object or array literal`);
  const literal = scanBalanced(source, start, first, pairs[first]);
  return vm.runInNewContext(`(${literal})`);
}

export function extractFunction(source, name, context = {}) {
  const marker = new RegExp(`function\\s+${name}\\s*\\(`, 'm');
  const match = marker.exec(source);
  if (!match) throw new Error(`Missing function ${name}`);
  const brace = source.indexOf('{', match.index);
  const body = scanBalanced(source, brace, '{', '}');
  const fnSource = source.slice(match.index, brace) + body;
  return vm.runInNewContext(`(${fnSource})`, context);
}
