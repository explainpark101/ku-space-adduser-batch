import { decodeCsvFileBuffer } from "./csv-decode";
import { dedupeUsersByHakbun, processCsvToUsers } from "./csv-parse";
import { CSV_IMPORT_MODAL_INNER_HTML } from "./csv-import-modal-markup";
import { downloadSampleCsvMac, downloadSampleCsvWindows } from "./sample-csv";
import { uploadUsersSequentially } from "./sequential-form-submit";
import type { User } from "./types";

const resolveAddUserForm = () => ({
    nameInput: document.querySelector<HTMLInputElement>("#userNm"),
    hakbunInput: document.querySelector<HTMLInputElement>("#userNo"),
    confirmButton: document.querySelector<HTMLButtonElement>("#addUserBtn"),
});

const renderZeroRegistrationPreview = (tbody: HTMLTableSectionElement) => {
    tbody.replaceChildren();
    const trSummary = document.createElement("tr");
    const tdSummary = document.createElement("td");
    tdSummary.colSpan = 2;
    tdSummary.className = "ku-space-csv-modal__table-zero-summary";
    tdSummary.textContent = "등록될 예정인 이용자는 0명입니다.";
    trSummary.appendChild(tdSummary);
    tbody.appendChild(trSummary);

    const trWarn = document.createElement("tr");
    const tdWarn = document.createElement("td");
    tdWarn.colSpan = 2;
    tdWarn.className = "ku-space-csv-modal__table-warning";
    tdWarn.textContent = "다른 CSV 파일을 선택해 주세요.";
    trWarn.appendChild(tdWarn);
    tbody.appendChild(trWarn);
};

const renderPreviewRows = (tbody: HTMLTableSectionElement, users: User[], emptyMessage: string) => {
    tbody.replaceChildren();
    if (users.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 2;
        td.className = "ku-space-csv-modal__table-empty";
        td.textContent = emptyMessage;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    for (const u of users) {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        tdName.textContent = u.name;
        const tdHak = document.createElement("td");
        tdHak.textContent = u.hakbun;
        tr.appendChild(tdName);
        tr.appendChild(tdHak);
        tbody.appendChild(tr);
    }
};

export const mountCsvImportModal = (): void => {
    const userInputModal = document.createElement("dialog");
    userInputModal.className = "ku-space-csv-modal";
    userInputModal.innerHTML = CSV_IMPORT_MODAL_INNER_HTML;
    document.body.appendChild(userInputModal);

    const fileInput = userInputModal.querySelector<HTMLInputElement>("#kuSpaceUserFile")!;
    const sampleDownloadMacButton = userInputModal.querySelector<HTMLButtonElement>("#kuSpaceDownloadSampleCsvMac")!;
    const sampleDownloadWinButton = userInputModal.querySelector<HTMLButtonElement>("#kuSpaceDownloadSampleCsvWin")!;
    const closeModalButton = userInputModal.querySelector<HTMLButtonElement>("#kuSpaceCloseUserModal")!;
    const dropzone = userInputModal.querySelector<HTMLDivElement>("#kuSpaceCsvDropzone")!;
    const requireHint = userInputModal.querySelector<HTMLParagraphElement>("#kuSpaceRequireCsvHint")!;
    const previewSection = userInputModal.querySelector<HTMLElement>("#kuSpacePreviewSection")!;
    const previewTbody = userInputModal.querySelector<HTMLTableSectionElement>("#kuSpacePreviewTbody")!;
    const previewMeta = userInputModal.querySelector<HTMLParagraphElement>("#kuSpacePreviewMeta")!;
    const confirmRegisterButton = userInputModal.querySelector<HTMLButtonElement>("#kuSpaceConfirmRegister")!;

    let pendingUsers: User[] = [];
    let uploadGeneration = 0;
    let uploadAbortController: AbortController | null = null;

    const setConfirmRegisterLoading = (loading: boolean) => {
        confirmRegisterButton.disabled = loading || pendingUsers.length === 0;
        confirmRegisterButton.textContent = loading ? "처리 중…" : "이대로 등록";
    };

    const showRequireHint = (visible: boolean) => {
        requireHint.hidden = !visible;
    };

    /** 파일 미선택·미리보기 없음·안내 문구 표시 등 모달 동적 상태를 완전히 초기화 */
    const resetModalToInitialState = () => {
        uploadAbortController?.abort();
        uploadAbortController = null;

        fileInput.value = "";
        try {
            fileInput.files = new DataTransfer().files;
        } catch {
            /* 일부 환경에서만 실패 가능 */
        }

        pendingUsers = [];
        previewSection.hidden = true;
        previewMeta.textContent = "";
        previewTbody.replaceChildren();

        confirmRegisterButton.disabled = true;
        confirmRegisterButton.textContent = "이대로 등록";

        dropzone.classList.remove("ku-space-csv-modal__dropzone--active");
        showRequireHint(true);
    };

    const applyPreview = (users: User[], rawCount: number, deduped: boolean) => {
        pendingUsers = users;
        previewSection.hidden = false;
        showRequireHint(false);
        if (users.length === 0) {
            renderZeroRegistrationPreview(previewTbody);
            previewMeta.textContent = "";
            confirmRegisterButton.disabled = true;
        } else {
            renderPreviewRows(previewTbody, users, "");
            const dupNote = deduped ? " (동일 학번은 한 번만 등록됩니다)" : "";
            previewMeta.textContent = `총 ${users.length}명${dupNote} · 파일에서 읽은 유효 행 ${rawCount}건`;
            confirmRegisterButton.disabled = false;
        }
    };

    const loadCsvFromInput = async () => {
        const file = fileInput.files?.[0];
        if (!file) {
            resetModalToInitialState();
            return;
        }
        const buffer = await file.arrayBuffer();
        const csv = decodeCsvFileBuffer(buffer);
        const raw = processCsvToUsers(csv);
        const unique = dedupeUsersByHakbun(raw);
        const deduped = raw.length !== unique.length;
        applyPreview(unique, raw.length, deduped);
    };

    const openUserCsvModal = () => {
        if (!userInputModal.open) userInputModal.showModal();
    };

    const openButtonMount = document.querySelector("#table01Container > div.subtit-wrap");
    if (openButtonMount) {
        const openBtn = document.createElement("button");
        openBtn.type = "button";
        openBtn.className = "ku-space-csv-modal__open";
        openBtn.id = "kuSpaceOpenUserCsvModal";
        openBtn.textContent = "이용자 일괄 등록";
        openBtn.addEventListener("click", openUserCsvModal);
        openButtonMount.appendChild(openBtn);
    }

    sampleDownloadMacButton.addEventListener("click", () => {
        downloadSampleCsvMac();
    });
    sampleDownloadWinButton.addEventListener("click", () => {
        downloadSampleCsvWindows();
    });

    closeModalButton.addEventListener("click", () => {
        uploadAbortController?.abort();
        userInputModal.close();
    });

    userInputModal.addEventListener("cancel", (e) => {
        e.preventDefault();
        uploadAbortController?.abort();
        userInputModal.close();
    });

    fileInput.addEventListener("change", () => {
        void loadCsvFromInput();
    });

    confirmRegisterButton.addEventListener("click", async () => {
        if (pendingUsers.length === 0) return;

        uploadAbortController?.abort();
        const gen = ++uploadGeneration;
        uploadAbortController = new AbortController();
        const signal = uploadAbortController.signal;

        setConfirmRegisterLoading(true);

        try {
            if (signal.aborted || gen !== uploadGeneration) return;

            const form = resolveAddUserForm();
            const { nameInput, hakbunInput, confirmButton } = form;
            if (!nameInput || !hakbunInput || !confirmButton) {
                throw new Error("nameInput, hakbunInput, confirmButton을 찾을 수 없습니다.");
            }
            await uploadUsersSequentially(pendingUsers, signal, { nameInput, hakbunInput, confirmButton });
            if (signal.aborted || gen !== uploadGeneration) return;
            resetModalToInitialState();
            userInputModal.close();
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return;
            console.error("[ku-space-adduser]", err);
        } finally {
            if (gen === uploadGeneration) {
                setConfirmRegisterLoading(false);
                uploadAbortController = null;
            }
        }
    });

    ["dragenter", "dragover"].forEach((type) => {
        dropzone.addEventListener(type, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("ku-space-csv-modal__dropzone--active");
        });
    });

    dropzone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const related = e.relatedTarget as Node | null;
        if (related && dropzone.contains(related)) return;
        dropzone.classList.remove("ku-space-csv-modal__dropzone--active");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("ku-space-csv-modal__dropzone--active");
        const dt = (e as DragEvent).dataTransfer;
        const f = dt?.files?.[0];
        if (!f) return;
        const nameOk = f.name.toLowerCase().endsWith(".csv");
        const typeOk = f.type === "text/csv" || f.type === "application/vnd.ms-excel" || f.type === "";
        if (!nameOk && !typeOk) return;
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(f);
        fileInput.files = dataTransfer.files;
        void loadCsvFromInput();
    });

    resetModalToInitialState();
};
