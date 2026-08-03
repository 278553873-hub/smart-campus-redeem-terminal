import React, { useMemo, useRef, useState } from 'react';
import { Alert, Button, Message, Select, Table, Tag } from '@arco-design/web-react';
import { ArrowLeft, CheckCircle2, Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import {
  readHealthImportBatches,
  saveHealthImportBatch,
  type HealthImportBatch,
} from '../shared/studentGrowthStore';
import { getEnabledGrowthFields } from '../shared/studentGrowthFieldCatalog';

type PageMode = 'list' | 'upload' | 'preview' | 'result';

const previewSummary = {
  totalRows: 144,
  uniqueRecords: 97,
  duplicateRecords: 47,
  unmatchedRecords: 0,
  anomalousValues: 5,
};

interface HealthDataImportViewProps {
  spaceId: string;
}

const HealthDataImportView: React.FC<HealthDataImportViewProps> = ({ spaceId }) => {
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [fileName, setFileName] = useState('');
  const [batches, setBatches] = useState<HealthImportBatch[]>(() => readHealthImportBatches());
  const [activeBatch, setActiveBatch] = useState<HealthImportBatch | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const enabledFields = useMemo(() => getEnabledGrowthFields(spaceId), [spaceId]);

  const columns = useMemo(() => [
    {
      title: '文件名称',
      dataIndex: 'fileName',
      width: 260,
      render: (value: string) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <FileSpreadsheet size={17} className="shrink-0 text-[#165DFF]" />
          <span className="truncate font-medium text-[#1D2129]">{value}</span>
        </div>
      ),
    },
    { title: '导入时间', dataIndex: 'importedAt', width: 180 },
    { title: '操作人', dataIndex: 'operator', width: 140 },
    {
      title: '导入结果',
      dataIndex: 'writtenRecords',
      render: (_: number, record: HealthImportBatch) => (
        <span className="tabular-nums text-[#4E5969]">
          写入 {record.writtenRecords} · 跳过 {record.duplicateRecords}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: () => <Tag color="green">已完成</Tag>,
    },
    {
      title: '操作',
      width: 100,
      render: (_: unknown, record: HealthImportBatch) => (
        <Button type="text" onClick={() => { setActiveBatch(record); setPageMode('result'); }}>查看结果</Button>
      ),
    },
  ], []);

  const resetImport = () => {
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPageMode('list');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
  };

  const confirmImport = () => {
    const batch = saveHealthImportBatch({
      fileName,
      operator: '当前学校管理员',
      totalRows: previewSummary.totalRows,
      uniqueRecords: previewSummary.uniqueRecords,
      writtenRecords: previewSummary.uniqueRecords,
      duplicateRecords: previewSummary.duplicateRecords,
      unmatchedRecords: previewSummary.unmatchedRecords,
      anomalousValues: previewSummary.anomalousValues,
    });
    setBatches(readHealthImportBatches());
    setActiveBatch(batch);
    setPageMode('result');
  };

  const PageTitle = ({ title, onBack }: { title: string; onBack?: () => void }) => (
    <div className="mb-4 flex items-center gap-3">
      {onBack && (
        <Button icon={<ArrowLeft size={16} />} onClick={onBack}>返回</Button>
      )}
      <div>
        <div className="mb-1 flex items-center gap-2 text-[13px] text-[#86909C]">
          <span>数据中心</span><span>/</span><span className="text-[#4E5969]">成长数据导入</span>
        </div>
        <h1 className="m-0 text-[20px] font-semibold leading-7 text-[#1D2129]">{title}</h1>
      </div>
    </div>
  );

  if (pageMode === 'upload') {
    return (
      <div className="w-full px-6 py-5 text-sm text-[#4E5969]">
        <PageTitle title="导入成长数据" onBack={resetImport} />
        <section className="rounded border border-[#E5E6EB] bg-white p-6">
          <div className="mb-6 flex items-center gap-8 border-b border-[#E5E6EB] pb-4 text-[13px]">
            <span className="font-semibold text-[#165DFF]">1 选择文件</span>
            <span className="text-[#86909C]">2 核对数据</span>
            <span className="text-[#86909C]">3 导入完成</span>
          </div>
          <div className="mx-auto max-w-[720px]">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[220px] w-full flex-col items-center justify-center rounded border border-dashed border-[#C9CDD4] bg-[#F7F8FA] px-8 text-center transition-colors hover:border-[#165DFF] hover:bg-[#F2F7FF]"
            >
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-[#E8F3FF] text-[#165DFF]"><Upload size={24} /></span>
              <span className="text-[15px] font-semibold text-[#1D2129]">选择成长数据文件</span>
              <span className="mt-2 text-[13px] text-[#86909C]">支持平台Excel模板</span>
            </button>
            {fileName && (
              <div className="mt-4 flex h-12 items-center gap-3 rounded border border-[#E5E6EB] bg-white px-4">
                <FileSpreadsheet size={18} className="text-[#165DFF]" />
                <span className="min-w-0 flex-1 truncate font-medium text-[#1D2129]">{fileName}</span>
                <button type="button" onClick={() => setFileName('')} aria-label="移除文件" className="flex h-8 w-8 items-center justify-center text-[#86909C] hover:text-[#F53F3F]"><X size={16} /></button>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-[#E5E6EB] pt-4">
            <Button onClick={resetImport}>取消</Button>
            <Button type="primary" disabled={!fileName} onClick={() => setPageMode('preview')}>识别数据</Button>
          </div>
        </section>
      </div>
    );
  }

  if (pageMode === 'preview') {
    const summaryItems = [
      { label: '文件总行数', value: previewSummary.totalRows },
      { label: '学生体检记录', value: previewSummary.uniqueRecords },
      { label: '重复记录', value: previewSummary.duplicateRecords },
      { label: '格式待确认', value: previewSummary.anomalousValues },
    ];
    return (
      <div className="w-full px-6 py-5 text-sm text-[#4E5969]">
        <PageTitle title="核对导入数据" onBack={() => setPageMode('upload')} />
        <section className="rounded border border-[#E5E6EB] bg-white p-6">
          <div className="mb-6 flex items-center gap-8 border-b border-[#E5E6EB] pb-4 text-[13px]">
            <span className="text-[#86909C]">1 选择文件</span>
            <span className="font-semibold text-[#165DFF]">2 核对数据</span>
            <span className="text-[#86909C]">3 导入完成</span>
          </div>
          <div className="mb-5 flex items-center gap-2 text-[#1D2129]">
            <FileSpreadsheet size={18} className="text-[#165DFF]" />
            <span className="font-semibold">{fileName}</span>
          </div>
          <div className="grid grid-cols-4 border-y border-[#E5E6EB]">
            {summaryItems.map((item, index) => (
              <div key={item.label} className={`px-5 py-5 ${index < summaryItems.length - 1 ? 'border-r border-[#E5E6EB]' : ''}`}>
                <div className="text-[13px] text-[#86909C]">{item.label}</div>
                <div className="mt-2 text-[26px] font-semibold tabular-nums text-[#1D2129]">{item.value}</div>
              </div>
            ))}
          </div>
          <Alert
            className="mt-5"
            type="warning"
            content="5项矫正视力包含混合格式，将保留原始值并标记待确认；47条完全重复记录不会重复写入。"
          />
          <div className="mt-5 overflow-hidden rounded border border-[#E5E6EB]">
            <div className="grid grid-cols-[1fr_160px] border-b border-[#E5E6EB] bg-[#F7F8FA] px-4 py-3 text-[13px] font-medium text-[#4E5969]"><span>检查项目</span><span>结果</span></div>
            {[
              ['学生匹配', '97条已匹配'],
              ['启用字段', `${enabledFields.length}项可写入`],
              ['重复检查', '47条将跳过'],
              ['日期和数值格式', '5项待确认'],
              ['基础信息覆盖', '不会覆盖'],
            ].map(([label, result]) => (
              <div key={label} className="grid grid-cols-[1fr_160px] border-b border-[#F2F3F5] px-4 py-3 last:border-b-0"><span>{label}</span><span className="font-medium text-[#1D2129]">{result}</span></div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-[#E5E6EB] pt-4">
            <Button onClick={() => setPageMode('upload')}>重新选择</Button>
            <Button type="primary" onClick={confirmImport}>确认导入97条记录</Button>
          </div>
        </section>
      </div>
    );
  }

  if (pageMode === 'result' && activeBatch) {
    return (
      <div className="w-full px-6 py-5 text-sm text-[#4E5969]">
        <PageTitle title="导入结果" onBack={() => setPageMode('list')} />
        <section className="rounded border border-[#E5E6EB] bg-white p-6">
          <div className="flex items-start gap-4 border-b border-[#E5E6EB] pb-6">
            <span className="flex h-11 w-11 items-center justify-center rounded bg-[#E8FFEA] text-[#00B42A]"><CheckCircle2 size={24} /></span>
            <div>
              <h2 className="m-0 text-[18px] font-semibold text-[#1D2129]">成长数据已导入</h2>
              <p className="mt-1 text-[13px] text-[#86909C]">{activeBatch.fileName}</p>
            </div>
          </div>
          <div className="mt-6 grid max-w-[760px] grid-cols-2 gap-x-12 gap-y-4">
            {[
              ['写入学生成长记录', `${activeBatch.writtenRecords}条`],
              ['重复记录', `${activeBatch.duplicateRecords}条，已跳过`],
              ['未匹配学生', `${activeBatch.unmatchedRecords}条`],
              ['待确认格式', `${activeBatch.anomalousValues}项`],
              ['操作人', activeBatch.operator],
              ['完成时间', activeBatch.importedAt],
            ].map(([label, value]) => (
              <div key={label} className="flex min-h-10 items-center justify-between border-b border-[#F2F3F5] py-2"><span className="text-[#86909C]">{label}</span><span className="font-medium text-[#1D2129]">{value}</span></div>
            ))}
          </div>
          <div className="mt-6 border-t border-[#E5E6EB] pt-4"><Button type="primary" onClick={() => setPageMode('list')}>返回导入记录</Button></div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-5 text-sm text-[#4E5969]">
      <PageTitle title="成长数据导入" />
      <section className="rounded border border-[#E5E6EB] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 pc-filter-bar">
            <Select defaultValue="全部学期" style={{ width: 180 }} options={[{ label: '全部学期', value: '全部学期' }, { label: '2025-2026学年', value: '2025-2026学年' }]} />
            <Select defaultValue="全部状态" style={{ width: 160 }} options={[{ label: '全部状态', value: '全部状态' }, { label: '已完成', value: '已完成' }]} />
          </div>
          <div className="flex items-center gap-3">
            <Button icon={<Download size={16} />} onClick={() => Message.success(`已生成包含${enabledFields.length}个启用字段的导入模板`)}>下载导入模板</Button>
            <Button type="primary" icon={<Upload size={16} />} onClick={() => setPageMode('upload')}>导入成长数据</Button>
          </div>
        </div>
        <Table columns={columns} data={batches} rowKey="id" pagination={false} borderCell={false} />
      </section>
    </div>
  );
};

export default HealthDataImportView;
