import CoinFlowScenarioPreview from './CoinFlowScenarioPreview';
import React, { useState } from 'react';
import { Button, Modal } from '@arco-design/web-react';
import { ClipboardList } from 'lucide-react';

// 演示控件最高为9999；规则遮罩和弹窗必须覆盖它们。
const REVIEW_OVERLAY_LAYER = 10000;

/** 仅挂载在演示壳层，交付说明不进入教师业务界面。 */
export default function CoinFlowReviewNotes() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog"
      className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[12px] font-semibold text-slate-700">
      <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>校园币流水展示和处理规则</span>
    </button>
    <Modal visible={open} title="校园币流水展示和处理规则" onCancel={() => setOpen(false)}
      maskStyle={{ zIndex: REVIEW_OVERLAY_LAYER }}
      wrapStyle={{ zIndex: REVIEW_OVERLAY_LAYER + 1 }}
      style={{ width: 1120, maxWidth: 'calc(100vw - 32px)' }}
      footer={<Button type="primary" onClick={() => setOpen(false)}>关闭</Button>}>
      <CoinFlowScenarioPreview />
    </Modal>
  </>;
}
