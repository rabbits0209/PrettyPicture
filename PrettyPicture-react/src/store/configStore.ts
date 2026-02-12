import { create } from 'zustand';
import type { SystemConfig } from '../types';

interface ConfigState {
  config: SystemConfig;
  isLoading: boolean;
  setConfig: (config: Partial<SystemConfig>) => void;
  setLoading: (loading: boolean) => void;
}

const defaultConfig: SystemConfig = {
  site_name: 'PrettyPicture',
  is_reg: 1,
  reg_email_verify: 1, // 默认开启邮箱验证
  init_quota: 100,
  upload_max: 10,
  upload_rule: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
  is_show_storage: 1,
  is_show_role: 1,
  is_show_member: 1,
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: defaultConfig,
  isLoading: false,
  setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
  setLoading: (isLoading) => set({ isLoading }),
}));
