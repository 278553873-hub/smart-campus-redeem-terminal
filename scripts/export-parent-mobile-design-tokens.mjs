import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function loadParentDesignTokens() {
  const result = await build({
    stdin: { contents: "export * from './components/parent-app/parentMobileTokens'; export { teacherBrandCssVariables } from './mobile-app/styles/teacherMobileTokens';", resolveDir: root, loader: 'ts' },
    bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent',
    loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl', '.svg': 'dataurl' },
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
export async function createParentTokenExport() {
  const tokens = await loadParentDesignTokens();
  const sourceFiles = ['mobile-app/styles/teacherMobileTokens.ts', 'design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', 'components/parent-app/parentMobileColors.ts', 'components/parent-app/parentMobileTokens.ts', 'design-system/parent-mobile/PARENT_MOBILE_UI_GUIDELINES.md'];
  return {
    metadata: {
      name: '家长手机端设计令牌', version: '2026-11-03',
      inheritance: '教师手机端全量基线 + 家长成长页方案二颜色',
      editableSource: 'components/parent-app/parentMobileTokens.ts',
      generatedBy: 'node scripts/export-parent-mobile-design-tokens.mjs',
      baselineTokenCount: Object.keys(tokens.parentTeacherBaselineVariables).length,
      parentTokenCount: Object.keys(tokens.parentMobileTokens).length,
      sources: Object.fromEntries(sourceFiles.map(file => [file, createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')])),
    },
    primitive: { palette: tokens.parentMobilePalette, typography: tokens.parentTypographySemantic },
    semantic: { colors: tokens.parentMobileColorSemantic, evaluationScore: tokens.parentEvaluationScoreSemantic },
    component: { growthColors: tokens.parentGrowthColors, growthPaint: tokens.parentGrowthPaint, recordSummaryColors: tokens.parentRecordSummaryColors, mobileContent: tokens.parentMobileContentVariables },
    colorOverrides: tokens.parentMobileColorOverrides,
    cssVariables: tokens.parentMobileTokens,
    compatibility: { legacyAliases: tokens.parentLegacyAliases, sharedComponentBridge: tokens.parentSharedComponentBridge },
  };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await createParentTokenExport();
  const output = path.join(root, 'design-system/parent-mobile/parent-mobile.tokens.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`家长令牌已导出：教师基线 ${result.metadata.baselineTokenCount} 项，家长令牌 ${result.metadata.parentTokenCount} 项。`);
}
