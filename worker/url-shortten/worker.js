const config = {
  no_ref: "off", //Control the HTTP referrer header, if you want to create an anonymous link that will hide the HTTP Referer header, please set to "on" .
  theme: "",//Homepage theme, use the empty value for default theme. To use urlcool theme, please fill with "theme/urlcool" .
  cors: "on",//Allow Cross-origin resource sharing for API requests.
  unique_link: false,//If it is true, the same long url will be shorten into the same short url
  custom_link: true,//Allow users to customize the short url.
  snapchat_mode: false,//The link will be distroyed after access.
  visit_count: false,//Count visit times.
  load_kv: true,//Load all from Cloudflare KV
  shorturl_system: true,//Check value is valid URL && 302 jump to the value
}

// key in protect_keylist can't read, add, del from UI and API
const protect_keylist = [
  "protected",
]

// HTTP API 路由
const routes = {
  "^/api/add": handleAdd,
  "^/api/get": handleGet,
  "^/api/del": handleDel,
};


// HTTP API add
async function handleAdd(params) {
  const { name, value } = params;
  let wstat
  wstat, await LINKS.put(name, value)
  if (typeof (wstat) == "undefined") {
    return new Response(
      `{"status":200, "message":"OK", "error": ""}`,
      {headers: response_header,}
    );
  } else {
    return new Response(
      `{"status":500, "message":"Error: Reach the KV write limitation."}`,
      {headers: response_header,}
    );
  }
}

// HTTP API get
async function handleGet(params) {
  const { name } = params;

  let value = await LINKS.get(name);
  if (value != null) {
    return new Response(value, {headers: response_header,});
  } else {
    return new Response(
      `{"status":500, "message":"Error: Key not exist."}`,
      {headers: response_header,}
    );
  }
}

// HTTP API del
async function handleDel(params) {
  const { name } = params;

  await LINKS.delete(name);

  return new Response(`{"status":200}`, {
    headers: response_header,
  });
}


let index_html = "https://ghsrc.wyf9.top/worker/url-shortten/" + config.theme + "/index.html"
let no_ref_html = "https://ghsrc.wyf9.top/worker/url-shortten/no-ref.html";

const html404 = `<!DOCTYPE html>
  <html>
  <body>
    <h1>404 Not Found.</h1>
    <p>The url you visit is not found.</p>
  </body>
  </html>`

let response_header = {
  "Content-type": "text/html;charset=UTF-8;application/json",
}

if (config.cors == "on") {
  response_header = {
    "Content-type": "text/html;charset=UTF-8;application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

async function randomString(len) {
  len = len || 6;
  let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /*去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1 *** Easily confused characters removed */
  let maxPos = $chars.length;
  let result = '';
  for (i = 0; i < len; i++) {
    result += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

async function sha512(url) {
  url = new TextEncoder().encode(url)

  const url_digest = await crypto.subtle.digest(
    {
      name: "SHA-512",
    },
    url, // The data you want to hash as an ArrayBuffer
  )
  const hashArray = Array.from(new Uint8Array(url_digest)); // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  //console.log(hashHex)
  return hashHex
}

async function checkURL(URL) {
  let str = URL;
  let Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  let objExp = new RegExp(Expression);
  if (objExp.test(str) == true) {
    if (str[0] == 'h')
      return true;
    else
      return false;
  } else {
    return false;
  }
}

async function save_url(URL) {
  let random_key = await randomString()
  let is_exist = await LINKS.get(random_key)
  // console.log(is_exist)
  if (is_exist == null) {
    return await LINKS.put(random_key, URL), random_key
  }
  else {
    save_url(URL)
  }
}

async function is_url_exist(url_sha512) {
  let is_exist = await LINKS.get(url_sha512)
  // console.log(is_exist)
  if (is_exist == null) {
    return false
  } else {
    return is_exist
  }
}

async function handleRequest(request) {
  // console.log(request)

  // 查KV中的password对应的值 Query "password" in KV
  const password_value = "wyf9114514";

  // HTTP API
  const { pathname, searchParams } = new URL(request.url);

  for (const route in routes) {
    const regex = new RegExp(route);

    if (regex.test(pathname)) {
      const params = Object.fromEntries(searchParams.entries());
      return routes[route](params);
    }
  }

  /************************/
  // 以下是API接口的处理

  if (request.method === "POST") {
    let req = await request.json();
    // console.log(req)

    let req_cmd = req["cmd"];
    let req_url = req["url"];
    let req_key = req["key"];
    let req_password = req["password"];

    /*
    console.log(req_cmd)
    console.log(req_url)
    console.log(req_key)
    console.log(req_password)
    */

    if (req_password != password_value) {
      return new Response(
        `{"status":500,"key": "", "error":"Error: Invalid password."}`,
        {
          headers: response_header,
        }
      );
    }

    if (req_cmd == "add") {
      if (config.shorturl_system && !(await checkURL(req_url))) {
        return new Response(
          `{"status":500, "url": "` +
            req_url +
            `", "error":"Error: Url illegal."}`,
          {
            headers: response_header,
          }
        );
      }

      let stat, random_key;
      if (config.custom_link && req_key != "") {
        // Refuse 'password" as Custom shortURL
        if (protect_keylist.includes(req_key)) {
          return new Response(
            `{"status":500,"key": "` +
              req_key +
              `", "error":"Error: Key in protect_keylist."}`,
            {
              headers: response_header,
            }
          );
        }

        let is_exist = await LINKS.get(req_key);
        if (is_exist != null) {
          return new Response(
            `{"status":500,"key": "` +
              req_key +
              `", "error":"Error: Specific key existed."}`,
            {
              headers: response_header,
            }
          );
        } else {
          random_key = req_key;
          stat, await LINKS.put(req_key, req_url);
        }
      } else if (config.unique_link) {
        let url_sha512 = await sha512(req_url);
        let url_key = await is_url_exist(url_sha512);
        if (url_key) {
          random_key = url_key;
        } else {
          stat, (random_key = await save_url(req_url));
          if (typeof stat == "undefined") {
            await LINKS.put(url_sha512, random_key);
            // console.log()
          }
        }
      } else {
        stat, (random_key = await save_url(req_url));
      }
      // console.log(stat)
      if (typeof stat == "undefined") {
        return new Response(
          `{"status":200, "key":"` + random_key + `", "error": ""}`,
          {
            headers: response_header,
          }
        );
      } else {
        return new Response(
          `{"status":500, "key": "", "error":"Error: Reach the KV write limitation."}`,
          {
            headers: response_header,
          }
        );
      }
    } else if (req_cmd == "del") {
      // Refuse to delete 'password' entry
      if (protect_keylist.includes(req_key)) {
        return new Response(
          `{"status":500, "key": "` +
            req_key +
            `", "error":"Error: Key in protect_keylist."}`,
          {
            headers: response_header,
          }
        );
      }

      await LINKS.delete(req_key);

      // 计数功能打开的话, 要把计数的那条KV也删掉 Remove the visit times record
      if (config.visit_count) {
        await LINKS.delete(req_key + "-count");
      }

      return new Response(
        `{"status":200, "key": "` + req_key + `", "error": ""}`,
        {
          headers: response_header,
        }
      );
    } else if (req_cmd == "qry") {
      // Refuse to query 'password'
      if (protect_keylist.includes(req_key)) {
        return new Response(
          `{"status":500,"key": "` +
            req_key +
            `", "error":"Error: Key in protect_keylist."}`,
          {
            headers: response_header,
          }
        );
      }

      let value = await LINKS.get(req_key);
      if (value != null) {
        return new Response(
          `{"status":200, "key": "` +
            req_key +
            `", "url": "` +
            value +
            `", "error":""}`,
          {
            headers: response_header,
          }
        );
      } else {
        return new Response(
          `{"status":500, "key": "` +
            req_key +
            `", "error":"Error: Key not exist."}`,
          {
            headers: response_header,
          }
        );
      }
    } else if (req_cmd == "qryall") {
      if (!config.load_kv) {
        return new Response(
          `{"status":500, "error":"Error: Config.load_kv false."}`,
          {
            headers: response_header,
          }
        );
      }

      let keyList = await LINKS.list();
      if (keyList != null) {
        // 初始化返回数据结构 Init the return struct
        let jsonObjectRetrun = JSON.parse(
          `{"status":200, "error":"", "kvlist": []}`
        );

        for (var i = 0; i < keyList.keys.length; i++) {
          let item = keyList.keys[i];
          // Hide 'password' from the query all result
          if (protect_keylist.includes(item.name)) {
            continue;
          }
          // Hide '-count' from the query all result
          if (item.name.endsWith("-count")) {
            continue;
          }

          let url = await LINKS.get(item.name);

          let newElement = { key: item.name, value: url };
          // 填充要返回的列表 Fill the return list
          jsonObjectRetrun.kvlist.push(newElement);
        }

        return new Response(JSON.stringify(jsonObjectRetrun), {
          headers: response_header,
        });
      } else {
        return new Response(
          `{"status":500, "error":"Error: Load keyList failed."}`,
          {
            headers: response_header,
          }
        );
      }
    }
  } else if (request.method === "OPTIONS") {
    return new Response(``, {
      headers: response_header,
    });
  }

  /************************/
  // 以下是浏览器直接访问worker页面的处理

  const requestURL = new URL(request.url);
  const path = requestURL.pathname.split("/")[1];
  const params = requestURL.search;

  // console.log(path)
  // 如果path为空, 即直接访问本worker
  // If visit this worker directly (no path)
  if (!path) {
    return Response.redirect("https://t.wyf9.top/fake", 302);
    /* new Response(html404, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
      status: 404
    }) */
  }

  // 如果path符合password 显示操作页面index.html
  if (path == password_value) {
    let index = await fetch(index_html);
    index = await index.text();
    index = index.replace(/__PASSWORD__/gm, password_value);
    return new Response(index, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  // 在KV中查询 短链接 对应的原链接
  // Query the value(long url) in KV by key(short url)
  const value = await LINKS.get(path);
  // console.log(value)

  if (value) {
    // 计数功能
    if (config.visit_count) {
      // 获取并增加访问计数
      let count = await LINKS.get(path + "-count");
      if (count === null) {
        await LINKS.put(path + "-count", "1"); // 初始化为1，因为这是首次访问
      } else {
        count = parseInt(count) + 1;
        await LINKS.put(path + "-count", count.toString());
      }
    }

    // 如果阅后即焚模式
    if (config.snapchat_mode) {
      // 删除KV中的记录
      // Remove record before jump to long url
      await LINKS.delete(path);
    }

    // 作为一个短链系统, value就是long URL, 需要跳转
    if (config.shorturl_system) {
      // 带上参数部分, 拼装要跳转的最终网址
      // URL to jump finally
      let location;
      if (params) {
        location = value + params;
      } else {
        location = value;
      }

      if (config.no_ref == "on") {
        let no_ref = await fetch(no_ref_html);
        no_ref = await no_ref.text();
        no_ref = no_ref.replace(/{Replace}/gm, location);
        return new Response(no_ref, {
          headers: {
            "content-type": "text/html;charset=UTF-8",
          },
        });
      } else {
        return Response.redirect(location, 302);
      }
    } else {
      // 如果只是一个单纯的key-value系统, 简单的显示value就行了
      return new Response(value, {
        headers: response_header,
      });
    }
  } else {
    // If request not in KV, return 404
    return new Response(html404, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
      status: 404,
    });
  }
}

addEventListener("fetch", async event => {
  event.respondWith(handleRequest(event.request))
})
