import assert from 'node:assert/strict';
import fs from 'node:fs';

const tokens = fs.readFileSync('mobile-app/styles/teacherMobileTokens.ts', 'utf8');
const css = fs.readFileSync('mobile-app/index.css', 'utf8');
const headteacher = fs.readFileSync('mobile-app/views/AiHeadteacherAssistantView.tsx', 'utf8');
const principal = fs.readFileSync('mobile-app/views/AiPrincipalAssistantView.tsx', 'utf8');
const guidelines = fs.readFileSync('design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', 'utf8');

assert.match(tokens, /export const teacherAssistantRoleSemantic = \{/);
assert.match(tokens, /headteacher: \{/);
assert.match(tokens, /primary: '#1F9E84'/);
assert.match(tokens, /strong: '#126B5B'/);
assert.match(tokens, /soft: '#EFFAF7'/);
assert.match(tokens, /border: '#B7E7DB'/);
assert.match(tokens, /highlight: '#86E0CC'/);
assert.match(tokens, /principal: \{/);
assert.match(tokens, /accent: teacherBrandPalette\.gold\[500\]/);
assert.match(tokens, /highlight: teacherBrandPalette\.gold\[300\]/);
assert.match(tokens, /'--tm-role-principal-highlight': teacherAssistantRoleSemantic\.principal\.highlight/);
assert.match(tokens, /student: \{\s+primary: teacherBrandPalette\.jade\[500\]/);
assert.doesNotMatch(tokens, /teacherAiAssistantVisual|--tm-ai-assistant-/);

const assistantCssStart = css.indexOf('@keyframes ai-assistant-shine');
const assistantCssEnd = css.indexOf('/* --- App Simulation Wrappers --- */', assistantCssStart);
assert.ok(assistantCssStart >= 0 && assistantCssEnd > assistantCssStart);
const assistantCss = css.slice(assistantCssStart, assistantCssEnd);

assert.match(assistantCss, /\.ai-assistant-theme-headteacher/);
assert.match(assistantCss, /var\(--tm-role-headteacher-primary\)/);
assert.match(assistantCss, /var\(--tm-role-headteacher-highlight\)/);
assert.match(assistantCss, /\.ai-assistant-theme-principal/);
assert.match(assistantCss, /--tm-assistant-role-primary: var\(--tm-role-principal-primary\)/);
assert.match(assistantCss, /--tm-assistant-role-highlight: var\(--tm-role-principal-highlight\)/);

for (const source of [headteacher, principal]) {
  assert.match(source, /ai-assistant-dialog-card/);
  assert.match(source, /ai-assistant-typewriter-shine/);
}

assert.match(headteacher, /tm-role-headteacher-primary/);
assert.match(principal, /tm-role-principal-primary/);
assert.match(headteacher, /ai-assistant-theme-headteacher teacher-assistant-page/);
assert.match(principal, /ai-assistant-theme-principal teacher-assistant-page/);

assert.match(guidelines, /班主任助理使用鲜活翡翠青角色 Token/);
assert.match(guidelines, /校长助理使用品牌红与奖励金角色 Token/);

console.log('AI assistant intro special color assertions passed');
