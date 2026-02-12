import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import { Empty } from '../components/Empty';
import { Loading } from '../components/Loading';
import { roleApi } from '../api/role';
import { useUIStore } from '../store';
import type { Role } from '../types';

export const RoleView: React.FC = () => {
  const { addToast } = useUIStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await roleApi.query({ page: 1, size: 100, name: '' });
        setRoles((res as any).data?.data || []);
      } catch {
        addToast('加载角色组失败', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Loading fullscreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">角色组</h1>

      {roles.length === 0 ? (
        <Empty title="暂无角色" description="系统暂未配置角色组" />
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-foreground">{role.name}</h3>
                {role.default === 1 && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">默认</span>
                )}
              </div>
              <p className="text-sm text-foreground/60 mb-2">
                存储桶: {role.storage_name || '未设置'} · {role.user_num || 0} 个用户
              </p>
              <div className="flex flex-wrap gap-2">
                {role.is_add === 1 && <span className="px-2 py-0.5 bg-content2 text-xs rounded">上传</span>}
                {role.is_del_own === 1 && <span className="px-2 py-0.5 bg-content2 text-xs rounded">删除自己</span>}
                {role.is_del_all === 1 && <span className="px-2 py-0.5 bg-content2 text-xs rounded">删除全部</span>}
                {role.is_read_all === 1 && <span className="px-2 py-0.5 bg-content2 text-xs rounded">查看全部</span>}
                {role.is_admin === 1 && <span className="px-2 py-0.5 bg-danger/10 text-danger text-xs rounded">管理员</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleView;
