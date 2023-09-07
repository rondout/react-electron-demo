## 使用 React+Typescript+Electron 开发跨平台桌面应用

### 项目脚本

#### 安装依赖

项目是 electron+react 工程，依赖包分别管理，可以使用以下命令直接安装全部依赖

```bash
yarn install-all
```

#### 开发模式启动

```bash
yarn start          // 只启动web工程
yarn electron:dev   //  启动web工程和electron工程
```

#### 生产环境打包

```bash
yarn electron:build
```

执行上述命令后会先打包 web 工程到指定输出目录，然后再使用 electron-builder 打包生成安装包，然后直接安装安装包即可使用该软件。

这里需要注意国内安装 electron 依赖极有可能卡住，这里需要更改 electron 镜像地址：

```bash
  npm config set electron_mirror https://npm.taobao.org/mirrors/electron/
  npm config set ELECTRON_MIRROR https://npm.taobao.org/mirrors/electron/
```

### 简介

electron 是跨平台桌面应用开发工具，electron 的工作原理大致就是使用 V8 引擎运行 web 应用，于浏览器运行 web 应用的区别就是 electron 支持所有的 NodeJs 的 api（能力），我们可以使用 electron 调用很多浏览器无法调用的操作系统的能力，比如操作文件系统等等。

### Electron 特点

优点就是跨平台，开发成本低，Web 前端工程师在学习 Electron 以及 NodeJs 有关的只是后即可上手开发桌面应用，缺点就是性能以及打包后的安装包大小偏大等等。

### 搭建 electron 工程

按照 electron 官网的搭建流程，具体分为以下几步：

1.  yarn init 按照操作完成即可（包括配置入口文件目录）
2.  使用 yarn add electron 安装 electron 依赖
3.  更改（添加）package.json 中的脚本命令，将 start 命令添加在 scripts 中
    ```json
     "scripts": {
        "start": "electron ."
     },
    ```
4.  创建入口文件，我自己的习惯是创建 electron 目录存放 electron 有关的代码并且使用 typescript 开发，因此这里我的目录结构如下：

    ```
    -build
    |   -electron
    |   -index.html
    -electron
    |   -main.ts
    |   -preload.ts
    |   -tsconfig.json`
    ```

    tsconfig.json 配置文件配置如下：

    ```json
    {
      "compilerOptions": {
        "moduleResolution": "node",
        "target": "es5",
        "module": "commonjs",
        "sourceMap": true,
        "strict": true,
        "outDir": "../build",
        "rootDir": "../",
        "noEmitOnError": true,
        "typeRoots": ["node_modules/@types"]
      }
    }
    ```

    这里比较重要的配置就是`outDir`配置项，这里需要这样配才能将编译后的 js 文件输出到 build 目录下，这样入口文件`main.js`的位置才能和 package.json 中配置的入口文件相对应。

#### 使用 electron 渲染简单的 html 页面

其实 electron 应用最终打包后页面显示的就是 html 页面，现在我们在上面搭建的基础上继续开发我们的第一个 electron 页面。
第一步：创建 Html 文件，因为最终打包的时候我会把 build 目录下的所有文件打包到安装包，因此我会把 htmk 文件放在 build 目录下，随意写一个简单的页面，比如：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <meta
      http-equiv="X-Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <title>Hello from Electron renderer!</title>
  </head>
  <body>
    <h1>Hello from Electron renderer!</h1>
    <p>👋</p>
  </body>
</html>
```

第二步：在 main.ts 中创建一个 BrowserWindow 实例 win，并且使用创建的 win.loadFile(或者；loadUrl)方法将上一步创建的 html 文件展示在 electron 窗口中。

```ts
import { app, BrowserWindow } from "electron";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile("build/index.html");
};

app.whenReady().then(() => {
  createWindow();
});
```

第三步：更改 yarn start 命令并且使用使用 yarn start 命令启动程序，之所以修改 yarn start 命令是因为现在使用的是 TS 进行开发，因此代码编写完成后不能直接运行，而是需要编译成 js 文件才可以运行，修改后的命令如下：

```json
 "scripts": {
    "start": "tsc -p electron && electron ."
  },
```

这样，使用启动命令后会弹出 electron 的窗口，并渲染出了 index.html 文件中的内容。

##### 使用 electron-reload 热更新 electron

##### 了解 electron-reload

在开发环境中我们肯定希望每当我们更改了代码，electron 会自己更新方便我们查看效果，但是实际上 electron 自己本身是不支持这个的，我么你需要用到`electron-reload`这个工具来实现这个需求，请查阅[github](https://github.com/yan-foto/electron-reload#readme)来查看该工具的详细使用，这里是我的配置，在创建 BrowserWindow 实例后即可注册该模块：

```ts
require("electron-reload")(__dirname, {
  electron: path.join(
    __dirname,
    "..",
    "..",
    "node_modules",
    ".bin",
    "electron" + (isWindows ? ".cmd" : "")
  ),
  forceHardReset: true,
  // enables hard reset for every file change and not only the main file，除了入口文件，其他文件的改动都会触发electron-reload
  hardResetMethod: "exit",
});
// 第二个参数的electron数字那个就是electron可执行文件的路径，在node_modules的bin目录下，根据不同的操作系统
// 可执行文件的名称可能会不一样
```

##### 监听编译 TS 文件

由于我们使用 TS 来搭建工程，但是 electron 运行的肯定是编译后的 JS 文件，他并不会监听 TS 文件的变化，这列就需要使用 TS 的监听编译功能来监听 TS 文件变化实施编译生成新的 JS 文件。因此现在整个工程的运行思路就是监听编译 TS 文件，然后通过编译 TS 文件产生的变化后的 JS 文件来触发 electron-reload 的监听来热更新 electron，因此这里需要更改一下启动脚本，更改如下：

```json
    "start": "concurrently \"tsc -p electron -w\" \"tsc -p electron && electron .\""
```

**注：**[concurrently](https://github.com/open-cli-tools/concurrently)是第三方工具，是用来同时执行多个命令的。安装方法：

```bash
yarn add concurrently --dev
```

#### 进程间通信

了解进程间通信之前需要先了解[预加载脚本`preload`](https://www.electronjs.org/zh/docs/latest/tutorial/process-model#preload-scripts) 这里不详细讲解，建议查看官方文档对于预加载脚本的作用和使用方法的说明，大概总结就是：我们可以在预加载脚本中使用 NodeJs 的 API 并且可以使用`contextBridge`将这些能力暴露给 window，但是为了安全性我们不应该把 nodejs 有关的 API 直接暴露给渲染进程中的 window 上，而是将其封装后通过 Api 的方式绑定某些实例方法到 window 上卖弄。
学习了预加载脚本后就可以继续学习进程间通信有关的知识点。[官方文档](https://www.electronjs.org/zh/docs/latest/tutorial/ipc)介绍了多种通信方式。

##### 模式一：渲染器到主进程通信

简单地说就是在渲染进程中可以使用`ipcRenderer`模块的`send`方法发送消息到主进程中，在主进程中则需要通过`ipcMain`模块的`on`方法来注册消息事件的处理逻辑。具体使用见文档，这里不再赘述（因为并不推荐使用该方法）。

##### 模式二：通过 ipcMain.handle 和 ipcRenderer.invoke 来处理进程间通信（双向通信）

我们可以在渲染进程中使用`ipcRenderer.invoke`方法来发送消息给到主进程，然后再主进程中使用`ipcMain.hanle`方法来注册实例该消息的逻辑，现在**重点来了：与第一种方法相比，我看们可以在该事件处理回调函数中返回需要返回的数据并且作为 Promise 到原始 API 的响应值。**，这句话可能听着不太好理解，这里我们通过一个简单的例子来说经
我这里使用的是通过预加载脚本（preload.js）来暴露某些能力给 window，我们这里只做简单的描述。
所谓进程间通信是指主进程和渲染进程之间的通信，举个例子，渲染进程需要调用 NodeJs 的 api，那么渲染那进程就需要告诉主进程自己的诉求，然后由主进程去完成操作。
举例：我可以在 preload.ts 中添加一个读取目录内容的方法到 window.elecApi 属性身上：

```ts
// electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("elecApi", {
  readDir() {
    return ipcRenderer.invoke("read_dir");
  },
});
```

然后再主进程中注册处理该事件的逻辑（注册应该发生在 BrowserWindow 实例化后的实例身上）

```ts
// electron/main.ts
ipcMain.handle("read_dir", async () => {
  const data = await readFile(resolve(__dirname, "../index.html"));
  return data;
});
```

主进程中事件处理回调返回的值（这里是 data.toString()）会作为 Promise 返回，简单地说，我们在 window 调用`elecApi.readDir`方法，该方法会返回 Promise，Promise 返回值为 data.toString()，因此我们在 window 中调用`elecApi.readDir`方法后返回的 Promise 的值既可以直接用了。比如：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>This is electron app page!</h1>
    <button id="read_dir">读取目录</button>
    <ol></ol>
    <script>
      const readDirBtn = document
        .getElementById("read_dir")
        .addEventListener("click", () => {
          window.elecApi.readDir().then((res) => {
            console.log(res);
            document.querySelector("ol").innerHTML = res
              .map((v) => `<li>${v}</li>`)
              .join("");
          });
        });
    </script>
  </body>
</html>
```

**这样，第二中在主进程和渲染进程中通信的方法就演示出来了。相比于第一种方法：**

- 我们不需要设置第二个 ipcRenderer.on 监听器来处理渲染器进程中的响应。 使用 invoke，我们将获得作为 Promise 返回到原始 API 调用的响应值。
- 我们可以显而易见的方法可以将 asynchronous-reply 消息与原始的 asynchronous-message 消息配对。 如果我们通过这些通道非常频繁地来回传递消息，也不再需要添加其他应用代码来单独跟踪每个调用和响应。

##### 模式三：主进程到渲染进程

其实并非所有操作和消息都是从渲染进程发起到主进程的，某些时候我们也会有从主进程发送消息到渲染进程，这时候我们可以使用 BrowserWindow 的实例的 WebContents 的 send 方法来发送消息到渲染进程，然后再通过预加载脚本暴露 ipcRenderer.on 方法将注册事件的能力暴露给 window，然后在 window 上调用该方法并传入对应的事件回调来注册处理事件的方法。然后该回调的第一个参数为`Electron.IpcRendererEvent`这个数据类型的 event，因此可以调用 event.sender.send 犯法将需要返回的数据传递给主进程，当然最后还需要在主进程中注册事件方法来处理渲染进程发过来的数据，例子如下：
预加载脚本：

```ts
import { contextBridge, ipcRenderer } from "electron";
import { Channels } from "../config/channels";

contextBridge.exposeInMainWorld("elecApi", {
  // readDirs() {
  //   return ipcRenderer.invoke("read_dir");
  // },
  onReadLocalStorage(
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) {
    ipcRenderer.on("read_local_storage", callback);
  },
});
```

渲染进程：

```ts
window.elecApi?.onReadLocalStorage((event: Electron.IpcRendererEvent) => {
  event.sender.send("read_local_storage", JSON.stringify(window.localStorage));
});
```

主进程：

- 发送消息：

```ts
win.webContents.send("read_local_storage");
```

- 事件处理

```ts
ipcMain.on("read_local_storage", (event, value) => {
  console.log("监听消息", value);
});
```

至此：electron 的三总进程间听信的方式大概就讲完了。

### 将 React 工程和 Electron 整合到一个工程

#### 思路

使用 npm（yarn）创建 Electron 工程，然后在根目录中新建 React 工程，因为 Electron 运行时有两个进程，即 main 进程（主进程）和 render 进程（渲染进程），因此我在 electron 工程根目录创建 renderer 目录并在该目录下使用 create-react-app 创建 react 应用。（**注意：后面会讲到为什么不把这两个工程放在同一根目录，结论就是为了优化打包生成的安装包的大小。**）目录结构如下

```
-electron
| -main.ts
| -preload.ts
| -tsconfig.json
-renderer
| -node_modules
| -src
| | |-components
| | |-router
| | |-index.tsx
| | |-app.tsx
| -tsconfig.json
| -package.json
-node_modules
-package.json

```

**注意：**

- 根目录的 node_modules 和 package.json 只用来管理主进程的项目依赖包，render 进程的包管理由 renderer 目录下的 node_modules 以及 package.json 管理。
- electron 目录下是 electron 有关的代码，由于是使用 ts 开发，所以需要配置 tsconfig.json 来配置编译后的代码的输出目录等，内容如下

  ```json
  {
    "compilerOptions": {
      "moduleResolution": "node",
      "target": "es5",
      "module": "commonjs",
      "sourceMap": true,
      "strict": true,
      "outDir": "../build",
      "rootDir": "../",
      "noEmitOnError": true,
      "typeRoots": ["node_modules/@types"]
    }
  }
  ```

从该配置中可以看出我们最终会将 electron 目录下的 ts 文件编译并输出到于 electron 目录上级同级的 build 目录下。（后面我们还会把 react 打包后的文件同样放在该目录并最终配置 electron-builder 将 build 目录下的文件打包到安装包）。
然后配置 electron 的入口文件，如果是开发环境，使用 win.loadUrl 方法来显示网页，如果是生产环境，使用 win.loadFile 方法展示打包后的网页。**这里注意：**

1. 通过 create-react-app 创建的 react 工程默认的 js 路径是绝对路径，因此在浏览器（或者是 electron）直接打开本地的打包后的文件是没法正常运行的，会提示找不到 js 文件 css 文件等路径信息的错误，这时候我们需要在 renderer 目录下的 package.json 中配置"homepage":"."来解决这个问题，改配置项配置后，生成的静态文件中的本地文件地址前会加上"."，因此这些本地文件的链接就直接变成了相对路径，我们直接打开 index.html 文件也就可以正常使用了。
2. 如果我们的项目有后台服务器，且后台服务器不会做跨域的处理，name 我们就需要在主进程 main.ts 中创建 BrowserWindow 实例的时候在配置项 webPreference 中添加属性 webSecurity 并且属性值为 false，这样 electron 就不会产生跨域的问题（相当于 electron 内部的 chrome 直接弃用了基于同源策略的防止跨域访问的安全选项，因此请酌情谨慎使用此选项）

```ts
{
    width: 1366,
    height: 768,
    minHeight: 400,
    minWidth: 960,
    webPreferences: {
      // contextIsolation: false,
      webSecurity: false,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  }
```

最后，我们需要修改 renderer 工程和 electron 工程的启动脚本：

- renderer 工程启动脚本

```json
 "scripts": {
    "start": "cross-env PORT=3003 react-scripts start",
    "build": "cross-env BUILD_PATH=../build cross-env GENERATE_SOURCEMAP=false react-scripts build",
    "test": "react-scripts test"
  },
```

我们需要在 renderer 工程中通过修改环境变量 BUILD_PATH 将打包文件输出到../build 目录下，以及设置 GENERATE_SOURCEMAP=false 来阻止 map 文件的生成，以此来优化打包的大小。

- electron 工程启动脚本

```json
 "install-renderer": "cd renderer && yarn install",
    "install-all": "yarn install && yarn install-renderer",
    "start": "cd renderer && yarn start",
    "build": "cd renderer && yarn build",
    "test": "react-scripts test",
    "postinstall": "electron-builder install-app-deps",
    "electron:dev": "concurrently \"yarn start\" \"wait-on http://127.0.0.1:3003 && tsc -p electron -w\" \"wait-on http://127.0.0.1:3003 && tsc -p electron && electron .\"",
    "electron:build": "yarn build && tsc -p electron && electron-builder",
---
```

### 其他

#### 打包优化

electron-builder 打包会默认打包 electron 支持的所有语言文件，然而这些文件可能会大大增加我们的安装包的大小，并且我们只要不是对所有的语言都支持，这些文件是无效的，因此我们可以通过在 electron-builder 中配置`electronLanguages`选项来决定我们需要打包的语言文件有哪些：

```json
///
  "build":{
    "electronLanguages":["zh-CN", "en-US"]
  }
///
```

注意：该选项是在 2023-04-05 的时候才由 electron-builder 开发者将其迁移至一级配置中，对应的 electron-builder 版本为`24.2.0`，因此如果需要配置改选项，需要将 electron-builder 升级至该版本或者更高。

#### Linux 文件读取权限问题

Linux 相对于 Windowa 而言，权限控制更加严格，比如我的 electron 程序打包成.deb 安装包后直接使用`dpkg`安装在`/opt`目录下，这时候程序内部如果有配置文件在安装目录下，读取配置文件是会有权限问题的，比如：`Error: EACCES: permission denied, open '/opt/xxxxx/extra_files/config.json'`，这就是当前用户没有 opt 目录下的文件的‘写’权限，当然我们可以通过给当前 linux 用户赋予写某个目录下的文件的权限，但是你显然不能确保其他用户对 linux 系统的使用完全没有障碍。因此打包 linux 系统安装包的时候我们不能把配置文件存储在安装目录，一般地我们可以把配置文件放在`~/.config/xxxx`目录下，linux 系统的当前用户对该目录下的文件是有读写权限的。

**注意：**这里的`~/.`值得是系统用户的主目录，我们可以通过 NodeJs 的 os.homedir()这个方法来获取到。获取之后就只需要在这里面创建自己的配置文件就好。
这里记录一些封装的 NodeJs 的方法

- 递归创建目录

```ts
// 循环遍历生成嵌套的目录
export function mkdirs(dir: string, callback: (...rest: any) => any): void {
  // return new Promise((resolve, reject) => {
  stat(dir)
    .then(() => {
      callback();
    })
    .catch(() => {
      mkdirs(dirname(dir), function () {
        fs.mkdir(dir, callback);
        // console.log("在" + path.dirname(dirname) + "目录创建好" + dirname + "目录");
      });
    });
  // });
}
```
