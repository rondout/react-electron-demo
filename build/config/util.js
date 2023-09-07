"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConfigPath = exports.resolveConfigPath = exports.resolveExtraPath = exports.mkdirs = exports.defaultConfig = exports.PlatformTypes = void 0;
var electron_1 = require("electron");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var fs = require("fs");
var PlatformTypes;
(function (PlatformTypes) {
    PlatformTypes["LINUX"] = "linux";
    PlatformTypes["WINDOWS"] = "win32";
    PlatformTypes["MAC"] = "darwin";
})(PlatformTypes = exports.PlatformTypes || (exports.PlatformTypes = {}));
exports.defaultConfig = {
    version: "1.0.0",
    base_url: "http://192.168.16.197:8080",
};
// 循环遍历生成嵌套的目录
function mkdirs(dir, callback) {
    (0, promises_1.stat)(dir)
        .then(function () {
        callback();
    })
        .catch(function () {
        mkdirs((0, path_1.dirname)(dir), function () {
            fs.mkdir(dir, callback);
        });
    });
    // });
}
exports.mkdirs = mkdirs;
// 通过相对路径生成extra_files的路径
function resolveExtraPath(path) {
    if (electron_1.app.isPackaged) {
        return (0, path_1.resolve)(__dirname, "../../../../extra_files", path);
    }
    return (0, path_1.resolve)(__dirname, "../../extra_files", path);
}
exports.resolveExtraPath = resolveExtraPath;
// 通过相对路径生成config.json的路径
function resolveConfigPath() {
    if (electron_1.app.isPackaged) {
        return (0, path_1.resolve)((0, os_1.homedir)(), "./.config/vantron-js/config.json");
    }
    return (0, path_1.resolve)((0, os_1.homedir)(), "./.config/vantron-js/config.json");
    // return resolve(__dirname, "../../extra_files", path);
}
exports.resolveConfigPath = resolveConfigPath;
function checkConfigPath() {
    return new Promise(function (resolve, reject) {
        (0, promises_1.stat)(resolveConfigPath())
            .then(function () {
            // 如果目录存在
            resolve();
        })
            .catch(function () {
            // 如果配置文件路径不存在就创建配置文件
            mkdirs((0, path_1.dirname)(resolveConfigPath()), function () {
                (0, promises_1.writeFile)(resolveConfigPath(), JSON.stringify(exports.defaultConfig))
                    .then(function () {
                    resolve();
                })
                    .catch(function (err) {
                    reject(err);
                });
                // writeFile()
            });
        });
    });
}
exports.checkConfigPath = checkConfigPath;
//# sourceMappingURL=util.js.map