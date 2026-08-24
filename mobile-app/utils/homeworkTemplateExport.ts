import {
  getHomeworkTemplateLayout,
  type HomeworkTemplatePageSize,
} from '../domain/homework';

export interface HomeworkTemplateExportOptions {
  pageSize?: HomeworkTemplatePageSize;
}

interface HomeworkTemplateRenderOptions extends HomeworkTemplateExportOptions {
  renderWidth?: number;
}

const LOGICAL_PAGE_WIDTH = 3508;
const LOGICAL_PAGE_HEIGHT = 2480;
const MARGIN = 80;
const TABLE_GAP = 50;
const ASSIGNMENT_COUNT = 6;
const HOMEWORK_STATUS_LABELS = ['优', '良', '合格', '待合格', '未交'] as const;
const TABLE_ASSIGNMENT_HEADER_HEIGHT = 54;
const TABLE_STATUS_HEADER_HEIGHT = 104;
const TABLE_HEADER_HEIGHT = TABLE_ASSIGNMENT_HEADER_HEIGHT + TABLE_STATUS_HEADER_HEIGHT;
const TABLE_SEQUENCE_WIDTH_RATIO = 0.07;

const drawText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: { size?: number; weight?: number; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; color?: string } = {},
) => {
  context.fillStyle = options.color ?? '#171717';
  context.font = `${options.weight ?? 400} ${options.size ?? 28}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  context.textAlign = options.align ?? 'left';
  context.textBaseline = options.baseline ?? 'middle';
  context.fillText(text, x, y);
};

const drawCell = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text = '',
  options: { size?: number; weight?: number; fill?: string; align?: CanvasTextAlign } = {},
) => {
  if (options.fill) {
    context.fillStyle = options.fill;
    context.fillRect(x, y, width, height);
  }
  context.strokeStyle = '#6b7280';
  context.lineWidth = 2;
  context.strokeRect(x, y, width, height);
  if (text) {
    const align = options.align ?? 'center';
    const textX = align === 'left' ? x + 14 : align === 'right' ? x + width - 14 : x + width / 2;
    drawText(context, text, textX, y + height / 2, { size: options.size, weight: options.weight, align });
  }
};

const drawVerticalCellText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  const characters = Array.from(text);
  const fontSize = 24;
  const lineHeight = 24;
  const textHeight = characters.length * lineHeight;
  characters.forEach((character, index) => {
    drawText(context, character, x + width / 2, y + (height - textHeight) / 2 + lineHeight * (index + 0.5), {
      size: fontSize,
      weight: 600,
      align: 'center',
    });
  });
};

const drawSequenceTable = ({
  context,
  sequences,
  x,
  y,
  width,
  rowHeight,
}: {
  context: CanvasRenderingContext2D;
  sequences: string[];
  x: number;
  y: number;
  width: number;
  rowHeight: number;
}) => {
  const sequenceWidth = width * TABLE_SEQUENCE_WIDTH_RATIO;
  const assignmentWidth = (width - sequenceWidth) / ASSIGNMENT_COUNT;
  const statusWidth = assignmentWidth / HOMEWORK_STATUS_LABELS.length;

  drawCell(context, x, y, sequenceWidth, TABLE_HEADER_HEIGHT, '学号', { size: 24, weight: 600, fill: '#f3f4f6' });
  Array.from({ length: ASSIGNMENT_COUNT }, (_, assignmentIndex) => {
    const assignmentX = x + sequenceWidth + assignmentIndex * assignmentWidth;
    drawCell(context, assignmentX, y, assignmentWidth, TABLE_ASSIGNMENT_HEADER_HEIGHT, `作业${assignmentIndex + 1}`, { size: 24, weight: 600, fill: '#f3f4f6' });
    HOMEWORK_STATUS_LABELS.forEach((label, statusIndex) => {
      const statusX = assignmentX + statusIndex * statusWidth;
      drawCell(context, statusX, y + TABLE_ASSIGNMENT_HEADER_HEIGHT, statusWidth, TABLE_STATUS_HEADER_HEIGHT, '', { fill: '#f9fafb' });
      drawVerticalCellText(context, label, statusX, y + TABLE_ASSIGNMENT_HEADER_HEIGHT, statusWidth, TABLE_STATUS_HEADER_HEIGHT);
    });
  });

  sequences.forEach((sequence, index) => {
    const rowY = y + TABLE_HEADER_HEIGHT + index * rowHeight;
    const fontSize = Math.max(17, Math.min(25, rowHeight * 0.5));
    drawCell(context, x, rowY, sequenceWidth, rowHeight, sequence, { size: fontSize });
    Array.from({ length: ASSIGNMENT_COUNT }, (_, assignmentIndex) => {
      HOMEWORK_STATUS_LABELS.forEach((_, statusIndex) => {
        drawCell(
          context,
          x + sequenceWidth + assignmentIndex * assignmentWidth + statusIndex * statusWidth,
          rowY,
          statusWidth,
          rowHeight,
        );
      });
    });
  });
};

export const createHomeworkTemplateCanvas = ({ pageSize = 'A4', renderWidth }: HomeworkTemplateRenderOptions = {}) => {
  const layout = getHomeworkTemplateLayout(pageSize);
  const canvas = document.createElement('canvas');
  canvas.width = renderWidth ?? layout.page.width;
  canvas.height = renderWidth
    ? Math.round(renderWidth * LOGICAL_PAGE_HEIGHT / LOGICAL_PAGE_WIDTH)
    : layout.page.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('当前设备无法生成作业模板');
  const scale = canvas.width / LOGICAL_PAGE_WIDTH;
  context.scale(scale, scale);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, LOGICAL_PAGE_WIDTH, LOGICAL_PAGE_HEIGHT);

  drawText(context, '作业登记表', LOGICAL_PAGE_WIDTH / 2, 92, { size: 48, weight: 700, align: 'center' });
  drawText(context, '班级：____________________________', MARGIN, 170, { size: 28, weight: 600 });
  drawText(context, '学科：________________', 2200, 170, { size: 28 });

  const assignmentTop = 220;
  const assignmentHeight = 250;
  const assignmentWidth = (LOGICAL_PAGE_WIDTH - MARGIN * 2) / ASSIGNMENT_COUNT;
  Array.from({ length: ASSIGNMENT_COUNT }, (_, index) => {
    const x = MARGIN + index * assignmentWidth;
    drawCell(context, x, assignmentTop, assignmentWidth, 58, `作业${index + 1}`, { size: 24, weight: 600, fill: '#f3f4f6' });
    drawCell(context, x, assignmentTop + 58, assignmentWidth, 72, '日期：', { size: 22, align: 'left' });
    drawCell(context, x, assignmentTop + 130, assignmentWidth, assignmentHeight - 130, '主题：', { size: 22, align: 'left' });
  });

  const tableTop = 515;
  const tableBottom = LOGICAL_PAGE_HEIGHT - 135;
  const tableWidth = (LOGICAL_PAGE_WIDTH - MARGIN * 2 - TABLE_GAP) / 2;
  const tableHeight = tableBottom - tableTop;
  const maxSideCount = Math.max(layout.leftSequences.length, layout.rightSequences.length, 1);
  const rowHeight = (tableHeight - TABLE_HEADER_HEIGHT) / maxSideCount;
  drawSequenceTable({ context, sequences: layout.leftSequences, x: MARGIN, y: tableTop, width: tableWidth, rowHeight });
  drawSequenceTable({ context, sequences: layout.rightSequences, x: MARGIN + tableWidth + TABLE_GAP, y: tableTop, width: tableWidth, rowHeight });

  drawText(context, '填写：每次作业只在对应等级格内打勾、划线或涂抹；空白 = 尚未登记', LOGICAL_PAGE_WIDTH / 2, LOGICAL_PAGE_HEIGHT - 72, { size: 24, weight: 600, align: 'center' });
  return canvas;
};

const previewDataUrlCache = new Map<HomeworkTemplatePageSize, string>();

export const getHomeworkTemplatePreviewDataUrl = (pageSize: HomeworkTemplatePageSize) => {
  const cached = previewDataUrlCache.get(pageSize);
  if (cached) return cached;
  const dataUrl = createHomeworkTemplateCanvas({ pageSize, renderWidth: 960 }).toDataURL('image/png');
  previewDataUrlCache.set(pageSize, dataUrl);
  return dataUrl;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality?: number) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('模板生成失败')), type, quality);
});

export const downloadHomeworkTemplateImage = async (options: HomeworkTemplateExportOptions) => {
  const canvas = createHomeworkTemplateCanvas(options);
  downloadBlob(await canvasToBlob(canvas), `通用作业登记表-${options.pageSize ?? 'A4'}.png`);
};

export const printHomeworkTemplate = (options: HomeworkTemplateExportOptions) => {
  const canvas = createHomeworkTemplateCanvas(options);
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('请允许打开新窗口后重试');
  const pageSize = options.pageSize ?? 'A4';
  printWindow.document.write(`<!doctype html><html lang="zh-CN"><head><title>通用作业登记表</title><style>@page{size:${pageSize} landscape;margin:0}html,body{margin:0;width:100%;height:100%}img{display:block;width:100%;height:100%;object-fit:contain}</style></head><body><img src="${canvas.toDataURL('image/png')}" alt="通用作业登记表"></body></html>`);
  printWindow.document.close();
  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };
  const image = printWindow.document.querySelector('img');
  if (image?.complete) window.setTimeout(triggerPrint, 0);
  else image?.addEventListener('load', triggerPrint, { once: true });
};

export const shareHomeworkTemplate = async (options: HomeworkTemplateExportOptions) => {
  const canvas = createHomeworkTemplateCanvas(options);
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], `通用作业登记表-${options.pageSize ?? 'A4'}.png`, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: '通用作业登记表', files: [file] });
    return 'shared';
  }
  downloadBlob(blob, file.name);
  return 'downloaded';
};
