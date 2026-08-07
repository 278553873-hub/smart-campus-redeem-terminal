import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const assetsSource = read('../assets/images.ts');
const questionnaireSource = read('./questionnaire/QuestionnaireManagementView.tsx');
const archiveSource = read('./archive-design/ArchiveDesignView.tsx');
const classDetailSource = read('./ClassDetailView.tsx');
const classListSource = read('./ClassListView.tsx');
const featureSource = read('./MeFeatureViews.tsx');
const emptyStateSource = read('../components/ui/MobileEmptyState.tsx');

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

for (const fileName of [
  'default-state-giraffe-worried-clipboard-3d-color-v1.png',
  'default-state-giraffe-chair-3d-color-v1.png',
  'default-state-giraffe-magnifier-3d-color-v1.png',
  'default-state-giraffe-box-clipboard-3d-color-v1.png',
]) {
  requireText(assetsSource, `resources/default-states/${fileName}`, `缺省图资源未统一登记：${fileName}`);
}

requireText(questionnaireSource, 'ASSETS.DEFAULT_STATE.WORRIED_CLIPBOARD', '采集管理为空时应使用担忧清单缺省图。');
requireText(archiveSource, 'ASSETS.DEFAULT_STATE.WORRIED_CLIPBOARD', '档案为空时应使用担忧清单缺省图。');
requireText(classDetailSource, 'ASSETS.DEFAULT_STATE.MAGNIFIER', '学生搜索无结果时应使用放大镜缺省图。');
requireText(classDetailSource, 'ASSETS.DEFAULT_STATE.CHAIR', '没有学生或分组时应使用椅子缺省图。');
requireText(classListSource, 'ASSETS.DEFAULT_STATE.CHAIR', '没有班级时应使用椅子缺省图。');
requireText(featureSource, 'ASSETS.DEFAULT_STATE.BOX_CLIPBOARD', '科目或部门为空时应使用箱子清单缺省图。');
requireText(emptyStateSource, 'alt=""', '缺省图作为装饰图片时必须使用空替代文本。');
requireText(emptyStateSource, 'role="status"', '缺省态必须提供状态语义。');

const classListEmptyState = classListSource.slice(
  classListSource.indexOf('{visibleClasses.length === 0'),
  classListSource.indexOf('</section>', classListSource.indexOf('{visibleClasses.length === 0')),
);
requireText(classListEmptyState, 'imageClassName="w-[72%] min-w-[188px] max-w-[236px]"', '班级缺省图应复用档案设计页的展示尺寸。');
if (classListEmptyState.includes('bg-white') || classListEmptyState.includes('shadow-card')) {
  throw new Error('班级空状态不应包在白色卡片内。');
}

console.log('Teacher default-state illustration mappings passed');
