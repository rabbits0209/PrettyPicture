import React, { useState, useEffect } from 'react';
import { Card, Button, Input, TabItem } from '../../components/ui';
import { Loading } from '../../components/Loading';
import { setupApi } from '../../api/setup';
import { useUIStore } from '../../store';

interface SettingItem {
  id: number;
  key: string;
  value: string | number;
  title: string;
  des?: string;
  attr: string;
  extend?: any;
}

export const Settings: React.FC = () => {
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');
  const [testingEmail, setTestingEmail] = useState(false);

  const [basicSettings, setBasicSettings] = useState<SettingItem[]>([]);
  const [uploadSettings, setUploadSettings] = useState<SettingItem[]>([]);
  const [emailSettings, setEmailSettings] = useState<SettingItem[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [basicRes, uploadRes, emailRes] = await Promise.all([
          setupApi.get('basics'),
          setupApi.get('upload'),
          setupApi.get('email'),
        ]);
        setBasicSettings((basicRes as any).data || []);
        setUploadSettings((uploadRes as any).data || []);
        setEmailSettings((emailRes as any).data || []);
      } catch {
        addToast('加载设置失败', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const updateSetting = (settings: SettingItem[], setSettings: React.Dispatch<React.SetStateAction<SettingItem[]>>, id: number, value: string | number) => {
    setSettings(settings.map(s => s.id === id ? { ...s, value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentSettings = activeTab === 'basics' ? basicSettings 
        : activeTab === 'upload' ? uploadSettings 
        : emailSettings;
      
      await setupApi.update({
        createData: currentSettings.map(s => ({ id: s.id, value: s.value }))
      });
      addToast('保存成功', 'success');
    } catch (err: any) {
      addToast(err.msg || '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await setupApi.sendTest();
      addToast('测试邮件已发送到您的邮箱', 'success');
    } catch (err: any) {
      addToast(err.msg || '发送失败', 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return <Loading fullscreen />;
  }

  const tabs = [
    { key: 'basics', label: '基础设置' },
    { key: 'upload', label: '上传设置' },
    { key: 'email', label: '邮件设置' },
  ];

  const renderSettings = (settings: SettingItem[], setSettings: React.Dispatch<React.SetStateAction<SettingItem[]>>) => (
    <div className="space-y-6">
      {settings.map((setting) => (
        <div key={setting.id} className="pb-4 border-b border-divider last:border-0 last:pb-0">
          {setting.attr === 'switch' ? (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">{setting.title}</label>
                {setting.des && (
                  <p className="text-xs text-foreground/60 mt-0.5">{setting.des}</p>
                )}
              </div>
              <label className="relative cursor-pointer">
                <input
                  type="checkbox"
                  checked={setting.value === 1 || setting.value === '1'}
                  onChange={(e) => updateSetting(settings, setSettings, setting.id, e.target.checked ? 1 : 0)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-content3 rounded-full peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
          ) : setting.attr === 'select' || setting.attr === 'radio' ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{setting.title}</label>
              {setting.des && (
                <p className="text-xs text-foreground/60 mb-2">{setting.des}</p>
              )}
              <select
                value={setting.value}
                onChange={(e) => updateSetting(settings, setSettings, setting.id, e.target.value)}
                className="w-full px-3 py-2 bg-content2 border border-divider rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                {setting.extend && Object.entries(setting.extend).map(([key, val]) => (
                  <option key={key} value={val as string}>{val as string}</option>
                ))}
              </select>
            </div>
          ) : setting.attr === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{setting.title}</label>
              {setting.des && (
                <p className="text-xs text-foreground/60 mb-2">{setting.des}</p>
              )}
              <textarea
                value={String(setting.value)}
                onChange={(e) => updateSetting(settings, setSettings, setting.id, e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-content2 border border-divider rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                placeholder={`请输入${setting.title}`}
              />
            </div>
          ) : (
            <div>
              <Input
                label={setting.title}
                type={setting.attr === 'number' ? 'number' : setting.attr === 'password' ? 'password' : 'text'}
                placeholder={`请输入${setting.title}`}
                value={String(setting.value)}
                onChange={(v) => updateSetting(settings, setSettings, setting.id, setting.attr === 'number' ? Number(v) : v)}
              />
              {setting.des && (
                <p className="text-xs text-foreground/60 mt-1">{setting.des}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">系统设置</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-divider">
        {tabs.map((tab) => (
          <TabItem
            key={tab.key}
            isSelected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </TabItem>
        ))}
      </div>

      {/* Basic settings */}
      {activeTab === 'basics' && (
        <Card className="p-6">
          {renderSettings(basicSettings, setBasicSettings)}
        </Card>
      )}

      {/* Upload settings */}
      {activeTab === 'upload' && (
        <Card className="p-6">
          {renderSettings(uploadSettings, setUploadSettings)}
        </Card>
      )}

      {/* Email settings */}
      {activeTab === 'email' && (
        <Card className="p-6">
          {renderSettings(emailSettings, setEmailSettings)}
          <div className="pt-4 mt-4 border-t border-divider">
            <Button
              variant="flat"
              onClick={handleTestEmail}
              isLoading={testingEmail}
            >
              发送测试邮件
            </Button>
            <p className="text-xs text-foreground/60 mt-2">
              测试邮件将发送到您的登录邮箱
            </p>
          </div>
        </Card>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <Button color="primary" onClick={handleSave} isLoading={saving}>
          保存设置
        </Button>
      </div>
    </div>
  );
};

export default Settings;
