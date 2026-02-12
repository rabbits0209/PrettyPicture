// src/types/index.ts
// 数据类型定义

// 用户角色权限
export interface UserRole {
  name: string;
  is_add: number;
  is_admin: number;
  is_del_all: number;
  is_del_own: number;
  is_read: number;
  is_read_all: number;
}

// 用户信息
export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  phone?: string;
  capacity: number;
  user_size: number;
  state: number;
  Secret_key: string;
  role: UserRole;
  scheme: string;
  url: string;
}

// 图片信息
export interface ImageItem {
  id: number;
  user_id: number;
  storage_id: number;
  folder_id: number;
  name: string;
  size: number;
  width: number;
  height: number;
  path: string;
  mime: string;
  url: string;
  ip: string;
  create_time: string;
  user_name?: string;
  user_email?: string;
  folder_name?: string;
}

// 目录信息
export interface Folder {
  id: number;
  user_id: number;
  name: string;
  is_public: number;
  create_time: string;
}

// 存储桶信息
export interface StorageBucket {
  id: number;
  name: string;
  type: string;
  AccessKey?: string;
  SecretKey?: string;
  bucket?: string;
  endpoint?: string;
  space_domain?: string;
  region?: string;
  imgCount?: number;
  imgSize?: number;
}

// 角色组信息
export interface Role {
  id: number;
  name: string;
  storage_id: number;
  storage_name?: string;
  is_add: number;
  is_admin: number;
  is_del_all: number;
  is_del_own: number;
  is_read: number;
  is_read_all: number;
  default: number;
  user_num?: number;
}

// 成员信息
export interface Member {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar: string;
  role_id: number;
  role_name?: string;
  capacity: number;
  user_size?: number;
  state: number;
  reg_ip: string;
  create_time: string;
}

// 操作日志
export interface LogItem {
  id: number;
  uid: number;
  type: number;
  name: string;
  content: string;
  remark: string;
  create_time: string;
  user?: {
    username: string;
    email: string;
    avatar: string;
  };
}

// 系统配置
export interface SystemConfig {
  site_name: string;
  is_reg: number;
  reg_email_verify: number;
  init_quota: number;
  upload_max: number;
  upload_rule: string[];
  is_show_storage: number;
  is_show_role: number;
  is_show_member: number;
}

// Toast 消息类型
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast 消息
export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// API 响应
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}
