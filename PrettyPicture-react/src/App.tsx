import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastContainer } from './components/Toast';
import { useUIStore, useConfigStore } from './store';
import { getConfig } from './api/setup';
import './styles/index.css';

function App() {
  const { toasts, removeToast } = useUIStore();
  const { setConfig } = useConfigStore();

  // 加载系统配置
  useEffect(() => {
    getConfig().then((res: any) => {
      if (res.data) {
        // 处理 upload_rule 字段，从字符串转换为数组
        const configData = {
          ...res.data,
          upload_rule: typeof res.data.upload_rule === 'string' 
            ? res.data.upload_rule.split(',') 
            : res.data.upload_rule || []
        };
        setConfig(configData);
      }
    }).catch(() => {
      // 忽略错误，使用默认配置
    });
  }, [setConfig]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

export default App;
