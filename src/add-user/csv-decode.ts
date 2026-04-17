/** CSV 첫 데이터 행 전에 오는 헤더로 기대하는 문자열 (UTF-8/EUC-KR 공통 의미) */
export const EXPECTED_CSV_HEADER = "이름,학번";

const stripBom = (text: string): string => {
    if (text.length > 0 && text.charCodeAt(0) === 0xfeff) return text.slice(1);
    return text;
};

const normalizeNewlines = (text: string): string => text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const getFirstNonEmptyLine = (text: string): string => {
    for (const line of normalizeNewlines(text).split("\n")) {
        const t = line.trim();
        if (t.length > 0) return t;
    }
    return "";
};

const decodeEucKr = (buffer: ArrayBuffer): string => {
    try {
        return new TextDecoder("euc-kr").decode(buffer);
    } catch {
        return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    }
};

/**
 * 파일 바이너리를 문자열로 디코딩합니다.
 * UTF-8로 읽었을 때 첫 비어 있지 않은 줄이 `이름,학번`이 아니면 EUC-KR(CP949)로 다시 디코딩합니다.
 */
export const decodeCsvFileBuffer = (buffer: ArrayBuffer): string => {
    let asUtf8: string;
    try {
        asUtf8 = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
        return normalizeNewlines(decodeEucKr(buffer));
    }
    const normalizedUtf8 = normalizeNewlines(stripBom(asUtf8));
    const first = getFirstNonEmptyLine(normalizedUtf8);
    if (first === EXPECTED_CSV_HEADER) return normalizedUtf8;
    return normalizeNewlines(decodeEucKr(buffer));
};
