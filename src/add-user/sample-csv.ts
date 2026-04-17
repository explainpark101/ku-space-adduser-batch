/** 예시 CSV 본문 (UTF-8/EUC-KR 논리적 내용 동일, 줄바꿈만 LF) */
export const SAMPLE_CSV = ["이름,학번", "홍길동,2023123456"].join("\n");

/** `SAMPLE_CSV`를 EUC-KR로 인코딩한 바이트 (Windows용 다운로드) */
const SAMPLE_CSV_EUCKR_BASE64 =
    "wMy4pyzH0Ln4Csirsea1vywyMDIzMTIzNDU2CrHov7XI8SwyMDIzOTg3NjU0Cg==";

export const SAMPLE_FILENAME_MAC = "Mac용 파일.csv";
export const SAMPLE_FILENAME_WINDOWS = "Windows용 파일.csv";

const base64ToUint8Array = (b64: string): Uint8Array => {
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        out[i] = binary.charCodeAt(i);
    }
    return out;
};

const triggerDownload = (filename: string, blob: Blob): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

/** UTF-8(BOM) — 엑셀 Mac 등 */
export const downloadSampleCsvMac = (): void => {
    const blob = new Blob([`\uFEFF${SAMPLE_CSV}\n`], { type: "text/csv;charset=utf-8" });
    triggerDownload(SAMPLE_FILENAME_MAC, blob);
};

/** EUC-KR — 엑셀 Windows 등 */
export const downloadSampleCsvWindows = (): void => {
    const bytes = base64ToUint8Array(SAMPLE_CSV_EUCKR_BASE64);
    const blob = new Blob([new Uint8Array(bytes)], { type: "text/csv;charset=euc-kr" });
    triggerDownload(SAMPLE_FILENAME_WINDOWS, blob);
};
