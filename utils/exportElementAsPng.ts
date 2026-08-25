import { domToBlob } from 'modern-screenshot';

interface ExportElementAsPngOptions {
  fileName: string;
  pixelRatio?: number;
}

const waitForElementImages = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(images.map(async image => {
    if (!image.complete) {
      await new Promise<void>(resolve => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }

    if (typeof image.decode === 'function') {
      await image.decode().catch(() => undefined);
    }
  }));
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportElementAsPng = async (
  element: HTMLElement,
  { fileName, pixelRatio = 3 }: ExportElementAsPngOptions,
) => {
  await document.fonts?.ready;
  await waitForElementImages(element);

  const width = element.offsetWidth;
  const height = element.offsetHeight;
  if (!width || !height) {
    throw new Error('截图区域尺寸无效。');
  }

  const blob = await domToBlob(element, {
    backgroundColor: '#ffffff',
    features: {
      restoreScrollPosition: true,
    },
    height,
    scale: pixelRatio,
    style: {
      border: '0',
      borderRadius: '0',
      boxShadow: 'none',
    },
    width,
  });

  downloadBlob(blob, fileName);
};
