import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'tokens.json');
const outputPath = path.join(root, 'tokens.css');

const tokens = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const toKebab = (value) => value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

const getByPath = (object, tokenPath) => tokenPath.split('.').reduce((acc, key) => acc?.[key], object);

const resolveAlias = (value, mode = 'light') => {
  if (typeof value !== 'string') return value;
  return value.replace(/\{([^}]+)\}/g, (_, tokenPath) => {
    const token = getByPath(tokens, tokenPath);
    if (!token) throw new Error(`Unknown token reference: ${tokenPath}`);
    return mode === 'dark' && token.dark ? resolveAlias(token.dark, mode) : resolveAlias(token.value, mode);
  });
};

const pushVar = (lines, name, token, mode = 'light') => {
  const raw = mode === 'dark' && token.dark ? token.dark : token.value;
  lines.push(`  --${name}: ${resolveAlias(raw, mode)};`);
};

const walkPrimitiveColors = (lines, mode) => {
  for (const [family, scale] of Object.entries(tokens.primitive.color)) {
    for (const [step, token] of Object.entries(scale)) {
      pushVar(lines, `tc-${family}-${step}`, token, mode);
    }
  }
};

const walkFlatGroup = (lines, prefix, group, mode) => {
  for (const [key, token] of Object.entries(group)) {
    pushVar(lines, `tc-${prefix}-${toKebab(key)}`, token, mode);
  }
};

const walkSize = (lines) => {
  for (const [key, token] of Object.entries(tokens.primitive.size.radius)) {
    pushVar(lines, `tc-radius-${toKebab(key)}`, token);
  }
  for (const [key, token] of Object.entries(tokens.primitive.size.space)) {
    pushVar(lines, `tc-space-${toKebab(key)}`, token);
  }
};

const walkTypography = (lines) => {
  lines.push(`  --tc-font-family: ${tokens.primitive.typography.fontFamily.value};`);
  for (const [key, token] of Object.entries(tokens.primitive.typography.scale)) {
    const name = toKebab(key);
    lines.push(`  --tc-font-${name}-size: ${token.fontSize};`);
    lines.push(`  --tc-font-${name}-line-height: ${token.lineHeight};`);
    lines.push(`  --tc-font-${name}-weight: ${token.fontWeight};`);
  }
};

const buildBlock = (selector, mode = 'light') => {
  const lines = [selector === ':root' ? ':root {' : `${selector} {`];
  if (selector === ':root') lines.push('  color-scheme: light;');
  if (selector !== ':root') lines.push('  color-scheme: dark;');
  lines.push('');

  lines.push('  /* Primitive colors */');
  walkPrimitiveColors(lines, mode);
  lines.push('');

  lines.push('  /* Semantic colors */');
  walkFlatGroup(lines, 'color', tokens.semantic.color, mode);
  walkFlatGroup(lines, 'bg', tokens.semantic.background, mode);
  walkFlatGroup(lines, 'text', tokens.semantic.text, mode);
  walkFlatGroup(lines, 'border', tokens.semantic.border, mode);
  lines.push('');

  lines.push('  /* Radius, spacing, typography */');
  walkSize(lines);
  walkTypography(lines);
  lines.push('');

  lines.push('  /* Shadows */');
  walkFlatGroup(lines, 'shadow', tokens.primitive.shadow, mode);
  lines.push('');

  lines.push('  /* Motion */');
  walkFlatGroup(lines, 'motion-duration', tokens.primitive.motion.duration, mode);
  walkFlatGroup(lines, 'motion-easing', tokens.primitive.motion.easing, mode);
  lines.push('');

  lines.push('  /* Component tokens */');
  pushVar(lines, 'tc-page-background', tokens.component.page.background, mode);
  walkFlatGroup(lines, 'button', tokens.component.button, mode);
  walkFlatGroup(lines, 'input', tokens.component.input, mode);
  walkFlatGroup(lines, 'card', tokens.component.card, mode);
  walkFlatGroup(lines, 'nav', tokens.component.nav, mode);
  walkFlatGroup(lines, 'record', tokens.component.record, mode);
  walkFlatGroup(lines, 'voice', tokens.component.voice, mode);

  lines.push('}');
  return lines.join('\n');
};

const css = [
  '/* Generated from tokens.json. Do not edit by hand. */',
  buildBlock(':root', 'light'),
  '',
  buildBlock('[data-theme="dark"]', 'dark'),
  ''
].join('\n');

fs.writeFileSync(outputPath, css);
console.log(outputPath);
