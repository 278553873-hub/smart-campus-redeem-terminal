import React from 'react';
import { Button, Modal } from '@arco-design/web-react';
import { HonorRankBoard } from '../student-honor-screen/HonorRankBoard';
import type { HonorGradeBoard } from '../student-honor-screen/studentHonorModel';
import './classroomHonorDialog.css';

export default function ClassroomHonorDialog({ board, onClose, afterClose }: {
  board: HonorGradeBoard | null;
  onClose: () => void;
  afterClose: () => void;
}) {
  return (
    <Modal
      className="classroom-honor-dialog"
      title="成长荣誉榜"
      visible={board !== null}
      onCancel={onClose}
      afterClose={afterClose}
      footer={<Button className="classroom-control" onClick={onClose}>关闭</Button>}
      style={{ width: 'min(680px, calc(100vw - 32px))' }}
      closable={false}
      autoFocus
      focusLock
      escToExit
      unmountOnExit
    >
      {board && (board.rows.length ? <div className="classroom-honor-panel"><HonorRankBoard board={board} /></div>
        : <p className="classroom-honor-empty">{board.name}暂无上榜学生</p>)}
    </Modal>
  );
}
