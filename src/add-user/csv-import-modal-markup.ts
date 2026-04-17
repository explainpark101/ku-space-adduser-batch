/** 모달 내부 마크업 (content.css의 BEM 클래스와 id만 사용) */
export const CSV_IMPORT_MODAL_INNER_HTML = `
<div class="ku-space-csv-modal__inner">
  <div class="ku-space-csv-modal__header">
    <h2 class="ku-space-csv-modal__title">이용자 일괄 등록</h2>
    <button type="button" class="ku-space-csv-modal__close" id="kuSpaceCloseUserModal" aria-label="닫기">닫기</button>
  </div>
  <article>
    <p>csv 파일을 통해 이용자를 일괄등록합니다. 예시 csv 파일을 다운받아, 이용자 목록을 작성하고, 여기에 업로드 한 뒤, 업로드 버튼을 눌러주세요.</p>
  </article>
  <div class="ku-space-csv-modal__sample-row">
    <div class="ku-space-csv-modal__sample-actions" role="group" aria-label="예시 CSV 다운로드">
      <span>예시 csv 파일:</span>
      <button type="button" class="ku-space-csv-modal__sample ku-space-csv-modal__sample--compact" id="kuSpaceDownloadSampleCsvMac" title="UTF-8(BOM), Mac용 파일.csv">Mac용 파일</button>
      <button type="button" class="ku-space-csv-modal__sample ku-space-csv-modal__sample--compact" id="kuSpaceDownloadSampleCsvWin" title="EUC-KR, Windows용 파일.csv">Windows용 파일</button>
    </div>
  </div>
  <div class="ku-space-csv-modal__dropzone" id="kuSpaceCsvDropzone">
    <input type="file" id="kuSpaceUserFile" accept=".csv" />
    <p class="ku-space-csv-modal__hint">이용자 목록이 담긴 CSV 파일 선택 <br/> 또는 <br/> 드래그 앤 드롭으로 업로드</p>
  </div>
  <p class="ku-space-csv-modal__require-csv" id="kuSpaceRequireCsvHint">먼저 CSV 파일을 업로드해 주세요.</p>
  <section class="ku-space-csv-modal__preview" id="kuSpacePreviewSection" hidden>
    <div class="ku-space-csv-modal__preview-scroll">
      <table class="ku-space-csv-modal__table" aria-label="등록 예정 사용자 미리보기">
        <thead>
          <tr><th scope="col">이름</th><th scope="col">학번</th></tr>
        </thead>
        <tbody id="kuSpacePreviewTbody"></tbody>
      </table>
    </div>
    <p class="ku-space-csv-modal__preview-meta" id="kuSpacePreviewMeta"></p>
    <div class="ku-space-csv-modal__preview-actions">
      <button type="button" class="ku-space-csv-modal__upload" id="kuSpaceConfirmRegister" disabled>이대로 등록</button>
    </div>
  </section>
</div>
`;
