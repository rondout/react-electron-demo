import { app } from "electron";
import { stat, writeFile } from "fs/promises";
import { homedir } from "os";
import { dirname, resolve } from "path";
import * as fs from "fs";

export enum PlatformTypes {
  LINUX = "linux",
  WINDOWS = "win32",
  MAC = "darwin",
}

export const defaultConfig = {
  version: "1.0.0",
  base_url: "http://192.168.16.197:8080",
};
// 循环遍历生成嵌套的目录
export function mkdirs(dir: string, callback: () => void): void {
  stat(dir)
    .then(() => {
      callback();
    })
    .catch(() => {
      mkdirs(dirname(dir), function () {
        fs.mkdir(dir, callback);
      });
    });
  // });
}
// 通过相对路径生成extra_files的路径
export function resolveExtraPath(path: string) {
  if (app.isPackaged) {
    return resolve(__dirname, "../../../../extra_files", path);
  }
  return resolve(__dirname, "../../extra_files", path);
}

// 通过相对路径生成config.json的路径
export function resolveConfigPath() {
  if (app.isPackaged) {
    return resolve(homedir(), "./.config/vantron-js/config.json");
  }
  return resolve(homedir(), "./.config/vantron-js/config.json");
  // return resolve(__dirname, "../../extra_files", path);
}

export function checkConfigPath() {
  return new Promise<void>((resolve, reject) => {
    stat(resolveConfigPath())
      .then(() => {
        // 如果目录存在
        resolve();
      })
      .catch(() => {
        // 如果配置文件路径不存在就创建配置文件
        mkdirs(dirname(resolveConfigPath()), () => {
          writeFile(resolveConfigPath(), JSON.stringify(defaultConfig))
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
          // writeFile()
        });
      });
  });
}
