import type { User } from "./types";

export const processCsvToUsers = (csv: string): User[] => {
    const parsed: User[] = [];
    const lines = csv.split(/\r?\n/);
    for (const line of lines) {
        const [name, hakbun] = line.split(",").map((el) => el.trim());
        if (!/\d{10}/.test(hakbun ?? "")) continue;
        if (name && hakbun) parsed.push({ name, hakbun });
    }
    return parsed;
};

export const dedupeUsersByHakbun = (list: User[]): User[] => {
    const seen = new Set<string>();
    const out: User[] = [];
    for (const u of list) {
        if (seen.has(u.hakbun)) continue;
        seen.add(u.hakbun);
        out.push(u);
    }
    return out;
};
