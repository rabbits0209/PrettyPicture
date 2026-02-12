import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { accountApi } from '../api/account';
import { useUIStore } from '../store';

export const Forget: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  
  const [form, setForm] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) newErrors.email = '请输入邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!form.code) newErrors.code = '请输入验证码';
    if (!form.password) newErrors.password = '请输入新密码';
    else if (form.password.length < 6) newErrors.password = '密码至少6位';
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors({ ...errors, email: '请输入有效的邮箱地址' });
      return;
    }
    setSendingCode(true);
    try {
      await accountApi.sendCode(form.email);
      addToast('验证码已发送', 'success');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err: any) {
      addToast(err.msg || '发送失败', 'error');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await accountApi.forget({
        email: form.email,
        code: form.code,
        password: form.password,
      });
      addToast('密码重置成功，请登录', 'success');
      navigate('/login');
    } catch (err: any) {
      addToast(err.msg || '重置失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">找回密码</h1>
          <p className="text-foreground/60">通过邮箱验证重置密码</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="邮箱"
            type="email"
            placeholder="请输入注册邮箱"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            error={errors.email}
          />
          <div className="flex gap-2">
            <Input
              label="验证码"
              placeholder="请输入验证码"
              value={form.code}
              onChange={(v) => setForm({ ...form, code: v })}
              error={errors.code}
              className="flex-1"
            />
            <Button
              type="button"
              variant="flat"
              onClick={handleSendCode}
              isLoading={sendingCode}
              isDisabled={countdown > 0}
              className="mt-6"
            >
              {countdown > 0 ? `${countdown}s` : '发送验证码'}
            </Button>
          </div>
          <Input
            label="新密码"
            type="password"
            placeholder="请输入新密码（至少6位）"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            error={errors.password}
          />
          <Input
            label="确认密码"
            type="password"
            placeholder="请再次输入新密码"
            value={form.confirmPassword}
            onChange={(v) => setForm({ ...form, confirmPassword: v })}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
          >
            重置密码
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/60">
          <Link to="/login" className="text-primary hover:underline">
            返回登录
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Forget;
