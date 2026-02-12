import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal } from '../../components/ui';
import { Empty } from '../../components/Empty';
import { Loading } from '../../components/Loading';
import { memberApi } from '../../api/member';
import { roleApi } from '../../api/role';
import { useUIStore } from '../../store';
import type { Member as MemberType, Role } from '../../types';

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const GB = 1024 * 1024 * 1024; // 1GB in bytes
const bytesToGB = (bytes: number): number => Math.round((bytes / GB) * 100) / 100;
const gbToBytes = (gb: number): number => Math.round(gb * GB);

export const Member: React.FC = () => {
  const { addToast } = useUIStore();
  const [members, setMembers] = useState<MemberType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberType | null>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    avatar: '',
    role_id: 0,
    capacity: 1073741824, // 1GB in bytes
    state: 1,
  });
  const [saving, setSaving] = useState(false);
  const [page] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [memberRes, roleRes] = await Promise.all([
        memberApi.query({ page, size: 20, name: '' }),
        roleApi.query({ page: 1, size: 100, name: '' }),
      ]);
      setMembers((memberRes as any).data?.data || []);
      setRoles((roleRes as any).data?.data || []);
    } catch {
      addToast('加载数据失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const openModal = (member?: MemberType) => {
    if (member) {
      setEditingMember(member);
      setForm({
        username: member.username,
        email: member.email,
        password: '',
        phone: member.phone || '',
        avatar: member.avatar || '',
        role_id: member.role_id,
        capacity: member.capacity,
        state: member.state,
      });
    } else {
      setEditingMember(null);
      setForm({
        username: '',
        email: '',
        password: '',
        phone: '',
        avatar: '',
        role_id: roles[0]?.id || 0,
        capacity: 1073741824,
        state: 1,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.username.trim()) {
      addToast('请输入用户名', 'error');
      return;
    }
    if (form.username.trim().length < 3 || form.username.trim().length > 8) {
      addToast('用户名长度必须在3-8位之间', 'error');
      return;
    }
    if (!form.email.trim()) {
      addToast('请输入邮箱', 'error');
      return;
    }
    if (!editingMember && !form.password) {
      addToast('请输入密码', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingMember) {
        const updateData: any = {
          id: editingMember.id,
          username: form.username,
          email: form.email,
          phone: form.phone,
          avatar: form.avatar,
          role_id: form.role_id,
          capacity: form.capacity,
          state: form.state,
          pwd: form.password ? 1 : 0,
        };
        if (form.password) {
          updateData.new_password = form.password;
        }
        await memberApi.update(updateData);
      } else {
        await memberApi.save(form);
      }
      addToast(editingMember ? '修改成功' : '创建成功', 'success');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast(err.msg || '操作失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: MemberType) => {
    if (!confirm(`确定要删除用户"${member.username}"吗？`)) return;

    try {
      await memberApi.delete(member.id);
      addToast('删除成功', 'success');
      loadData();
    } catch (err: any) {
      addToast(err.msg || '删除失败', 'error');
    }
  };

  if (loading) {
    return <Loading fullscreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">成员管理</h1>
        <Button color="primary" onClick={() => openModal()}>
          添加成员
        </Button>
      </div>

      {members.length === 0 ? (
        <Empty
          title="暂无成员"
          description="添加成员来管理系统用户"
          action={
            <Button color="primary" onClick={() => openModal()}>
              添加成员
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 overflow-hidden">
                  {member.avatar ? (
                    <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary text-2xl font-bold">
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Username & Status */}
                <div className="flex items-center justify-center gap-2 mb-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">{member.username}</h3>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${member.state === 1 ? 'bg-success' : 'bg-danger'}`} />
                </div>

                {/* Email */}
                <p className="text-sm text-foreground/60 mb-2 truncate w-full">{member.email}</p>

                {/* Role Badge */}
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                  {member.role_name || '未分配角色'}
                </span>

                {/* Storage Info */}
                <div className="w-full mb-4">
                  <div className="flex justify-between text-xs text-foreground/60 mb-1">
                    <span>存储空间</span>
                    <span>{formatSize(member.user_size || 0)} / {formatSize(member.capacity)}</span>
                  </div>
                  <div className="w-full h-2 bg-content3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(((member.user_size || 0) / member.capacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="flat" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openModal(member)}
                  >
                    编辑
                  </Button>
                  <Button 
                    variant="flat" 
                    size="sm" 
                    color="danger"
                    className="flex-1"
                    onClick={() => handleDelete(member)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? '编辑成员' : '添加成员'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="flat" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button color="primary" onClick={handleSave} isLoading={saving}>
              保存
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={form.username}
            onChange={(v) => setForm({ ...form, username: v })}
          />
          <Input
            label="邮箱"
            type="email"
            placeholder="请输入邮箱"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Input
            label={editingMember ? '新密码（留空不修改）' : '密码'}
            type="password"
            placeholder={editingMember ? '留空不修改密码' : '请输入密码'}
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
          />
          <Input
            label="手机号（可选）"
            placeholder="请输入手机号"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">角色</label>
            <select
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-content2 border border-divider rounded-lg text-foreground"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="存储配额 (GB)"
            type="number"
            placeholder="请输入存储配额"
            value={String(bytesToGB(form.capacity))}
            onChange={(v) => setForm({ ...form, capacity: gbToBytes(Number(v) || 0) })}
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">状态</label>
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-content2 border border-divider rounded-lg text-foreground"
            >
              <option value={1}>正常</option>
              <option value={0}>禁用</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Member;
