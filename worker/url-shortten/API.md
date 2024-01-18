> 下面的文档已机翻

# API 文档

可以通过调用 API 接口以可编程的方式生成短链接

### API调用地址

自建CloudFlare Worker地址，例如：https://url.dem0.workers.dev 或自绑定域名

### 调用方式：HTTP / POST 请求格式：JSON
例：
````
{
  "cmd": "add",
  "url": "https://example.com",
  "key": "ilikeu",
  "password": "bodongshouqulveweifengci"
}
````

### 请求参数：
```
cmd: add | del | qry
url: The long link
key: The short link
password: Authentication
```

### 响应示例 （JSON）：

````
{
  "status": 200,
  "error": "",
  "key": "HcAx62",
  "url": ""
}
````

### 响应参数：
````
"status": 200 | 500
"error": error details
"key": The short link
"url": The long link
````

“status”： 200 表示成功，其他代码表示失败。
