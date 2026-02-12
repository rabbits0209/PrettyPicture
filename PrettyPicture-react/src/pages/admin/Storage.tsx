import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal } from '../../components/ui';
import { Empty } from '../../components/Empty';
import { Loading } from '../../components/Loading';
import { storageApi } from '../../api/storage';
import { useUIStore } from '../../store';
import type { StorageBucket } from '../../types';

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 不同存储类型需要的字段配置
// 数据库字段: AccessKey, SecretKey, bucket, region, space_domain, endpoint
const storageFieldConfig: Record<string, { fields: string[]; labels: Record<string, string>; placeholders: Record<string, string> }> = {
  local: {
    fields: [],
    labels: {},
    placeholders: {},
  },
  cos: {
    fields: ['AccessKey', 'SecretKey', 'bucket', 'region', 'space_domain'],
    labels: {
      AccessKey: 'SecretId',
      SecretKey: 'SecretKey',
      bucket: 'Bucket',
      region: 'Region',
      space_domain: '访问域名',
    },
    placeholders: {
      AccessKey: '请输入腾讯云 SecretId',
      SecretKey: '请输入腾讯云 SecretKey',
      bucket: '请输入 Bucket 名称，如 example-1250000000',
      region: '请输入地域，如 ap-guangzhou',
      space_domain: '自定义域名（可选）',
    },
  },
  oss: {
    fields: ['AccessKey', 'SecretKey', 'bucket', 'endpoint', 'space_domain'],
    labels: {
      AccessKey: 'AccessKey ID',
      SecretKey: 'AccessKey Secret',
      bucket: 'Bucket',
      endpoint: 'Endpoint',
      space_domain: '访问域名',
    },
    placeholders: {
      AccessKey: '请输入阿里云 AccessKey ID',
      SecretKey: '请输入阿里云 AccessKey Secret',
      bucket: '请输入 Bucket 名称',
      endpoint: '请输入 Endpoint，如 oss-cn-hangzhou.aliyuncs.com',
      space_domain: '自定义域名（可选）',
    },
  },
  obs: {
    fields: ['AccessKey', 'SecretKey', 'bucket', 'endpoint', 'space_domain'],
    labels: {
      AccessKey: 'Access Key Id',
      SecretKey: 'Secret Access Key',
      bucket: 'Bucket',
      endpoint: 'Endpoint',
      space_domain: '访问域名',
    },
    placeholders: {
      AccessKey: '请输入华为云 AK',
      SecretKey: '请输入华为云 SK',
      bucket: '请输入桶名称',
      endpoint: '请输入 Endpoint，如 obs.cn-north-4.myhuaweicloud.com',
      space_domain: '自定义域名（可选）',
    },
  },
  kodo: {
    fields: ['AccessKey', 'SecretKey', 'bucket', 'space_domain'],
    labels: {
      AccessKey: 'AccessKey',
      SecretKey: 'SecretKey',
      bucket: 'Bucket',
      space_domain: '访问域名',
    },
    placeholders: {
      AccessKey: '请输入七牛云 AccessKey',
      SecretKey: '请输入七牛云 SecretKey',
      bucket: '请输入空间名称',
      space_domain: '请输入绑定的域名（必填）',
    },
  },
  s3: {
    fields: ['AccessKey', 'SecretKey', 'bucket', 'region', 'endpoint', 'space_domain'],
    labels: {
      AccessKey: 'Access Key ID',
      SecretKey: 'Secret Access Key',
      bucket: 'Bucket',
      region: 'Region',
      endpoint: 'Endpoint',
      space_domain: '访问域名',
    },
    placeholders: {
      AccessKey: '请输入 AWS Access Key ID',
      SecretKey: '请输入 AWS Secret Access Key',
      bucket: '请输入 Bucket 名称',
      region: '请输入区域，如 us-east-1',
      endpoint: '自定义 Endpoint（可选，用于兼容 S3 的服务）',
      space_domain: '自定义域名（可选）',
    },
  },
};

export const Storage: React.FC = () => {
  const { addToast } = useUIStore();
  const [storages, setStorages] = useState<StorageBucket[]>([]);
  const [storageTypes, setStorageTypes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState<StorageBucket | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'local',
    AccessKey: '',
    SecretKey: '',
    bucket: '',
    endpoint: '',
    space_domain: '',
    region: '',
  });
  const [saving, setSaving] = useState(false);
  const [page] = useState(1);

  const loadStorages = async () => {
    setLoading(true);
    try {
      const res: any = await storageApi.query({ page, size: 20 });
      setStorages(res.data?.data || []);
    } catch {
      addToast('加载存储桶失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      const res: any = await storageApi.type();
      setStorageTypes(res.data || {});
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStorages();
    loadTypes();
  }, [page]);

  const openModal = (storage?: StorageBucket) => {
    if (storage) {
      setEditingStorage(storage);
      setForm({
        name: storage.name,
        type: storage.type,
        AccessKey: storage.AccessKey || '',
        SecretKey: storage.SecretKey || '',
        bucket: storage.bucket || '',
        endpoint: storage.endpoint || '',
        space_domain: storage.space_domain || '',
        region: storage.region || '',
      });
    } else {
      setEditingStorage(null);
      setForm({
        name: '',
        type: 'local',
        AccessKey: '',
        SecretKey: '',
        bucket: '',
        endpoint: '',
        space_domain: '',
        region: '',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast('请输入存储桶名称', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingStorage) {
        await storageApi.update({ id: editingStorage.id, ...form });
      } else {
        await storageApi.save(form);
      }
      addToast(editingStorage ? '修改成功' : '创建成功', 'success');
      setModalOpen(false);
      loadStorages();
    } catch (err: any) {
      addToast(err.msg || '操作失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (storage: StorageBucket) => {
    if (!confirm(`确定要删除存储桶"${storage.name}"吗？`)) return;

    try {
      await storageApi.delete(storage.id);
      addToast('删除成功', 'success');
      loadStorages();
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
        <h1 className="text-2xl font-bold text-foreground">存储桶管理</h1>
        <Button color="primary" onClick={() => openModal()}>
          添加存储桶
        </Button>
      </div>

      {storages.length === 0 ? (
        <Empty
          title="暂无存储桶"
          description="添加存储桶来存储您的图片"
          action={
            <Button color="primary" onClick={() => openModal()}>
              添加存储桶
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {storages.map((storage) => (
            <Card key={storage.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{storage.name}</h3>
                    <p className="text-sm text-foreground/60">
                      {storageTypes[storage.type] || storage.type}
                      {' · '}
                      {storage.imgCount || 0} 张图片
                      {' · '}
                      {formatSize(storage.imgSize || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openModal(storage)}>
                    编辑
                  </Button>
                  <Button variant="ghost" size="sm" color="danger" onClick={() => handleDelete(storage)}>
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
        title={editingStorage ? '编辑存储桶' : '添加存储桶'}
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
            label="存储桶名称"
            placeholder="请输入存储桶名称"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">存储类型</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 bg-content2 border border-divider rounded-lg text-foreground"
            >
              {Object.entries(storageTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 根据存储类型动态显示字段 */}
          {form.type !== 'local' && storageFieldConfig[form.type] && (
            <div className="space-y-4 pt-2 border-t border-divider">
              <p className="text-sm text-foreground/60">
                {storageTypes[form.type]} 配置
              </p>
              {storageFieldConfig[form.type].fields.map((field) => (
                <Input
                  key={field}
                  label={storageFieldConfig[form.type].labels[field] || field}
                  type={field === 'SecretKey' ? 'password' : 'text'}
                  placeholder={storageFieldConfig[form.type].placeholders[field] || `请输入 ${field}`}
                  value={(form as any)[field] || ''}
                  onChange={(v) => setForm({ ...form, [field]: v })}
                />
              ))}
            </div>
          )}

          {form.type === 'local' && (
            <div className="p-4 bg-content2 rounded-lg">
              <p className="text-sm text-foreground/70">
                本地存储将图片保存在服务器本地，无需额外配置。
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Storage;
