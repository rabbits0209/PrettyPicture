import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal } from '../../components/ui';
import { Empty } from '../../components/Empty';
import { Loading } from '../../components/Loading';
import { roleApi } from '../../api/role';
import { storageApi } from '../../api/storage';
import { useUIStore } from '../../store';
import type { Role as RoleType, StorageBucket } from '../../types';

export const Role: React.FC = () => {
  const { addToast } = useUIStore();
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [storages, setStorages] = useState<StorageBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [form, setForm] = useState({
    name: '',
    storage_id: 0,
    is_add: 1,
    is_del_own: 1,
    is_del_all: 0,
    is_read: 1,
    is_read_all: 0,
    is_admin: 0,
    default: 0,
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roleRes, storageRes] = await Promise.all([
        roleApi.query({ page: 1, size: 100, name: '' }),
        storageApi.query({ page: 1, size: 100 }),
      ]);
      setRoles((roleRes as any).data?.data || []);
      setStorages((storageRes as any).data?.data || []);
    } catch {
      addToast('加载数据失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (role?: RoleType) => {
    if (role) {
      setEditingRole(role);
      setForm({
        name: role.name,
        storage_id: role.storage_id,
        is_add: role.is_add,
        is_del_own: role.is_del_own,
        is_del_all: role.is_del_all,
        is_read: role.is_read,
        is_read_all: role.is_read_all,
        is_admin: role.is_admin,
        default: role.default,
      });
    } else {
      setEditingRole(null);
      setForm({
        name: '',
        storage_id: storages[0]?.id || 0,
        is_add: 1,
        is_del_own: 1,
        is_del_all: 0,
        is_read: 1,
        is_read_all: 0,
        is_admin: 0,
        default: 0,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast('请输入角色名称', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingRole) {
        await roleApi.update({ id: editingRole.id, ...form });
      } else {
        await roleApi.save(form);
      }
      addToast(editingRole ? '修改成功' : '创建成功', 'success');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast(err.msg || '操作失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: RoleType) => {
    if (!confirm(`确定要删除角色"${role.name}"吗？`)) return;

    try {
      await roleApi.delete(role.id);
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
        <h1 className="text-2xl font-bold text-foreground">角色组管理</h1>
        <Button color="primary" onClick={() => openModal()}>
          添加角色
        </Button>
      </div>

      {roles.length === 0 ? (
        <Empty
          title="暂无角色"
          description="添加角色来管理用户权限"
          action={
            <Button color="primary" onClick={() => openModal()}>
              添加角色
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{role.name}</h3>
                    {role.default === 1 && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/60 mt-1">
                    存储桶: {role.storage_name || '未设置'}
                    {' · '}
                    {role.user_num || 0} 个用户
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {role.is_add === 1 && <span className="px-2 py-0.5 bg-content2 text-xs rounded">上传</span>}
                    {role.is_del_own === 1 && <span className="px-2 py-0.5 bg-content2 text-xs rounded">删除自己</span>}
                    {role.is_del_all === 1 && <span className="px-2 py-0.5 bg-content2 text-xs rounded">删除全部</span>}
                    {role.is_read_all === 1 && <span className="px-2 py-0.5 bg-content2 text-xs rounded">查看全部</span>}
                    {role.is_admin === 1 && <span className="px-2 py-0.5 bg-danger/10 text-danger text-xs rounded">管理员</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openModal(role)}>
                    编辑
                  </Button>
                  <Button variant="ghost" size="sm" color="danger" onClick={() => handleDelete(role)}>
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
        title={editingRole ? '编辑角色' : '添加角色'}
        size="lg"
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
            label="角色名称"
            placeholder="请输入角色名称"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">关联存储桶</label>
            <select
              value={form.storage_id}
              onChange={(e) => setForm({ ...form, storage_id: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-content2 border border-divider rounded-lg text-foreground"
            >
              {storages.map((storage) => (
                <option key={storage.id} value={storage.id}>
                  {storage.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">权限设置</label>
            <div className="space-y-2">
              {/* 管理员权限 */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_admin === 1}
                  onChange={(e) => setForm({ ...form, is_admin: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded border-divider"
                />
                <span className="text-sm text-foreground">管理员权限</span>
              </label>
              {form.is_admin === 1 && (
                <p className="text-xs text-foreground/60 ml-6">管理员拥有所有权限</p>
              )}
              
              {/* 其他权限（非管理员时显示） */}
              {form.is_admin !== 1 && (
                <>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_add === 1}
                      onChange={(e) => setForm({ ...form, is_add: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded border-divider"
                    />
                    <span className="text-sm text-foreground">上传图片</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_read === 1}
                      onChange={(e) => setForm({ ...form, is_read: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded border-divider"
                    />
                    <span className="text-sm text-foreground">查看图片</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_read_all === 1}
                      onChange={(e) => setForm({ ...form, is_read_all: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded border-divider"
                    />
                    <span className="text-sm text-foreground">查看所有图片</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_del_own === 1}
                      onChange={(e) => setForm({ ...form, is_del_own: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded border-divider"
                    />
                    <span className="text-sm text-foreground">删除自己的图片</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_del_all === 1}
                      onChange={(e) => setForm({ ...form, is_del_all: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded border-divider"
                    />
                    <span className="text-sm text-foreground">删除所有图片</span>
                  </label>
                </>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.default === 1}
              onChange={(e) => setForm({ ...form, default: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 rounded border-divider"
            />
            <span className="text-sm text-foreground">设为默认角色（新注册用户自动分配）</span>
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default Role;
