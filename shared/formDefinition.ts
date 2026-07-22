export type FormLayoutMode = 'flat' | 'grouped';

export interface FormSection {
  id: string;
  label: string;
}

export interface ConfigurableFormField<TType extends string = string> {
  id: string;
  label: string;
  type: TType;
  required: boolean;
  options: string[];
  sectionId?: string;
  customAnswerOptions?: string[];
}

export const createFormSectionId = () => `form-section-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

