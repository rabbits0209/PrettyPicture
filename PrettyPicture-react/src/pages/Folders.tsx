import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal } from '../components/ui';
import { Empty } from '../components/Empty';
import { Loading } from '../components/Loading';
import { folderApi } from '../api/folder';
import { useUIStore } from '../store';
import type { Folder } from '../types';

export const Folders: React.FC = () => {
  const { addToast } = useUIStore();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [form, setForm] = useState({ name: '', is_public: 0 });
  const [saving, setSaving] = useState(false);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const res: any = await folderApi.query();
      setFolders(res.data || []);
    } catch {
      addToast('加载目录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const openModal = (folder?: Folder) => {
    if (folder) {
      setEditingFolder(folder);
      setForm({ name: folder.name, is_public: folder.is_public });
    } else {
      setEditingFolder(null);
      setForm({ name: '', is_public: 0 });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast('请输入目录名称', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingFolder) {
        await folderApi.update({ id: editingFolder.id, ...form });
      } else {
        await folderApi.save(form);
      }
      addToast(editingFolder ? '修改成功' : '创建成功', 'success');
      setModalOpen(false);
      loadFolders();
    } catch (err: any) {
      addToast(err.msg || '操作失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (folder: Folder) => {
    if (!confirm(`确定要删除目录"${folder.name}"吗？`)) return;

    try {
      await folderApi.delete(folder.id);
      addToast('删除成功', 'success');
      loadFolders();
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
        <h1 className="text-2xl font-bold text-foreground">目录管理</h1>
        <Button color="primary" onClick={() => openModal()}>
          新建目录
        </Button>
      </div>

      {folders.length === 0 ? (
        <Empty
          title="暂无目录"
          description="创建目录来更好地组织您的图片"
          action={
            <Button color="primary" onClick={() => openModal()}>
              创建目录
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Card key={folder.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{folder.name}</h3>
                  <p className="text-sm text-foreground/60 mt-1">
                    {folder.is_public ? '公开' : '私有'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal(folder)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    color="danger"
                    onClick={() => handleDelete(folder)}
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
        title={editingFolder ? '编辑目录' : '新建目录'}
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
            label="目录名称"
            placeholder="请输入目录名称"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_public"
              checked={form.is_public === 1}
              onChange={(e) => setForm({ ...form, is_public: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 rounded border-divider"
            />
            <label htmlFor="is_public" className="text-sm text-foreground">
              设为公开（用于随机图片 API）
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Folders;
