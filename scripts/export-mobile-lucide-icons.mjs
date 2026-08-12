import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as lucideIcons from 'lucide-react';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const sourceRoot = path.join(projectRoot, 'mobile-app');
const outputRoot = path.join(sourceRoot, 'assets', 'resources', 'lucide-icons');
const groupedOutputRoot = path.join(outputRoot, 'by-source');
const sourceExtensions = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);

const toKebabCase = (value) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/([A-Za-z])(\d+)/g, '$1-$2')
  .replace(/(\d+)([A-Za-z])/g, '$1-$2')
  .toLowerCase();

const walkSourceFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkSourceFiles(absolutePath);
    return sourceExtensions.has(path.extname(entry.name)) ? [absolutePath] : [];
  });

const iconUsage = new Map();
const sourceFiles = walkSourceFiles(sourceRoot);

for (const absolutePath of sourceFiles) {
  const source = fs.readFileSync(absolutePath, 'utf8');
  const sourceFile = ts.createSourceFile(absolutePath, source, ts.ScriptTarget.Latest, true);

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || statement.moduleSpecifier.text !== 'lucide-react') continue;

    const importClause = statement.importClause;
    const namedBindings = importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;

    for (const element of namedBindings.elements) {
      if (importClause.isTypeOnly || element.isTypeOnly) continue;

      const exportName = element.propertyName?.text ?? element.name.text;
      if (exportName === 'LucideIcon') continue;

      const relativePath = path.relative(projectRoot, absolutePath).split(path.sep).join('/');
      const usageFiles = iconUsage.get(exportName) ?? new Set();
      usageFiles.add(relativePath);
      iconUsage.set(exportName, usageFiles);
    }
  }
}

const sharedIconsPath = path.join(sourceRoot, 'components', 'Icons.tsx');
const sharedIconsSource = fs.readFileSync(sharedIconsPath, 'utf8');
const sharedIconsFile = ts.createSourceFile(sharedIconsPath, sharedIconsSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const lucideLocalNames = new Map();
const sharedIconWrappers = new Map();

for (const statement of sharedIconsFile.statements) {
  if (ts.isImportDeclaration(statement) && statement.moduleSpecifier.text === 'lucide-react') {
    const namedBindings = statement.importClause?.namedBindings;
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const element of namedBindings.elements) {
        lucideLocalNames.set(element.name.text, element.propertyName?.text ?? element.name.text);
      }
    }
  }
}

const findWrappedLucideName = (node) => {
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
    const localName = node.tagName.getText(sharedIconsFile);
    return lucideLocalNames.get(localName);
  }

  let result;
  ts.forEachChild(node, (child) => {
    if (!result) result = findWrappedLucideName(child);
  });
  return result;
};

for (const statement of sharedIconsFile.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
    const lucideName = findWrappedLucideName(declaration.initializer);
    if (lucideName) sharedIconWrappers.set(declaration.name.text, lucideName);
  }
}

for (const absolutePath of sourceFiles) {
  if (absolutePath === sharedIconsPath) continue;
  const source = fs.readFileSync(absolutePath, 'utf8');
  const sourceFile = ts.createSourceFile(absolutePath, source, ts.ScriptTarget.Latest, true);
  const relativePath = path.relative(projectRoot, absolutePath).split(path.sep).join('/');

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const moduleName = statement.moduleSpecifier.text;
    if (!/(?:^|\/)components\/Icons$|(?:^|\/)Icons$/.test(moduleName)) continue;

    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;
    for (const element of namedBindings.elements) {
      const wrapperName = element.propertyName?.text ?? element.name.text;
      const lucideName = sharedIconWrappers.get(wrapperName);
      if (!lucideName) continue;
      const usageFiles = iconUsage.get(lucideName) ?? new Set();
      usageFiles.add(relativePath);
      iconUsage.set(lucideName, usageFiles);
    }
  }
}

const packageJsonPath = path.join(projectRoot, 'node_modules', 'lucide-react', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const icons = [...iconUsage.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([exportName, usageFiles]) => ({
    exportName,
    fileName: `${toKebabCase(exportName)}.svg`,
    usageFiles: [...usageFiles].sort(),
  }));

fs.mkdirSync(outputRoot, { recursive: true });

fs.rmSync(groupedOutputRoot, { recursive: true, force: true });

for (const entry of fs.readdirSync(outputRoot, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.svg')) {
    fs.unlinkSync(path.join(outputRoot, entry.name));
  }
}

for (const icon of icons) {
  const Icon = lucideIcons[icon.exportName];
  if (!Icon) throw new Error(`lucide-react does not export ${icon.exportName}`);

  const markup = renderToStaticMarkup(React.createElement(Icon, {
    width: 24,
    height: 24,
    color: '#171513',
    strokeWidth: 2,
  }));
  const formattedMarkup = `${markup
    .replace(/<([a-z][\w:-]*)([^>]*)><\/\1>/g, '<$1$2 />')
    .replace(/></g, '>\n  <')
    .replace(/\n  <\/svg>$/, '\n</svg>')}\n`;

  fs.writeFileSync(path.join(outputRoot, icon.fileName), formattedMarkup);

  for (const usageFile of icon.usageFiles) {
    const relativeSourcePath = usageFile.replace(/^mobile-app\//, '').replace(/\.[^.]+$/, '');
    const sourceDirectory = path.join(groupedOutputRoot, relativeSourcePath);
    fs.mkdirSync(sourceDirectory, { recursive: true });
    fs.copyFileSync(
      path.join(outputRoot, icon.fileName),
      path.join(sourceDirectory, icon.fileName),
    );
  }
}

const sourceIndex = [...new Set(icons.flatMap((icon) => icon.usageFiles))]
  .sort()
  .map((sourceFile) => ({
    sourceFile,
    directory: `by-source/${sourceFile.replace(/^mobile-app\//, '').replace(/\.[^.]+$/, '')}`,
    icons: icons
      .filter((icon) => icon.usageFiles.includes(sourceFile))
      .map(({ exportName, fileName }) => ({ exportName, fileName })),
  }));

const manifest = {
  package: 'lucide-react',
  version: packageJson.version,
  generatedFrom: 'mobile-app direct imports and shared icon wrappers',
  iconCount: icons.length,
  defaults: {
    format: 'SVG',
    width: 24,
    height: 24,
    color: '#171513',
    strokeWidth: 2,
  },
  icons,
};

fs.writeFileSync(
  path.join(outputRoot, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(outputRoot, 'source-index.json'),
  `${JSON.stringify({ sourceCount: sourceIndex.length, sources: sourceIndex }, null, 2)}\n`,
);
fs.copyFileSync(
  path.join(projectRoot, 'node_modules', 'lucide-react', 'LICENSE'),
  path.join(outputRoot, 'LICENSE'),
);

console.log(`Exported ${icons.length} Lucide icons to ${path.relative(projectRoot, outputRoot)}`);
