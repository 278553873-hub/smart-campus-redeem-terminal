import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');

assert.match(app, /const showTabBar = \['home_log', 'class_list', 'me'\]\.includes\(currentView\) && !isStudentTeamCreateView/);
assert.match(app, /const primaryTabViewKey = currentView === 'class_list' \? 'teacher-primary-tabs' : showTabBar \? 'teacher-primary-tabs' : currentView/);
assert.match(app, /const pageTransitionClass = showTabBar \|\| isStudentTeamCreateView \? '' : 'animate-page-enter'/);
assert.match(app, /const hasPlainBackground = PLAIN_BACKGROUND_VIEWS\.includes\(currentView\) \|\| isStudentTeamCreateView/);
assert.match(app, /key=\{primaryTabViewKey\}/);
assert.match(app, /className=\{`min-h-0 flex-1 relative \$\{pageTransitionClass\}/);
assert.doesNotMatch(app, /className=\{`flex-1 relative animate-page-enter/);

console.log('teacher primary tab transition assertions passed');
