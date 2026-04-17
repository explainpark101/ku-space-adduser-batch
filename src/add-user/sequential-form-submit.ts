import type { User } from "./types";

export type AddUserFormFields = {
    nameInput: HTMLInputElement;
    hakbunInput: HTMLInputElement;
    confirmButton: HTMLButtonElement;
};

export const delay = (ms: number, signal: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
        }
        const t = window.setTimeout(resolve, ms);
        const onAbort = () => {
            window.clearTimeout(t);
            reject(new DOMException("Aborted", "AbortError"));
        };
        signal.addEventListener("abort", onAbort, { once: true });
    });

export const uploadUsersSequentially = async (
    list: User[],
    signal: AbortSignal,
    fields: AddUserFormFields,
): Promise<void> => {
    const { nameInput, hakbunInput, confirmButton } = fields;
    for (let i = 0; i < list.length; i++) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        const user = list[i]!;
        nameInput.value = user.name;
        hakbunInput.value = user.hakbun;
        confirmButton.click();
        if (i < list.length - 1) {
            await delay(120, signal);
        }
    }
    nameInput.value = "";
    hakbunInput.value = "";
};
