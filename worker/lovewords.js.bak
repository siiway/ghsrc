/*
Love Words Storage using CF Workers and KV
by wyf9. All Rights Reserved.

add:
0 - OK
1 - Wrong PWD
2 - Reach KV Limit
*/

tpwd = "wpwd";

header = {
    "Content-type": "text/html;charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  }

json_header = {
    "Content-type": "text/html;charset=UTF-8;application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  }

/*/生成从minNum到maxNum的随机数, from Runoob.com
async function random(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
} 
*/

async function stover(pwd) {
  if (pwd != tpwd) {
    return false;
  } else {
    return true;
  };
};

async function stoadd(name, value, key) {
  if (!stover(key)) {return 1;};
  let wstat
  wstat, await STO.put(name, value)
    if (typeof (wstat) == "undefined") {
    return 0;
  } else {
    return 2;
  }
};
/*
async function stoget(name) {
  if (!name) {return null;};
  let value = await STO.get(name);
  if (value != null) {
    return value;

  };
};

async function stodel(name, key) {
  // nope
};

const routes = {
  "^/": handleMain,
  "^/add": handleAdd,
  "^/get": handleGet,
  "^/del": handleDel,
};
*/
const routes = {
  "^/add": handleAdd,
};

// HTTP API add
async function handleAdd(params) {
  const { name, value, key } = params;
  let stat = stoadd(name=name, value=value, key=key);
  if (stat == 0) {
    return new Response(
      `{"status":200, "message":"OK", "name": "` + name + `", "value": "` + value + `"}`,
      {headers: response_header,}
    );
  } else if (stat == 1) {
    return new Response(
      `{"status":403, "message":"PWD incorrent"}`,
      {headers: response_header,}
    );
  } else if (stat == 2) {
    return new Response(
      `{"status":500, "message":"Reach the KV write limitation."}`,
      {headers: response_header,}
    );
  }
}
/*
// HTTP API get
async function handleGet(params) {
  return "Nope";
  const { name } = params;

  let value = await STO.get(name);
  if (value != null) {
    return new Response(value, {headers: response_header,});
  } else {
    return new Response(
      `{"status":404, "message":"Error: Key not exist."}`,
      {headers: response_header,}
    );
  }
}

// HTTP API del
async function handleDel(params) {
  return "Nope";
  
  const { name } = params;

  await STO.delete(name);

  return new Response(`{"status":200}`, {
    headers: response_header,
  });
}

async function handleRequest(request) {
*/
  // HTTP API
  const { pathname, searchParams } = new URL(request.url);

  for (const route in routes) {
    const regex = new RegExp(route);

    if (regex.test(pathname)) {
      const params = Object.fromEntries(searchParams.entries());
      return routes[route](params);
    }
  }

addEventListener("fetch", async event => {
  event.respondWith(handleRequest(event.request))
})