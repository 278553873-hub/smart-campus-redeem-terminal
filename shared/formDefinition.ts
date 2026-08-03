export type FormLayoutMode = 'flat' | 'grouped';

export interface FormSection {
  id: string;
  label: string;
}

export type FormDateFormat = 'ymd' | 'ym' | 'year';
export type FormNumberFormat = 'integer' | 'decimal-1' | 'decimal-2';

export interface FormFieldSettings {
  minSelections?: number;
  maxSelections?: number;
  ratingMin?: number;
  ratingMax?: number;
  dateFormat?: FormDateFormat;
  numberFormat?: FormNumberFormat;
  minValue?: number;
  maxValue?: number;
}

export interface FormSubField {
  id: string;
  label: string;
  required: boolean;
}

export interface ConfigurableFormField<TType extends string = string> {
  id: string;
  label: string;
  type: TType;
  required: boolean;
  options: string[];
  sectionId?: string;
  customAnswerOptions?: string[];
  subFields?: FormSubField[];
  settings?: FormFieldSettings;
}

export const normalizeFormFieldSettings = (
  type: string,
  settings: FormFieldSettings | undefined,
  options: string[] = [],
): FormFieldSettings => {
  if (type === 'multiple' || type === 'multiple-select') {
    const optionCount = Math.max(1, options.length);
    const minSelections = Math.max(1, Math.min(settings?.minSelections ?? 1, optionCount));
    const maxSelections = Math.max(minSelections, Math.min(settings?.maxSelections ?? optionCount, optionCount));
    return { ...settings, minSelections, maxSelections };
  }
  if (type === 'rating') {
    const optionValues = options.map(Number).filter(Number.isFinite);
    const fallbackMin = optionValues.length ? Math.min(...optionValues) : 1;
    const fallbackMax = optionValues.length ? Math.max(...optionValues) : 5;
    const ratingMin = Math.max(1, Math.min(settings?.ratingMin ?? fallbackMin, 9));
    const ratingMax = Math.max(ratingMin + 1, Math.min(settings?.ratingMax ?? fallbackMax, 10));
    return { ...settings, ratingMin, ratingMax };
  }
  if (type === 'date') return { ...settings, dateFormat: settings?.dateFormat ?? 'ymd' };
  if (type === 'number') return { ...settings, numberFormat: settings?.numberFormat ?? 'integer' };
  return settings ? { ...settings } : {};
};

export const createFormSectionId = () => `form-section-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
export const createFormSubFieldId = () => `form-sub-field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
