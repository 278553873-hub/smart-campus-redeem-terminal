import { Modal } from '@arco-design/web-react';

export const confirmDiscardOperationsDraft = (onDiscard: () => void) => Modal.confirm({
  wrapClassName: 'operations-pc-overlay',
  title: '放弃未保存的修改？',
  content: '离开后，本次未保存的输入将丢失。',
  okText: '放弃修改',
  cancelText: '继续编辑',
  onOk: onDiscard,
});

export const confirmRemoveTeacherSupportAccess = (teacherName: string, onRemove: () => Promise<void>) => Modal.confirm({
  wrapClassName: 'operations-pc-overlay',
  title: '移除排查授权？',
  content: `移除后，${teacherName}将无法通过「问题排查」切换登录账号。`,
  okText: '确认移除',
  cancelText: '取消',
  okButtonProps: { status: 'danger' },
  onOk: onRemove,
});
