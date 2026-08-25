import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const sourceRoot = path.resolve('mobile-app');
const files = [];

const walk = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.tsx') && !entry.name.includes('.test.')) files.push(fullPath);
  }
};

const extractTokens = className => {
  const tokens = className
    .replace(/\[动态\][^|]+/g, '')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(Boolean);
  const pick = matcher => [...new Set(tokens.filter(matcher))].sort();
  const has = value => tokens.some(token => token === value || token.endsWith(`:${value}`));

  const backgrounds = pick(token => /^(?:[a-z-]+:)*bg-/.test(token));
  const textColors = pick(token => {
    if (!/^(?:[a-z-]+:)*text-/.test(token)) return false;
    return /text-(?:white|black|red|green|blue|gray|slate|amber|yellow|emerald|transparent)/.test(token)
      || token.includes('text-[var(--tm-text')
      || token.includes('text-[var(--tm-brand')
      || token.includes('text-[var(--tm-status');
  });
  const borders = pick(token => /^(?:[a-z-]+:)*(?:border(?:-|$)|ring-)/.test(token));
  const shadows = pick(token => /^(?:[a-z-]+:)*shadow(?:-|$)/.test(token));
  const radii = pick(token => /^(?:[a-z-]+:)*rounded(?:-|$)/.test(token));
  const heights = pick(token => /^(?:[a-z-]+:)*(?:h|min-h|max-h)-/.test(token));
  const widths = pick(token => /^(?:[a-z-]+:)*(?:w|min-w|max-w)-/.test(token));
  const states = pick(token => /^(?:active|disabled|hover|focus|focus-visible|aria-selected|data-\[[^\]]+\]):/.test(token));

  let structure = '自适应文案';
  if (has('w-full')) structure = '整行';
  if (widths.some(token => /\bw-(?:8|9|10|11|12|14|16|\[\d+px\])/.test(token)) && heights.length) structure = '定宽图标';
  if (has('rounded-full') && structure === '定宽图标') structure = '圆形图标';

  return {
    structure,
    backgrounds,
    textColors,
    borders,
    shadows,
    radii,
    heights,
    widths,
    states,
  };
};

const resolveClassName = (node, sourceFile, constants) => {
  if (!node) return '';
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isIdentifier(node) && constants.has(node.text)) return constants.get(node.text);
  if (ts.isParenthesizedExpression(node)) return resolveClassName(node.expression, sourceFile, constants);
  if (ts.isTemplateExpression(node)) {
    let result = node.head.text;
    for (const span of node.templateSpans) {
      const resolved = resolveClassName(span.expression, sourceFile, constants);
      result += resolved || `[动态]${span.expression.getText(sourceFile)}`;
      result += span.literal.text;
    }
    return result;
  }
  if (ts.isConditionalExpression(node)) {
    return `${resolveClassName(node.whenTrue, sourceFile, constants)} | ${resolveClassName(node.whenFalse, sourceFile, constants)}`;
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    return resolveClassName(node.left, sourceFile, constants) + resolveClassName(node.right, sourceFile, constants);
  }
  return `[动态]${node.getText(sourceFile).replace(/\s+/g, ' ')}`;
};

const getButtonLabel = (node, sourceFile) => {
  const parts = [];
  const collectExpressionLabels = expression => {
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
      const value = expression.text.trim();
      if (value && !value.includes('var(--') && !value.includes('className')) parts.push(value);
      return;
    }
    ts.forEachChild(expression, collectExpressionLabels);
  };
  const visit = child => {
    if (ts.isJsxText(child)) {
      const value = child.text.replace(/\s+/g, ' ').trim();
      if (value) parts.push(value);
    } else if (ts.isJsxSelfClosingElement(child)) {
      parts.push(`<${child.tagName.getText(sourceFile)}>`);
      return;
    } else if (
      ts.isJsxExpression(child)
      && child.expression
    ) {
      collectExpressionLabels(child.expression);
      return;
    }
    ts.forEachChild(child, visit);
  };
  ts.forEachChild(node, visit);
  return parts.join(' ').slice(0, 100) || '(动态图标或文案)';
};

walk(sourceRoot);

const controls = [];
for (const absoluteFile of files) {
  const sourceText = fs.readFileSync(absoluteFile, 'utf8');
  const relativeFile = path.relative(process.cwd(), absoluteFile);
  const sourceFile = ts.createSourceFile(relativeFile, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const constants = new Map();

  const collectConstants = node => {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.initializer
      && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))
    ) {
      constants.set(node.name.text, node.initializer.text);
    }
    ts.forEachChild(node, collectConstants);
  };
  collectConstants(sourceFile);

  const collectDescendantClasses = node => {
    const classes = [];
    const visit = child => {
      const opening = ts.isJsxElement(child)
        ? child.openingElement
        : ts.isJsxSelfClosingElement(child)
          ? child
          : null;
      if (opening) {
        const classAttribute = opening.attributes.properties.find(attribute => (
          ts.isJsxAttribute(attribute) && attribute.name.getText(sourceFile) === 'className'
        ));
        if (classAttribute?.initializer) {
          let className = '';
          if (ts.isStringLiteral(classAttribute.initializer)) className = classAttribute.initializer.text;
          else if (ts.isJsxExpression(classAttribute.initializer)) {
            className = resolveClassName(classAttribute.initializer.expression, sourceFile, constants);
          }
          if (className) classes.push(className.replace(/\s+/g, ' ').trim());
        }
      }
      ts.forEachChild(child, visit);
    };
    if (ts.isJsxElement(node)) node.children.forEach(visit);
    return classes;
  };

  const collectControls = node => {
    const opening = ts.isJsxElement(node)
      ? node.openingElement
      : ts.isJsxSelfClosingElement(node)
        ? node
        : null;
    const tagName = opening?.tagName.getText(sourceFile);
    const isNativeButton = tagName === 'button';
    const isButtonLikeAnchor = tagName === 'a' && opening?.attributes.properties.some(attribute => (
      ts.isJsxAttribute(attribute) && attribute.name.getText(sourceFile) === 'className'
    ));
    if (isNativeButton || isButtonLikeAnchor) {
      const classAttribute = opening.attributes.properties.find(attribute => (
        ts.isJsxAttribute(attribute) && attribute.name.getText(sourceFile) === 'className'
      ));
      let className = '(无 className)';
      if (classAttribute?.initializer) {
        if (ts.isStringLiteral(classAttribute.initializer)) className = classAttribute.initializer.text;
        else if (ts.isJsxExpression(classAttribute.initializer)) {
          className = resolveClassName(classAttribute.initializer.expression, sourceFile, constants);
        }
      }
      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      controls.push({
        element: isNativeButton ? 'button' : 'a',
        file: relativeFile,
        line: position.line + 1,
        label: ts.isJsxElement(node) ? getButtonLabel(node, sourceFile) : '(自闭合按钮)',
        className: className.replace(/\s+/g, ' ').trim(),
        childClassNames: collectDescendantClasses(node),
      });
    }
    ts.forEachChild(node, collectControls);
  };
  collectControls(sourceFile);
}

const classGroups = new Map();
for (const control of controls) {
  const exactStyle = JSON.stringify([control.className, control.childClassNames]);
  if (!classGroups.has(exactStyle)) classGroups.set(exactStyle, []);
  classGroups.get(exactStyle).push(control);
}

const signatureGroups = new Map();
for (const control of controls) {
  const dimensions = extractTokens(control.className);
  const childDimensions = control.childClassNames
    .map(extractTokens)
    .filter(child => (
      child.backgrounds.length
      || child.textColors.length
      || child.borders.length
      || child.shadows.length
      || child.radii.length
    ));
  const signature = JSON.stringify({ dimensions, childDimensions });
  if (!signatureGroups.has(signature)) {
    signatureGroups.set(signature, { dimensions, childDimensions, controls: [] });
  }
  signatureGroups.get(signature).controls.push(control);
}

const sortGroups = groups => [...groups.values()].sort((left, right) => right.controls.length - left.controls.length);
const nativeButtons = controls.filter(control => control.element === 'button');
const buttonLikeAnchors = controls.filter(control => control.element === 'a');
const audit = {
  generatedAt: new Date().toISOString(),
  scope: 'mobile-app/**/*.tsx（排除测试）',
  buttonCount: nativeButtons.length,
  buttonLikeAnchorCount: buttonLikeAnchors.length,
  controlCount: controls.length,
  fileCount: new Set(nativeButtons.map(button => button.file)).size,
  exactStyleCount: classGroups.size,
  visualSignatureCount: signatureGroups.size,
  dynamicClassNameCount: controls.filter(control => control.className.includes('[动态]')).length,
  noClassNameCount: controls.filter(control => control.className === '(无 className)').length,
  signatures: sortGroups(signatureGroups).map(group => ({
    count: group.controls.length,
    ...group.dimensions,
    childDimensions: group.childDimensions,
    examples: group.controls.slice(0, 8).map(({ element, file, line, label }) => ({ element, file, line, label })),
  })),
  controls,
};

const outputArgument = process.argv.find(argument => argument.startsWith('--output='));
if (outputArgument) {
  const outputPath = path.resolve(outputArgument.slice('--output='.length));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
  console.log(`审计结果已写入 ${path.relative(process.cwd(), outputPath)}`);
} else if (process.argv.includes('--summary')) {
  console.log(`按钮实例：${audit.buttonCount}`);
  console.log(`按钮形链接：${audit.buttonLikeAnchorCount}`);
  console.log(`可见命令控件合计：${audit.controlCount}`);
  console.log(`涉及文件：${audit.fileCount}`);
  console.log(`精确视觉写法：${audit.exactStyleCount}`);
  console.log(`视觉签名：${audit.visualSignatureCount}`);
  console.log(`含动态样式：${audit.dynamicClassNameCount}`);
  console.log(`无 className：${audit.noClassNameCount}`);
} else {
  console.log(JSON.stringify(audit, null, 2));
}
