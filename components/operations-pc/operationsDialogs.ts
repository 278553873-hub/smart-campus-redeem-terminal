import { Modal } from '@arco-design/web-react';

export const confirmDiscardOperationsDraft = (onDiscard: () => void) => Modal.confirm({
  wrapClassName: 'operations-pc-overlay',
  title: '放弃未保存的修改？',
  content: '离开后，本次未保存的输入将丢失。',
  okText: '放弃修改',
  cancelText: '继续编辑',
  onOk: onDiscard,
});
