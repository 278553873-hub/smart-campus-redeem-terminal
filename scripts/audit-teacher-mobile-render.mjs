#!/usr/bin/env node
/**
 * 教师手机端「页面渲染冒烟」检查
 *
 * 解决的问题：构建通过、静态断言全过，但页面一打开就是白屏。
 * 这类问题只在运行时暴露（组件里用了没导入的 Hook、模块级初始化报错、渲染期读到空字段等），
 * 所以这里真的把页面渲染一遍，出错时直接给出源码位置。
 *
 * 用法：node scripts/audit-teacher-mobile-render.mjs
 * 扩展：在 scripts/teacher-mobile-render-smoke.mjs 里补一条 renderPage 调用。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';

const newline = String.fromCharCode(10);
const projectRoot = path.resolve(import.meta.dirname, '..');
const harnessPath = path.join(import.meta.dirname, 'teacher-mobile-render-smoke.mjs');

const workDirectory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'teacher-mobile-render-')));
const bundlePath = path.join(workDirectory, 'render-harness.mjs');
const resultPath = path.join(workDirectory, 'render-results.json');

const reportFailure = (message, details) => {
  console.log('❌ 教师手机端页面渲染冒烟未通过：' + message);
  if (details) console.log(details);
  process.exitCode = 1;
};

const readResults = () => {
  if (!fs.existsSync(resultPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  } catch (error) {
    return null;
  }
};

/** 从报错堆栈里挑出第一处项目源码位置，方便直接去改文件。 */
const locateSource = stack => {
  for (const stackLine of String(stack).split(newline)) {
    const frame = stackLine.trim();
    const openIndex = frame.indexOf('(');
    let candidate = openIndex >= 0 && frame.endsWith(')') ? frame.slice(openIndex + 1, frame.length - 1) : frame;
    const parts = candidate.split(':');
    if (parts.length < 3) continue;
    const column = parts[parts.length - 1];
    const lineNumber = parts[parts.length - 2];
    let file = parts.slice(0, parts.length - 2).join(':');
    if (!/^[0-9]+$/.test(column) || !/^[0-9]+$/.test(lineNumber)) continue;
    if (file.startsWith('file://')) file = decodeURIComponent(file.slice('file://'.length));
    if (file.startsWith('node:') || file.includes('node_modules')) continue;
    const absoluteFile = resolveProjectFile(file);
    if (!absoluteFile) continue;
    return path.relative(projectRoot, absoluteFile) + ':' + lineNumber + ':' + column;
  }
  return '未能定位到项目源码位置';
};

try {
  let buildResult = null;

  try {
    buildResult = await build({
      entryPoints: [harnessPath],
      bundle: true,
      platform: 'node',
      format: 'esm',
      jsx: 'automatic',
      sourcemap: 'inline',
      sourcesContent: true,
      alias: { '@': projectRoot },
      define: {
        'process.env.API_KEY': '"render-smoke"',
        'process.env.GEMINI_API_KEY': '"render-smoke"',
      },
      loader: {
        '.png': 'dataurl',
        '.jpg': 'dataurl',
        '.jpeg': 'dataurl',
        '.gif': 'dataurl',
        '.svg': 'dataurl',
        '.webp': 'dataurl',
        '.mp4': 'dataurl',
        '.css': 'empty',
      },
      banner: {
        js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
      },
      write: false,
      logLevel: 'silent',
    });
  } catch (error) {
    const details = error && error.errors
      ? error.errors.map(item => '   ' + (item.location ? item.location.file + ':' + item.location.line + ' ' : '') + item.text).join(newline)
      : '   ' + (error && error.message ? error.message : error);
    reportFailure('打包阶段就失败，说明页面依赖已经断链', details);
  }

  if (buildResult) {
    fs.writeFileSync(bundlePath, buildResult.outputFiles[0].text);

    const child = spawnSync(process.execPath, ['--enable-source-maps', bundlePath, resultPath], {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 180000,
      maxBuffer: 64 * 1024 * 1024,
    });

    const results = readResults();

    if (!results) {
      const stderrTail = String(child.stderr || '').trim().split(newline).slice(-8).join(newline);
      reportFailure('渲染进程异常退出（退出码 ' + child.status + '）', stderrTail || '   没有任何错误输出');
    } else {
      const failures = results.filter(item => !item.ok);

      for (const item of failures) {
        console.log('❌ ' + item.name + '：' + item.message);
        console.log('   位置：' + locateSource(item.stack)); if (process.env.RENDER_SMOKE_DEBUG) console.log(item.stack);
      }

      if (failures.length > 0) {
        console.log('');
        console.log('共检查 ' + results.length + ' 个页面，失败 ' + failures.length + ' 个。');
        process.exitCode = 1;
      } else {
        const totalLength = results.reduce((sum, item) => sum + item.htmlLength, 0);
        console.log('✅ 教师手机端页面渲染冒烟通过：' + results.length + ' 个页面，共输出 ' + totalLength + ' 字符 HTML');
        for (const item of results) {
          console.log('   · ' + item.name + '（' + item.htmlLength + ' 字符）');
        }
      }
    }
  }
} finally {
  fs.rmSync(workDirectory, { recursive: true, force: true });
}

/**
 * 打包产物 sourcemap 里的源码路径是相对产物目录写的，所以按两种基准各找一次，
 * 只认项目目录下真实存在的文件。
 */
function resolveProjectFile(file) {
  const candidates = path.isAbsolute(file)
    ? [file, path.resolve(projectRoot, path.relative(workDirectory, file))]
    : [path.resolve(workDirectory, file), path.resolve(projectRoot, file)];
  for (const candidate of candidates) {
    if (candidate.startsWith(projectRoot) && fs.existsSync(candidate)) return candidate;
  }
  return null;
}
