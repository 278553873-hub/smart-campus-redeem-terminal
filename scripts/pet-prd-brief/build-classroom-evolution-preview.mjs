import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import animate from 'tailwindcss-animate';
import { resolve } from 'node:path';

export async function buildClassroomEvolutionPreview(project) {
  const result = await build({
    entryPoints: [resolve(project, 'scripts/pet-prd-brief/classroom-evolution-preview.tsx')],
    bundle: true, write: false, outdir: '/tmp/pet-prd-preview-build', platform: 'browser', format: 'iife',
    target: 'es2022', minify: true, define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.svg': 'dataurl', '.webp': 'dataurl', '.woff': 'dataurl', '.woff2': 'dataurl', '.ttf': 'dataurl' },
  });
  const utilities = await postcss([tailwindcss({
    content: [resolve(project, 'components/classroom/**/*.{ts,tsx}'), resolve(project, 'components/pets/**/*.{ts,tsx}'), resolve(project, 'scripts/pet-prd-brief/classroom-evolution-preview.tsx')],
    theme: { extend: { fontFamily: { heading: ['"Baloo 2"', 'cursive'], body: ['"Comic Neue"', 'cursive'] } } },
    future: { hoverOnlyWhenSupported: true }, plugins: [animate],
  })]).process('@tailwind base;\n@tailwind components;\n@tailwind utilities;', { from: undefined });
  const css = result.outputFiles.find(file => file.path.endsWith('.css')).text;
  const js = result.outputFiles.find(file => file.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script');
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${utilities.css}\n${css}</style><body><div id="evolution-preview-root"></div><script>${js}</script></body></html>`;
}
