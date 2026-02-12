import api from './index';

interface MemberParams {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  new_password?: string;
  pwd?: number;
  role_id?: number;
  phone?: string;
  avatar?: string;
  capacity?: number;
  state?: number;
}

interface QueryParams {
  page: number;
  size: number;
  name?: string;
}

export const memberApi = {
  query: (params: QueryParams) => api.get('/member/query', { params }),
  save: (data: MemberParams) => api.post('/member/save', data),
  update: (data: MemberParams) => api.put('/member/update', data),
  delete: (id: number) => api.delete('/member/delete', { params: { id } }),
};
