import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import { Empty } from '../components/Empty';
import { Loading } from '../components/Loading';
import { memberApi } from '../api/member';
import { useUIStore } from '../store';
import type { Member } from '../types';

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const MemberView: React.FC = () => {
  const { addToast } = useUIStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await memberApi.query({ page: 1, size: 100, name: '' });
        setMembers((res as any).data?.data || []);
      } catch {
        addToast('加载成员列表失败', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Loading fullscreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">团队成员</h1>

      {members.length === 0 ? (
        <Empty title="暂无成员" description="系统暂无其他成员" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 overflow-hidden">
                  {member.avatar ? (
                    <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary text-2xl font-bold">
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground truncate">{member.username}</h3>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${member.state === 1 ? 'bg-success' : 'bg-danger'}`} />
                </div>
                <p className="text-sm text-foreground/60 mb-2 truncate w-full">{member.email}</p>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                  {member.role_name || '未分配角色'}
                </span>
                <div className="w-full">
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberView;
