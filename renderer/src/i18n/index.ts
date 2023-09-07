import i18next, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import { Languages } from "../models/base.model";
import en_US from "./en_US";
import zh_CN from "./zh_CN";

export const languageMap = new Map<Languages, string>([
  [Languages.zh, "中文"],
  [Languages.en, "English"],
]);

export interface LocaleFile {
  [propName: string]: string | LocaleFile;
}

i18next.use(initReactI18next).init({
  // 翻译文件来源
  resources: {
    [Languages.zh]: {
      translation: zh_CN,
    },
    [Languages.en]: {
      translation: en_US,
    },
  },
  interpolation: { escapeValue: false },
  lng: window.localStorage.getItem("language") || Languages.zh, // if you're using a language detector, do not define the lng option
  fallbackLng: Languages.en, // 如果传入的语言没有找到 重定向到英语去找对应的翻译
} as InitOptions);
