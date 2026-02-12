import React, { useState } from 'react';
import { Card, TabItem, Button } from '../components/ui';
import { useAuthStore, useUIStore } from '../store';

export const ApiDocs: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('upload');

  const baseUrl = window.location.origin;
  const apiKey = user?.Secret_key || 'YOUR_API_KEY';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast('已复制到剪贴板', 'success');
    } catch {
      addToast('复制失败', 'error');
    }
  };

  const tabs = [
    { key: 'upload', label: '上传图片' },
    { key: 'delete', label: '删除图片' },
    { key: 'random', label: '随机图片' },
  ];

  // 上传接口示例
  const uploadCurl = `curl -X POST "${baseUrl}/api/upload" \\
  -F "key=${apiKey}" \\
  -F "file=@/path/to/image.jpg" \\
  -F "folder_id=1"`;

  const uploadJs = `const formData = new FormData();
formData.append('key', '${apiKey}');
formData.append('file', fileInput.files[0]);
formData.append('folder_id', '1'); // 可选，目录ID

fetch('${baseUrl}/api/upload', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));`;

  const uploadPython = `import requests

url = "${baseUrl}/api/upload"
files = {"file": open("image.jpg", "rb")}
data = {
    "key": "${apiKey}",
    "folder_id": 1  # 可选，目录ID
}

response = requests.post(url, files=files, data=data)
print(response.json())`;

  // 删除接口示例
  const deleteCurl = `curl -X DELETE "${baseUrl}/api/delete?key=${apiKey}&id=123"`;

  const deleteJs = `fetch('${baseUrl}/api/delete?key=${apiKey}&id=123', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => console.log(data));`;

  const deletePython = `import requests

url = "${baseUrl}/api/delete"
params = {
    "key": "${apiKey}",
    "id": 123  # 图片ID
}

response = requests.delete(url, params=params)
print(response.json())`;

  // 随机图片示例
  const randomCurl = `# 直接跳转（默认）
curl -L "${baseUrl}/api/random?folder_id=1"

# 返回JSON
curl "${baseUrl}/api/random?folder_id=1&type=json"

# 指定方向
curl -L "${baseUrl}/api/random?folder_id=1&orientation=vertical"`;

  const randomJs = `// 直接在img标签中使用
<img src="${baseUrl}/api/random?folder_id=1" alt="随机图片" />

// 获取JSON格式
fetch('${baseUrl}/api/random?folder_id=1&type=json')
  .then(res => res.json())
  .then(data => console.log(data.data.url));`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">API 接口文档</h1>

      {/* API Key */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground/60">您的 API 密钥 (key)</p>
            <p className="font-mono text-foreground mt-1 break-all">{apiKey}</p>
          </div>
          <Button variant="flat" onClick={() => handleCopy(apiKey)} className="shrink-0">
            复制
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-divider overflow-x-auto">
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

      {/* Upload API */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">上传图片</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/60">请求地址</p>
                <code className="block mt-1 p-2 bg-content2 rounded text-sm break-all">
                  POST {baseUrl}/api/upload
                </code>
              </div>
              <div>
                <p className="text-sm text-foreground/60">请求方式</p>
                <code className="block mt-1 p-2 bg-content2 rounded text-sm">
                  multipart/form-data
                </code>
              </div>
              <div>
                <p className="text-sm text-foreground/60">请求参数</p>
                <div className="overflow-x-auto">
                  <table className="w-full mt-2 text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-divider">
                        <th className="text-left py-2 text-foreground/60">参数</th>
                        <th className="text-left py-2 text-foreground/60">类型</th>
                        <th className="text-left py-2 text-foreground/60">必填</th>
                        <th className="text-left py-2 text-foreground/60">说明</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-divider">
                        <td className="py-2 text-foreground">key</td>
                        <td className="py-2 text-foreground/70">String</td>
                        <td className="py-2 text-foreground/70">是</td>
                        <td className="py-2 text-foreground/70">API 密钥</td>
                      </tr>
                      <tr className="border-b border-divider">
                        <td className="py-2 text-foreground">file</td>
                        <td className="py-2 text-foreground/70">File</td>
                        <td className="py-2 text-foreground/70">是</td>
                        <td className="py-2 text-foreground/70">图片文件</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-foreground">folder_id</td>
                        <td className="py-2 text-foreground/70">Number</td>
                        <td className="py-2 text-foreground/70">否</td>
                        <td className="py-2 text-foreground/70">目录 ID，默认 0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground/60">返回示例</p>
                <pre className="mt-1 p-3 bg-content2 rounded text-sm overflow-x-auto">
{`{
  "code": 200,
  "msg": "成功",
  "data": {
    "id": 123,
    "name": "image.jpg",
    "url": "https://example.com/uploads/image.jpg",
    "size": 102400,
    "width": 1920,
    "height": 1080
  }
}`}
                </pre>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">cURL</h3>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(uploadCurl)}>复制</Button>
            </div>
            <pre className="p-4 bg-content2 rounded-lg text-sm overflow-x-auto"><code>{uploadCurl}</code></pre>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">JavaScript</h3>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(uploadJs)}>复制</Button>
            </div>
            <pre className="p-4 bg-content2 rounded-lg text-sm overflow-x-auto"><code>{uploadJs}</code></pre>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Python</h3>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(uploadPython)}>复制</Button>
            </div>
            <pre className="p-4 bg-content2 rounded-lg text-sm overflow-x-auto"><code>{uploadPython}</code></pre>
          </Card>
        </div>
      )}

      {/* Delete API */}
      {activeTab === 'delete' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">删除图片</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/60">请求地址</p>
                <code className="block mt-1 p-2 bg-content2 rounded text-sm break-all">
                  DELETE {baseUrl}/api/delete
                </code>
              </div>
              <div>
                <p className="text-sm text-foreground/60">请求参数</p>
                <div className="overflow-x-auto">
                  <table className="w-full mt-2 text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-divider">
                        <th className="text-left py-2 text-foreground/60">参数</th>
                        <th className="text-left py-2 text-foreground/60">类型</th>
                        <th className="text-left py-2 text-foreground/60">必填</th>
                        <th className="text-left py-2 text-foreground/60">说明</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-divider">
                        <td className="py-2 text-foreground">key</td>
                        <td className="py-2 text-foreground/70">String</td>
                        <td className="py-2 text-foreground/70">是</td>
                        <td className="py-2 text-foreground/70">API 密钥</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-foreground">id</td>
                        <td className="py-2 text-foreground/70">Number</td>
                        <td className="py-2 text-foreground/70">是</td>
                        <td className="py-2 text-foreground/70">图片 ID</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground/60">返回示例</p>
                <pre className="mt-1 p-3 bg-content2 rounded text-sm overflow-x-auto">
{`{
  "code": 200,
  "msg": "删除成功",
  "data": "image.jpg"
}`}
                </pre>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <p className="text-sm text-warning">注意：删除操作需要对应的权限（删除自己的图片或删除全部图片权限）</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">cURL</h3>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(deleteCurl)}>复制</Button>
            </div>
            <pre className="p-4 bg-content2 rounded-lg text-sm overflow-x-auto"><code>{deleteCurl}</code></pre>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">JavaScript</h3>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(deleteJs)}>复制</Button>
            </div>
            <pre className="p-4 bg-content2 rounded-lg text-sm overflow-x-auto"><code>{deleteJs}</code></pre>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Python</h3>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(deletePython)}>复制</Button>
            </div>
            <pre className="p-4 bg-content2 rounded-lg text-sm overflow-x-auto"><code>{deletePython}</code></pre>
          </Card>
        </div>
      )}

      {/* Random API */}
      {activeTab === 'random' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">随机图片</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/60">请求地址</p>
                <code className="block mt-1 p-2 bg-content2 rounded text-sm break-all">
                  GET {baseUrl}/api/random
                </code>
              </div>
              <div>
                <p className="text-sm text-foreground/60">说明</p>
                <p className="text-sm text-foreground/70 mt-1">
                  从指定的公开目录中随机返回一张图片，无需认证。默认直接跳转到图片地址。
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">请求参数</p>
                <div className="overflow-x-auto">
                  <table className="w-full mt-2 text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-divider">
                        <th className="text-left py-2 text-foreground/60">参数</th>
                        <th className="text-left py-2 text-foreground/60">类型</th>
                        <th className="text-left py-2 text-foreground/60">必填</th>
                        <th className="text-left py-2 text-foreground/60">说明</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-divider">
                        <td className="py-2 text-foreground">folder_id</td>
                        <td className="py-2 text-foreground/70">Number</td>
                        <td className="py-2 text-foreground/70">是</td>
                        <td className="py-2 text-foreground/70">公开目录 ID</td>
                      </tr>
                      <tr className="border-b border-divider">
                        <td className="py-2 text-foreground">type</td>
                        <td className="py-2 text-foreground/70">String</td>
                        <td className="py-2 text-foreground/70">否</td>
                        <td className="py-2 text-foreground/70">返回类型：redirect(默认跳转) / json</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-foreground">orientation</td>
                        <td className="py-2 text-foreground/70">String</td>
                        <td className="py-2 text-foreground/70">否</td>
                        <td className="py-2 text-foreground/70">图片方向：auto(自动) / vertical(竖图) / horizontal(横图)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground/60">返回示例 (type=json)</p>
                <pre className="mt-1 p-3 bg-content2 rounded text-sm overflow-x-auto">
{`{
  "code": 200,
  "msg": "成功",
  "data": {
    "url": "https://example.com/uploads/random.jpg"
  }
}`}
                </pre>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">cURL</h3>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(randomCurl)}>复制</Button>
            </div>
            <pre className="p-4 bg-content2 rounded-lg text-sm overflow-x-auto"><code>{randomCurl}</code></pre>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">HTML / JavaScript</h3>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(randomJs)}>复制</Button>
            </div>
            <pre className="p-4 bg-content2 rounded-lg text-sm overflow-x-auto"><code>{randomJs}</code></pre>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium text-foreground mb-4">使用场景</h3>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>• 网站随机背景图：将接口地址直接作为 CSS background-image</li>
              <li>• 随机壁纸 API：配合 orientation 参数适配不同设备</li>
              <li>• 图片轮播：每次请求返回不同图片</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApiDocs;
