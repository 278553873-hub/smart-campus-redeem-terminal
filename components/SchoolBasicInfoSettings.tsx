import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Message } from '@arco-design/web-react';
import { IMAGE_UPLOAD_ACCEPT, readImageUpload } from '../shared/imageUpload';
import { SCHOOL_DISPLAY_NAME_MAX_LENGTH, SCHOOL_FEATURES_MAX_LENGTH, SCHOOL_LOGO_MAX_SIZE_MB, sameSchoolBasicInfo, validateSchoolBasicInfo, type SchoolBasicInfo } from '../shared/schoolBasicInfo';
import { saveSchoolBasicInfo } from '../shared/schoolBasicInfoStore';
import { useSchoolBasicInfo } from './useSchoolBasicInfo';

const FIELD_HINT_CLASS_NAME = 'text-[13px] leading-5 text-[var(--color-text-3)]';

const SchoolLogoField = ({ value = '', onChange, id, busy, onBusyChange }: {
  value?: string; onChange?: (value: string) => void; id?: string; busy: boolean; onBusyChange: (value: boolean) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const [error, setError] = useState('');
  useEffect(() => () => { requestId.current += 1; }, []);
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const request = ++requestId.current;
    onBusyChange(true);
    setError('');
    try {
      const image = await readImageUpload(file, 512, SCHOOL_LOGO_MAX_SIZE_MB);
      if (request === requestId.current) onChange?.(image);
    } catch (cause) {
      if (request === requestId.current) setError((cause as Error).message);
    } finally { if (request === requestId.current) onBusyChange(false); }
  };
  return <div>
    {value && <div className="mb-3 flex h-24 w-40 items-center justify-center rounded border border-[var(--color-border-2)] bg-[var(--color-fill-1)] p-2">
      <img src={value} alt="学校Logo预览" className="max-h-full max-w-full object-contain" />
    </div>}
    <div className="flex items-center gap-3">
      <Button htmlType="button" loading={busy} onClick={() => inputRef.current?.click()}>{value ? '更换Logo' : '上传Logo'}</Button>
      {value && <Button htmlType="button" type="text" status="danger" disabled={busy} onClick={() => { onChange?.(''); setError(''); }}>移除</Button>}
    </div>
    <input id={id} ref={inputRef} type="file" accept={IMAGE_UPLOAD_ACCEPT} className="sr-only" aria-label="上传学校Logo" disabled={busy} onChange={upload} />
    <p className={`mb-0 mt-2 ${FIELD_HINT_CLASS_NAME}`}>支持 PNG、JPG、WebP，不超过{SCHOOL_LOGO_MAX_SIZE_MB}MB；建议使用透明背景图片。</p>
    {error && <p role="alert" className="mb-0 mt-2 text-[13px] text-[rgb(var(--danger-6))]">{error}</p>}
  </div>;
};

export default function SchoolBasicInfoSettings({ schoolId, schoolName, onDirtyChange, onBusyChange }: {
  schoolId: string; schoolName: string; onDirtyChange?: (dirty: boolean) => void; onBusyChange?: (busy: boolean) => void;
}) {
  const config = useSchoolBasicInfo(schoolId, schoolName);
  const [form] = Form.useForm<SchoolBasicInfo>();
  const [saved, setSaved] = useState(config);
  const [draft, setDraft] = useState(config);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [logoEditorKey, setLogoEditorKey] = useState(0);
  const dirty = !sameSchoolBasicInfo(saved, draft);
  const previousSchool = useRef(schoolId);

  useEffect(() => {
    if (previousSchool.current !== schoolId || !dirty) {
      previousSchool.current = schoolId;
      setSaved(config);
      form.clearFields();
      form.setFieldsValue(config);
      setDraft(config);
      setSaveError('');
    }
  }, [config, schoolId, dirty, form]);
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  useEffect(() => {
    if (!dirty && !busy) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty, busy]);

  const save = (values: SchoolBasicInfo) => {
    if (busy) return;
    try {
      const next = saveSchoolBasicInfo(schoolId, values);
      setSaved(next);
      setDraft(next);
      form.setFieldsValue(next);
      setSaveError('');
      Message.success('保存成功');
    } catch (cause) { setSaveError((cause as Error).message); }
  };
  const discardChanges = () => {
    form.clearFields();
    form.setFieldsValue(saved);
    setDraft(saved);
    setSaveError('');
    setLogoEditorKey(value => value + 1);
  };
  return <section aria-labelledby="school-basic-info-title" className="rounded border border-[var(--color-border-2)] bg-[var(--color-bg-2)] p-6 text-sm text-[var(--color-text-2)]">
    <h2 id="school-basic-info-title" className="m-0 mb-6 text-base font-semibold leading-6 text-[var(--color-text-1)]">学校基本信息</h2>
    <Form<SchoolBasicInfo> form={form} className="pc-form max-w-[960px]" initialValues={saved} layout="horizontal" labelAlign="right" labelCol={{ flex: '160px' }} wrapperCol={{ flex: '1', style: { minWidth: 0 } }}
      validateTrigger="onBlur" scrollToFirstError onValuesChange={(_, values) => { setDraft({ ...saved, ...values }); setSaveError(''); }} onSubmit={save}>
      <Form.Item field="displayName" label="对外展示名称" required className="pc-school-display-name-field"
        rules={[{ validator: (value, callback) => callback(validateSchoolBasicInfo({ ...draft, displayName: value ?? '' }).displayName) }]}>
        <Input style={{ maxWidth: 420 }} placeholder="请输入学校对外展示名称" maxLength={SCHOOL_DISPLAY_NAME_MAX_LENGTH} showWordLimit aria-required="true" />
      </Form.Item>
      <Form.Item field="logoUrl" label="LOGO" rules={[{ validator: (value, callback) => callback(validateSchoolBasicInfo({ ...draft, logoUrl: value ?? '' }).logoUrl) }]}>
        <SchoolLogoField key={logoEditorKey} busy={busy} onBusyChange={setBusy} />
      </Form.Item>
      <Form.Item field="features" label="特色信息"
        extra={<span id="school-features-hint" className={FIELD_HINT_CLASS_NAME}>可填写校训、校风、育人理念或特色项目，供后续人工智能分析育人成效、生成改进建议时，提供更有针对性的内容。</span>}
        rules={[{ validator: (value, callback) => callback(validateSchoolBasicInfo({ ...draft, features: value ?? '' }).features) }]}>
        <Input.TextArea placeholder={'例如\n校训：自强不息，知行合一\n校风：文明尚礼，求真拓新'} autoSize={{ minRows: 8, maxRows: 16 }} maxLength={SCHOOL_FEATURES_MAX_LENGTH} showWordLimit aria-describedby="school-features-hint" />
      </Form.Item>
      <Form.Item label=" " colon={false}>
        {saveError && <p role="alert" className="mb-3 mt-0 text-[rgb(var(--danger-6))]">{saveError}</p>}
        <div className="flex items-center gap-3">
          <Button type="primary" htmlType="submit" disabled={!dirty || busy}>保存</Button>
          {dirty && <Button htmlType="button" onClick={discardChanges} disabled={busy}>放弃修改</Button>}
        </div>
      </Form.Item>
    </Form>
  </section>;
}
