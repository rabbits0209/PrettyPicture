import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { userApi } from '../api/user';
import { useUIStore } from '../store';

export const Password: React.FC = () => {
  const { addToast } = useUIStore();

  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.old_password) newErrors.old_password = '请输入当前密码';
    if (!form.new_password) newErrors.new_password = '请输入新密码';
    else if (form.new_password.length < 6) newErrors.new_password = '密码至少6位';
    if (form.new_password !== form.confirm_password) {
      newErrors.confirm_password = '两次密码不一致';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await userApi.resetPwd({
        oldPwd: form.old_password,
        newPwd: form.new_password,
      });
      addToast('密码修改成功', 'success');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      addToast(err.msg || '修改失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">修改密码</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="当前密码"
            type="password"
            placeholder="请输入当前密码"
            value={form.old_password}
            onChange={(v) => setForm({ ...form, old_password: v })}
            error={errors.old_password}
          />
          <Input
            label="新密码"
            type="password"
            placeholder="请输入新密码（至少6位）"
            value={form.new_password}
            onChange={(v) => setForm({ ...form, new_password: v })}
            error={errors.new_password}
          />
          <Input
            label="确认新密码"
            type="password"
            placeholder="请再次输入新密码"
            value={form.confirm_password}
            onChange={(v) => setForm({ ...form, confirm_password: v })}
            error={errors.confirm_password}
          />
          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={saving}
          >
            修改密码
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Password;
