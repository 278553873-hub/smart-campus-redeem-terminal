import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const sourceRoot = path.resolve('mobile-app');
const tokenFile = path.resolve('mobile-app/styles/teacherMobileTokens.ts');
const sharedQuestionnaireTokenFile = path.resolve('shared/questionnaireThemeTokens.ts');
const sourceFiles = [];

const walk = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.tsx') && !entry.name.includes('.test.')) sourceFiles.push(fullPath);
  }
};

walk(sourceRoot);
sourceFiles.sort();

const readTokenDefinitions = absoluteFile => {
  const sourceText = fs.readFileSync(absoluteFile, 'utf8');
  const source = ts.createSourceFile(absoluteFile, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const definitions = [];

  const visit = node => {
    if (
      ts.isPropertyAssignment(node)
      && (ts.isStringLiteral(node.name) || ts.isNoSubstitutionTemplateLiteral(node.name))
      && node.name.text.startsWith('--tm-')
    ) {
      const position = source.getLineAndCharacterOfPosition(node.getStart(source));
      definitions.push({
        name: node.name.text,
        value: node.initializer.getText(source),
        file: path.relative(process.cwd(), absoluteFile),
        line: position.line + 1,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return definitions;
};

const tokenDefinitions = readTokenDefinitions(tokenFile);
const sharedQuestionnaireTokenDefinitions = readTokenDefinitions(sharedQuestionnaireTokenFile);

const colorDomainRules = [
  ['brand', /^--tm-brand-/],
  ['surface', /^--tm-(?:bg|page)-/],
  ['text', /^--tm-text-/],
  ['border', /^--tm-border-/],
  ['status', /^--tm-status-/],
  ['record', /^--tm-record-/],
  ['role', /^--tm-role-/],
  ['audience', /^--tm-audience-/],
  ['education', /^--tm-edu-/],
  ['chart', /^--tm-chart-/],
  ['tag', /^--tm-tag-/],
  ['gender', /^--tm-gender-/],
  ['input', /^--tm-input-(?:bg|border|text|placeholder|focus|disabled|readonly)/],
  ['selection', /^--tm-selection-.*(?:bg|text|border|shadow)$/],
  ['action', /^--tm-action-icon-/],
  ['filter', /^--tm-filter-(?:bg|border|shadow|focus)/],
  ['platform', /^--tm-platform-/],
  ['effect', /^--tm-(?:mask|glow|shadow)-/],
];

const getColorDomain = name => colorDomainRules.find(([, matcher]) => matcher.test(name))?.[0] ?? null;
const colorTokens = tokenDefinitions
  .map(token => ({ ...token, domain: getColorDomain(token.name) }))
  .filter(token => token.domain);
const typographyTokens = tokenDefinitions.filter(token => /^--tm-font-/.test(token.name) || /-font-size$/.test(token.name));
const sharedQuestionnaireTypographyTokens = sharedQuestionnaireTokenDefinitions
  .filter(token => /^--tm-font-/.test(token.name) || /-font-size$/.test(token.name));
const effectiveTypographyTokens = [...new Map(
  [...typographyTokens, ...sharedQuestionnaireTypographyTokens].map(token => [token.name, token]),
).values()];
const typographyTokenVariants = [...new Set([...typographyTokens, ...sharedQuestionnaireTypographyTokens].map(token => token.name))]
  .map(name => {
    const definitions = [...typographyTokens, ...sharedQuestionnaireTypographyTokens].filter(token => token.name === name);
    return { name, definitions };
  })
  .filter(item => new Set(item.definitions.map(definition => definition.value)).size > 1);

const occurrences = [];
const addOccurrence = (type, file, line, value, context) => occurrences.push({ type, file, line, value, context });

const colorUtilityPattern = /(?<![\w-])(?:(?:sm|md|lg|xl|2xl|dark|hover|active|focus|focus-visible|disabled|checked|group-hover|group-active|aria-selected|data-\[[^\]]+\]):)*(?:bg|text|border|ring|outline|divide|shadow|from|via|to|fill|stroke|placeholder|decoration)-(?:white|black|transparent|current|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d{1,3})?/g;
const colorVariablePattern = /--tm-[a-z0-9-]+/g;
const literalColorPattern = /#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?)\([^)]*\)/g;
const arbitraryColorPattern = /(?:bg|text|border|ring|outline|shadow|from|via|to|fill|stroke|decoration)-\[(?:#[^\]]+|(?:rgba?|hsla?)\([^\]]+\))\]/g;
const inlineColorPropertyPattern = /\b(?:color|backgroundColor|borderColor|outlineColor|fill|stroke)\s*:/g;
const fontVariablePattern = /--tm-(?:font-[a-z0-9-]+|[a-z0-9-]+-font-size)/g;
const arbitraryFontSizePattern = /(?<![\w-])text-\[(\d+(?:\.\d+)?(?:px|rem|em))\]/g;
const namedFontSizePattern = /(?<![\w-])text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)(?![\w-])/g;
const fontWeightPattern = /(?<![\w-])(?:font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|tm-font-regular)(?![\w-])/g;
const lineHeightPattern = /(?<![\w-])leading-(?:none|tight|snug|normal|relaxed|loose|\d+|\[[^\]]+\])(?![\w-])/g;
const fontFamilyPattern = /(?<![\w-])font-(?:sans|serif|mono)(?![\w-])|fontFamily\s*:/g;
const trackingPattern = /(?<![\w-])tracking-(?:tighter|tight|normal|wide|wider|widest|\[[^\]]+\])(?![\w-])/g;

for (const absoluteFile of sourceFiles) {
  const relativeFile = path.relative(process.cwd(), absoluteFile);
  const lines = fs.readFileSync(absoluteFile, 'utf8').split(/\r?\n/);
  lines.forEach((lineText, index) => {
    const context = lineText.trim().replace(/\s+/g, ' ').slice(0, 260);
    const collect = (pattern, type, filter) => {
      for (const match of lineText.matchAll(pattern)) {
        const value = match[0];
        if (!filter || filter(value)) addOccurrence(type, relativeFile, index + 1, value, context);
      }
    };

    collect(colorVariablePattern, 'color-variable', value => Boolean(getColorDomain(value)));
    collect(colorUtilityPattern, 'named-color-utility');
    collect(literalColorPattern, 'literal-color');
    collect(arbitraryColorPattern, 'arbitrary-color');
    collect(inlineColorPropertyPattern, 'inline-color-property');
    collect(fontVariablePattern, 'font-variable');
    collect(arbitraryFontSizePattern, 'arbitrary-font-size');
    collect(namedFontSizePattern, 'named-font-size');
    collect(fontWeightPattern, 'font-weight');
    collect(lineHeightPattern, 'line-height');
    collect(fontFamilyPattern, 'font-family');
    collect(trackingPattern, 'letter-spacing');
  });
}

const uniqueOccurrences = [...new Map(occurrences.map(item => [
  `${item.type}|${item.file}|${item.line}|${item.value}`,
  item,
])).values()];
const byType = type => uniqueOccurrences.filter(item => item.type === type);
const groupValues = items => [...items.reduce((groups, item) => {
  const current = groups.get(item.value) ?? { value: item.value, count: 0, fileCount: new Set(), examples: [] };
  current.count += 1;
  current.fileCount.add(item.file);
  if (current.examples.length < 8) current.examples.push({ file: item.file, line: item.line, context: item.context });
  groups.set(item.value, current);
  return groups;
}, new Map()).values()]
  .map(item => ({ ...item, fileCount: item.fileCount.size }))
  .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));

const namedColorUtilities = byType('named-color-utility');
const neutralNamedValues = new Set(['white', 'black', 'transparent', 'current']);
const getUtilityFamily = value => {
  const base = value.split(':').at(-1).replace(/^(?:bg|text|border|ring|outline|divide|shadow|from|via|to|fill|stroke|placeholder|decoration)-/, '');
  return base.split('-')[0].split('/')[0];
};
const legacyNamedColors = namedColorUtilities.filter(item => !neutralNamedValues.has(getUtilityFamily(item.value)));
const neutralNamedColors = namedColorUtilities.filter(item => neutralNamedValues.has(getUtilityFamily(item.value)));
const colorDomainSummary = [...colorTokens.reduce((groups, token) => {
  const current = groups.get(token.domain) ?? [];
  current.push(token);
  groups.set(token.domain, current);
  return groups;
}, new Map()).entries()].map(([domain, tokens]) => ({ domain, count: tokens.length, tokens }));

const literalColors = byType('literal-color');
const arbitraryColors = byType('arbitrary-color');
const colorAudit = {
  generatedAt: new Date().toISOString(),
  scope: 'mobile-app/**/*.tsx（排除测试）+ teacherMobileTokens.ts 设计变量定义',
  sourceFileCount: sourceFiles.length,
  tokenCount: tokenDefinitions.length,
  colorTokenCount: colorTokens.length,
  colorTokenDomainCount: colorDomainSummary.length,
  colorTokenDomains: colorDomainSummary,
  colorVariableReferenceCount: byType('color-variable').length,
  colorVariableFileCount: new Set(byType('color-variable').map(item => item.file)).size,
  namedColorUtilityCount: namedColorUtilities.length,
  namedColorUtilityStyleCount: new Set(namedColorUtilities.map(item => item.value)).size,
  legacyNamedColorCount: legacyNamedColors.length,
  legacyNamedColorStyleCount: new Set(legacyNamedColors.map(item => item.value)).size,
  legacyNamedColorFamilyCount: new Set(legacyNamedColors.map(item => getUtilityFamily(item.value))).size,
  neutralNamedColorCount: neutralNamedColors.length,
  literalColorCount: literalColors.length,
  literalColorStyleCount: new Set(literalColors.map(item => item.value)).size,
  literalColorFileCount: new Set(literalColors.map(item => item.file)).size,
  arbitraryColorCount: arbitraryColors.length,
  inlineColorPropertyCount: byType('inline-color-property').length,
  namedColorUtilities: groupValues(namedColorUtilities),
  legacyNamedColorFamilies: [...legacyNamedColors.reduce((groups, item) => {
    const family = getUtilityFamily(item.value);
    groups.set(family, (groups.get(family) ?? 0) + 1);
    return groups;
  }, new Map()).entries()].map(([family, count]) => ({ family, count })).sort((a, b) => b.count - a.count),
  literalColors: groupValues(literalColors),
  colorVariableReferences: groupValues(byType('color-variable')),
  inlineColorProperties: byType('inline-color-property'),
};

const arbitraryFontSizes = byType('arbitrary-font-size');
const namedFontSizes = byType('named-font-size');
const fontVariables = byType('font-variable');
const fontWeights = byType('font-weight');
const typographyAudit = {
  generatedAt: new Date().toISOString(),
  scope: 'mobile-app/**/*.tsx（排除测试）+ teacherMobileTokens.ts + 教师端问卷实际调用的 questionnaireThemeTokens.ts',
  sourceFileCount: sourceFiles.length,
  typographyTokenCount: typographyTokens.length,
  typographyTokens,
  sharedQuestionnaireTypographyTokenCount: sharedQuestionnaireTypographyTokens.length,
  sharedQuestionnaireTypographyTokens,
  effectiveTypographyTokenCount: effectiveTypographyTokens.length,
  effectiveTypographyTokens,
  typographyTokenVariantCount: typographyTokenVariants.length,
  typographyTokenVariants,
  fontVariableReferenceCount: fontVariables.length,
  fontVariableStyleCount: new Set(fontVariables.map(item => item.value)).size,
  fontVariableFileCount: new Set(fontVariables.map(item => item.file)).size,
  undefinedFontVariableCount: new Set(fontVariables
    .map(item => item.value)
    .filter(name => !effectiveTypographyTokens.some(token => token.name === name))).size,
  undefinedFontVariables: [...new Set(fontVariables
    .map(item => item.value)
    .filter(name => !effectiveTypographyTokens.some(token => token.name === name)))].sort(),
  arbitraryFontSizeCount: arbitraryFontSizes.length,
  arbitraryFontSizeStyleCount: new Set(arbitraryFontSizes.map(item => item.value)).size,
  arbitraryFontSizeFileCount: new Set(arbitraryFontSizes.map(item => item.file)).size,
  namedFontSizeCount: namedFontSizes.length,
  namedFontSizeStyleCount: new Set(namedFontSizes.map(item => item.value)).size,
  namedFontSizeFileCount: new Set(namedFontSizes.map(item => item.file)).size,
  fontWeightCount: fontWeights.length,
  fontWeightStyleCount: new Set(fontWeights.map(item => item.value)).size,
  normalOrLighterWeightCount: fontWeights.filter(item => /font-(?:thin|extralight|light|normal)$/.test(item.value)).length,
  lineHeightCount: byType('line-height').length,
  lineHeightStyleCount: new Set(byType('line-height').map(item => item.value)).size,
  fontFamilyCount: byType('font-family').length,
  fontFamilyStyleCount: new Set(byType('font-family').map(item => item.value)).size,
  letterSpacingCount: byType('letter-spacing').length,
  letterSpacingStyleCount: new Set(byType('letter-spacing').map(item => item.value)).size,
  fontVariables: groupValues(fontVariables),
  arbitraryFontSizes: groupValues(arbitraryFontSizes),
  namedFontSizes: groupValues(namedFontSizes),
  fontWeights: groupValues(fontWeights),
  lineHeights: groupValues(byType('line-height')),
  fontFamilies: groupValues(byType('font-family')),
  letterSpacing: groupValues(byType('letter-spacing')),
};

const getArgument = name => process.argv.find(argument => argument.startsWith(`--${name}=`))?.slice(name.length + 3);
const colorOutput = getArgument('color-output');
const typographyOutput = getArgument('typography-output');

const writeAudit = (output, audit) => {
  const outputPath = path.resolve(output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
  console.log(`审计结果已写入 ${path.relative(process.cwd(), outputPath)}`);
};

if (colorOutput) writeAudit(colorOutput, colorAudit);
if (typographyOutput) writeAudit(typographyOutput, typographyAudit);

if (process.argv.includes('--summary') || (!colorOutput && !typographyOutput)) {
  console.log('\n颜色系统');
  console.log(`界面源码文件：${colorAudit.sourceFileCount}`);
  console.log(`颜色相关 Token：${colorAudit.colorTokenCount} / ${colorAudit.colorTokenDomainCount} 个域`);
  console.log(`颜色 Token 引用：${colorAudit.colorVariableReferenceCount}`);
  console.log(`旧命名色：${colorAudit.legacyNamedColorCount} / ${colorAudit.legacyNamedColorStyleCount} 种写法 / ${colorAudit.legacyNamedColorFamilyCount} 个色系`);
  console.log(`直接色值：${colorAudit.literalColorCount} / ${colorAudit.literalColorStyleCount} 种`);
  console.log('\n字体系统');
  console.log(`有效字体 Token：${typographyAudit.effectiveTypographyTokenCount}（主变量 ${typographyAudit.typographyTokenCount}，问卷共享 ${typographyAudit.sharedQuestionnaireTypographyTokenCount}）`);
  console.log(`跨作用域差异：${typographyAudit.typographyTokenVariantCount}`);
  console.log(`未定义字体 Token 引用：${typographyAudit.undefinedFontVariableCount}`);
  console.log(`字体 Token 引用：${typographyAudit.fontVariableReferenceCount}`);
  console.log(`直接像素字号：${typographyAudit.arbitraryFontSizeCount} / ${typographyAudit.arbitraryFontSizeStyleCount} 种`);
  console.log(`Tailwind 字号：${typographyAudit.namedFontSizeCount} / ${typographyAudit.namedFontSizeStyleCount} 种`);
  console.log(`字重：${typographyAudit.fontWeightCount} / ${typographyAudit.fontWeightStyleCount} 种`);
  console.log(`行高：${typographyAudit.lineHeightCount} / ${typographyAudit.lineHeightStyleCount} 种`);
}
