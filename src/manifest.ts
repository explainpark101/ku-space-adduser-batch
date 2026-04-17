// manifest v3
// this file will be automatically built into `manifest.json`
import { flatIterdir } from "../scripts/utils/manifest";
import path from "node:path";

export const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "고려대학교 공간예약 사용자 일괄 등록",
  version: "1.0.0",
  description: "csv 파일을 통해 고려대학교 공간예약 시스템의 사용자 목록을 간편하게 등록해주는 버튼을 추가합니다.",
  icons: {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png",
  },
  permissions: [],
  host_permissions: ["https://spacek.korea.ac.kr/user/callResvSpaceUser.do", "https://spaceks.korea.ac.kr/user/callResvSpaceUser.do"],
  content_scripts: [
    {
      matches: ["https://spacek.korea.ac.kr/user/callResvSpaceUser.do", "https://spaceks.korea.ac.kr/user/callResvSpaceUser.do"],
      js: ["content.ts"],
      css: ["content.css"],
      run_at: "document_idle",
    },
  ]
};
