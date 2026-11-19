import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Input } from '@arco-design/web-react';
import { ScreenPanoramaDialog } from '../screen-navigation/ScreenPanoramaDialog';
import './studentGrowthAccount.css';

/** 私人数据只能由认证服务返回，不能从公开名册选人后解锁。 */
export interface GrowthPrivateProfile {
  studentId: string; name: string; className: string; points: number;
  dimensions: { name: string; points: number }[];
  records: { id: string; teacherName: string; content: string; points: number; date: string }[];
}
export type GrowthStudentAuthenticator = (credentials: { account: string; password: string }) => Promise<GrowthPrivateProfile>;

export function StudentGrowthAccountDialog({ onClose, authenticate }: { onClose: () => void; authenticate?: GrowthStudentAuthenticator }) {
  const [profile, setProfile] = useState<GrowthPrivateProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  const [form] = Form.useForm();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; form.resetFields(); }; }, [form]);
  const login = async (values: { account: string; password: string }) => {
    setError(''); setLoading(true);
    try {
      // 当前终端旧登录只做交互动效，不验证身份，不能复用为私人数据权限。
      if (!authenticate) throw new Error('暂时无法登录，请联系老师。');
      const result = await authenticate({ account: values.account.trim(), password: values.password });
      if (!result.studentId) throw new Error('登录未成功，请重新输入学号和密码。');
      if (mounted.current) { form.resetFields(); setProfile(result); }
    } catch {
      if (mounted.current) { form.setFieldsValue({ password: '' }); setError(authenticate ? '登录未成功，请检查学号和密码后重试。' : '暂时无法登录，请联系老师。'); }
    } finally { if (mounted.current) setLoading(false); }
  };
  return <ScreenPanoramaDialog visible title={profile ? '我的成长' : '学生登录'} onClose={onClose} returnLabel={profile ? '退出并返回大屏' : '返回大屏'}>
    <div className="student-growth-account">
      {profile ? <>
        <div className="student-growth-private-heading"><div><h3>{profile.name}</h3><p>{profile.className}</p></div><div><span>我的积分</span><strong>{profile.points.toLocaleString('zh-CN')}</strong></div></div>
        <div className="student-growth-private-dimensions">{profile.dimensions.map(item => <div key={item.name}><span>{item.name}</span><strong>{item.points}</strong></div>)}</div>
        <h3 className="student-growth-private-title">我的评价记录</h3>
        <ol className="student-growth-private-records">{profile.records.map(record => <li key={record.id}><div><span>{record.teacherName}老师</span><time>{record.date}</time><b>{record.points > 0 ? '+' : ''}{record.points}分</b></div><p>{record.content}</p></li>)}</ol>
        {!profile.records.length && <p>你还没有评价记录。</p>}
      </> : <>
        <p className="student-growth-login-intro">登录后，查看自己的积分和评价记录。</p>
        <Form form={form} layout="vertical" onSubmit={login} autoComplete="off" onValuesChange={() => setError('')}>
          <Form.Item label="学号" field="account" rules={[{ required: true, whitespace: true, message: '请输入学号' }]}><Input placeholder="请输入学号" autoComplete="off" disabled={loading} /></Form.Item>
          <Form.Item label="密码" field="password" rules={[{ required: true, message: '请输入密码' }]}><Input.Password placeholder="请输入密码" autoComplete="off" disabled={loading} visibilityToggle={false} /></Form.Item>
          <p className="student-growth-login-error" role="alert">{error}</p>
          <Button type="primary" htmlType="submit" long loading={loading}>登录并查看</Button>
        </Form>
        <p className="student-growth-login-help">忘记学号或密码，请联系班主任。</p>
      </>}
    </div>
  </ScreenPanoramaDialog>;
}
