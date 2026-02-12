import api from './index';

interface RoleParams {
  id?: number;
  name: string;
  storage_id: number;
  is_add?: number;
  is_admin?: number;
  is_del_all?: number;
  is_del_own?: number;
  is_read?: number;
  is_read_all?: number;
  default?: number;
}

interface QueryParams {
  page: number;
  size: number;
  name?: string;
}

export const roleApi = {
  query: (params: QueryParams) => api.get('/role/query', { params }),
  save: (data: RoleParams) => api.post('/role/save', data),
  update: (data: RoleParams) => api.put('/role/update', data),
  delete: (id: number) => api.delete('/role/delete', { params: { id } }),
};
