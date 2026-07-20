import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');

assert.match(app, /const showTabBar = \['home_log', 'class_list', 'me'\]\.includes\(currentView\)/);
assert.match(app, /const primaryTabViewKey = showTabBar \? 'teacher-primary-tabs' : currentView/);
assert.match(app, /const pageTransitionClass = showTabBar \? '' : 'animate-page-enter'/);
assert.match(app, /key=\{primaryTabViewKey\}/);
assert.match(app, /className=\{`min-h-0 flex-1 relative \$\{pageTransitionClass\}/);
assert.doesNotMatch(app, /className=\{`flex-1 relative animate-page-enter/);

console.log('teacher primary tab transition assertions passed');
