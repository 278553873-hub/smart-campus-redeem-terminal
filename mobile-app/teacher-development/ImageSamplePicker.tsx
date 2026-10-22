import { IMAGE_SAMPLES, type ImageSample } from './imageSamples';
import { demoInputImage } from './demoImages';
import { bodyClass } from './ui';

export default function ImageSamplePicker({ onSelect }: { onSelect: (sample: ImageSample) => void }) {
  return <div className="grid grid-cols-2 gap-3" aria-label="可选图片">
    {IMAGE_SAMPLES.map(sample => <button type="button" key={sample.id} onClick={() => onSelect(sample)}
      className="min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-brand-primary)]">
      <img src={demoInputImage(sample.id, '张敏', sample.date)} alt={`${sample.label}，张敏`} loading="lazy" decoding="async"
        className="aspect-[3/4] w-full rounded-[var(--tm-radius-control)] object-contain" />
      <span className={`mt-2 block ${bodyClass}`}>{sample.label}</span>
    </button>)}
  </div>;
}
