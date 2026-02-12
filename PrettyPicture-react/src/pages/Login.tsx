import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { accountApi } from '../api/account';
import { userApi } from '../api/user';
import { useAuthStore, useUIStore } from '../store';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.username.trim()) newErrors.username = '请输入用户名';
    if (!form.password) newErrors.password = '请输入密码';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res: any = await accountApi.login(form);
      // 登录成功返回 token (res.data 直接是 token 字符串)
      const token = res.data.token || res.data;
      setToken(token);
      // 获取用户信息
      const userRes: any = await userApi.info();
      setUser(userRes.data);
      addToast('登录成功', 'success');
      navigate('/');
    } catch (err: any) {
      addToast(err.msg || '登录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">欢迎回来</h1>
          <p className="text-foreground/60">登录到 PrettyPicture 图床</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={form.username}
            onChange={(v) => setForm({ ...form, username: v })}
            error={errors.username}
          />
          <Input
            label="密码"
            type="password"
            placeholder="请输入密码"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            error={errors.password}
          />

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
          >
            登录
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/60">
          <Link to="/forget" className="text-primary hover:underline">
            忘记密码？
          </Link>
          <span className="mx-2">·</span>
          <Link to="/register" className="text-primary hover:underline">
            注册账号
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
