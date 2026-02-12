import React, { useState, useRef } from 'react';
import { Card, Button, Input } from '../components/ui';
import { userApi } from '../api/user';
import { useAuthStore, useUIStore } from '../store';

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 MB';
  const mb = bytes / 1024 / 1024;
  return mb.toFixed(2) + ' MB';
};

const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [resettingKey, setResettingKey] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);

  const usedPercent = user ? (user.user_size / user.capacity) * 100 : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.update(form);
      setUser({ ...user!, ...form });
      addToast('保存成功', 'success');
    } catch (err: any) {
      addToast(err.msg || '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 前端验证
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      addToast('不支持的图片格式，仅支持 jpg/png/gif/webp', 'error');
      return;
    }

    if (file.size > AVATAR_MAX_SIZE) {
      addToast('头像文件不能超过5MB', 'error');
      return;
    }

    setUploadingAvatar(true);
    setAvatarProgress(0);

    try {
      const res: any = await userApi.uploadAvatar(file, (percent) => {
        setAvatarProgress(percent);
      });
      
      if (res.data?.avatar) {
        setUser({ ...user!, avatar: res.data.avatar });
        addToast('头像更新成功', 'success');
      }
    } catch (err: any) {
      addToast(err.msg || '头像上传失败', 'error');
    } finally {
      setUploadingAvatar(false);
      setAvatarProgress(0);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleResetKey = async () => {
    if (!confirm('确定要重置 API 密钥吗？重置后旧密钥将失效。')) return;

    setResettingKey(true);
    try {
      await userApi.resetKey();
      const res: any = await userApi.info();
      setUser(res.data);
      addToast('密钥已重置', 'success');
    } catch (err: any) {
      addToast(err.msg || '重置失败', 'error');
    } finally {
      setResettingKey(false);
    }
  };

  const handleCopyKey = async () => {
    if (user?.Secret_key) {
      try {
        await navigator.clipboard.writeText(user.Secret_key);
        addToast('密钥已复制', 'success');
      } catch {
        addToast('复制失败', 'error');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">个人资料</h1>

      {/* User info card */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar with upload */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-3xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Upload overlay */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
            >
              {uploadingAvatar ? (
                <div className="text-white text-xs">{avatarProgress}%</div>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-foreground">{user?.username}</h2>
            <p className="text-foreground/60">{user?.role?.name || '普通用户'}</p>
            <p className="text-xs text-foreground/40 mt-1">点击头像更换（最大5MB）</p>
          </div>
        </div>

        {/* Avatar upload progress */}
        {uploadingAvatar && (
          <div className="mb-4">
            <div className="w-full bg-content2 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-150"
                style={{ width: `${avatarProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="用户名"
            value={form.username}
            onChange={(v) => setForm({ ...form, username: v })}
          />
          <Input
            label="邮箱"
            type="email"
            value={form.email}
            isDisabled
          />
          <Input
            label="手机号"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Button color="primary" onClick={handleSave} isLoading={saving}>
            保存修改
          </Button>
        </div>
      </Card>

      {/* Storage quota */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">存储配额</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">已使用</span>
            <span className="text-foreground">
              {formatSize(user?.user_size || 0)} / {formatSize(user?.capacity || 0)}
            </span>
          </div>
          <div className="w-full bg-content2 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${Math.min(usedPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-foreground/60">
            已使用 {usedPercent.toFixed(1)}% 的存储空间
          </p>
        </div>
      </Card>

      {/* API Key */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">API 密钥</h3>
        <p className="text-sm text-foreground/60 mb-4">
          使用此密钥通过 API 上传图片。请妥善保管，不要泄露给他人。
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={user?.Secret_key || ''}
            readOnly
            className="flex-1 px-3 py-2 bg-content2 rounded-lg text-sm text-foreground border border-divider font-mono"
          />
          <Button variant="flat" onClick={handleCopyKey}>
            复制
          </Button>
          <Button
            variant="flat"
            color="danger"
            onClick={handleResetKey}
            isLoading={resettingKey}
          >
            重置
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
