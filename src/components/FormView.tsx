"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTIONS } from "@/components/reqData";
import { getHighlightedText } from "@/lib/utils";

interface FormViewProps {
  type: "creative" | "product";
  formData: any;
  visibleStep: number;
  isLoading: boolean;
  isComplete: boolean;
  progressPercentage: number;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  updateData: (key: string, value: any) => void;
  handleBlur: (value: any, stepId: string, isOptional?: boolean) => void;
  handleStepEndTab: (e: React.KeyboardEvent, stepId: string, currentInputId: string, isOptional?: boolean) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  handleTextareaResize: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: () => void;
  setRef: (id: string) => (el: any) => void;
  setShowPrivacyModal: (val: boolean) => void;
  onBack: () => void;
}

export default function FormView(props: FormViewProps) {
  const { 
    type, formData, visibleStep, isLoading, isComplete, progressPercentage, 
    bottomRef, updateData, handleBlur, handleStepEndTab, handleFileUpload, 
    handleTextareaResize, handleSubmit, setRef, setShowPrivacyModal, onBack 
  } = props;

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const [fileStatus, setFileStatus] = useState<'idle' | 'uploading' | 'done'>('idle');

  // ✨ 파일 업로드 처리 및 다음 스텝 이동 제어 함수
  const validateAndUpload = async (e: React.ChangeEvent<HTMLInputElement>, stepId: string) => {
    const file = e.target.files?.[0];
    
    // ✨ 파인더 창에서 '취소'를 눌렀을 때: 바로 6번 질문지가 나오도록 처리
    if (!file) {
      handleBlur(formData[stepId] || 'canceled', stepId, true);
      return;
    }

    const allowedExts = ['png', 'jpg', 'jpeg', 'pdf', 'xlsx', 'doc', 'docx', 'hwp', 'zip'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedExts.includes(fileExt || '')) {
      triggerToast("허용되지 않는 파일입니다. (png, jpg, pdf, xlsx, doc, hwp, zip 가능)");
      e.target.value = ''; 
      return;
    }

    if (file.size > maxSize) {
      triggerToast("파일 용량은 10MB를 초과할 수 없습니다.");
      e.target.value = '';
      return;
    }

    setFileStatus('uploading');
    await new Promise((resolve) => setTimeout(resolve, 800)); // 자연스러운 로딩 연출
    
    try {
      const uploadResult = handleFileUpload(e);
      if (uploadResult instanceof Promise) {
        await uploadResult;
      }
      setFileStatus('done');
      
      // ✨ 업로드가 완전히 끝난 직후 6번 질문지로 부드럽게 넘어감!
      handleBlur(file.name, stepId, true);
    } catch (err) {
      setFileStatus('idle');
      triggerToast("업로드 중 오류가 발생했습니다.");
    }
  };

  const smoothTransition = { type: "spring" as const, stiffness: 40, damping: 18 };
  const currentTheme = QUESTIONS[type as "creative" | "product"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-16 w-full max-w-3xl px-8 relative text-left text-black">
      
      {/* 토스트 위치 조정 완료 */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full text-sm font-medium z-[9999] transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {toastMsg}
      </div>

      <motion.div 
        className={`h-2 fixed top-0 left-0 z-50 ${type === 'creative' ? 'bg-[#FB4C4C]' : 'bg-[#3A86FF]'}`}
        initial={{ width: 0 }} 
        animate={{ width: `${progressPercentage}%` }} 
        transition={{ duration: 0.3, ease: "easeOut" }} 
      />

      <div className="space-y-24">
        {currentTheme.items.map((q: any, index: number) => (
          <AnimatePresence key={q.id}>
            {index <= visibleStep && (
              <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={smoothTransition} className="flex flex-col">
                <div className="flex gap-4 mb-8">
                  <span className={`font-bold text-xl ${currentTheme.color}`}>{index + 1}</span>
                  <h2 className="text-3xl font-bold whitespace-pre-line leading-snug">
                    {getHighlightedText(q.title, currentTheme.color)}
                  </h2>
                </div>

                {q.options && (
                  <div>
                    <div className="flex flex-wrap gap-3">
                      {q.options.map((opt: string) => (
                        <button key={opt} onClick={() => { updateData(q.id, opt); if (opt !== '기타') setTimeout(() => handleBlur(opt, q.id, true), 100); }} 
                          className={`px-5 py-2 rounded-full border border-gray-300 transition-colors cursor-pointer ${formData[q.id] === opt ? currentTheme.bgActive : currentTheme.bgHover}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    {q.subRender && <p className="text-sm mt-4 text-gray-500">{q.subRender(currentTheme.color)}</p>}
                    <AnimatePresence>
                      {formData[q.id] === '기타' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={smoothTransition} className="overflow-hidden mt-4">
                          <input type="text" placeholder="내용을 입력해 주세요." className="w-full border-b border-gray-300 py-2 outline-none focus:border-black transition-colors" ref={setRef(`${q.id}_etc`)} onChange={(e) => updateData(`${q.id}_etc`, e.target.value)} onBlur={(e) => handleBlur(e.target.value, q.id)} onKeyDown={(e) => handleStepEndTab(e, q.id, `${q.id}_etc`)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {!q.options && !q.isDateRange && !q.isFile && !q.isContact && (
                  <input type="text" placeholder={q.placeholder} className="w-full border-b border-gray-300 py-2 outline-none focus:border-black" ref={setRef(q.id)} onChange={(e) => updateData(q.id, e.target.value)} onBlur={(e) => handleBlur(e.target.value, q.id)} onKeyDown={(e) => handleStepEndTab(e, q.id, q.id)} />
                )}

                {q.isDateRange && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-8">
                    <input 
                        type="text" 
                        placeholder="착수 예정일 (예: 20**년 **월 **일, 또는 미정)" 
                        className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                        ref={setRef(`${q.id}_start`)} 
                        onChange={(e) => updateData(`${q.id}_start`, e.target.value)} 
                        onBlur={() => handleBlur(true, q.id, true)} 
                        onKeyDown={(e) => handleStepEndTab(e, q.id, `${q.id}_start`)} 
                    />
                    <input 
                        type="text" 
                        placeholder="마감 예정일 (예: 20**년 **월 **일, 또는 미정)" 
                        className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                        ref={setRef(`${q.id}_end`)} 
                        onChange={(e) => updateData(`${q.id}_end`, e.target.value)} 
                        onBlur={() => handleBlur(true, q.id, true)} 
                        onKeyDown={(e) => handleStepEndTab(e, q.id, `${q.id}_end`)} 
                    />
                    </div>
                    {/* ✨ 친절한 안내 문구 추가 */}
                    <p className="text-sm text-gray-400 mt-2">
                    * 아직 일정이 명확하지 않다면 빈칸으로 두셔도 좋습니다.
                    </p>
                </div>
                )}

                {q.isFile && (
                  <div className="flex flex-col gap-4">
                    <textarea 
                      placeholder={q.placeholder} 
                      className="w-full border-b border-gray-300 py-2 outline-none resize-none overflow-hidden min-h-[42px]" 
                      style={{ height: '42px' }} 
                      ref={setRef(q.id)} 
                      onChange={(e) => {
                        handleTextareaResize(e);
                        updateData(q.id, e.target.value);
                      }} 
                      onBlur={(e) => {
                        // ✨ 핵심: 사용자가 파일 첨부 버튼 영역을 클릭했을 때는 onBlur를 강제 차단!
                        if (e.relatedTarget && e.relatedTarget.closest('.file-upload-wrapper')) return;
                        handleBlur(e.target.value, q.id, true);
                      }} 
                      onKeyDown={(e) => handleStepEndTab(e, q.id, q.id, true)} 
                    />
                    
                    {/* ✨ 파일 버튼 wrapper 추가 (클릭 감지용 tabIndex) */}
                    <div 
                      tabIndex={-1} 
                      className={`file-upload-wrapper relative flex items-center gap-2 text-sm border rounded-full px-4 py-2 w-max cursor-pointer transition-all ${fileStatus === 'uploading' ? 'bg-gray-100 border-gray-200 text-gray-500' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                      {fileStatus === 'uploading' ? (
                        <span className="flex items-center gap-2 text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                          <span className="ml-1">파일을 등록하는 중입니다</span>
                        </span>
                      ) : (
                        <>
                          <span className="text-xl leading-none mb-1">+</span>
                          <span>{formData.file || '첨부파일 (png, jpg, pdf, xlsx, doc, hwp, zip / 최대 10MB)'}</span>
                        </>
                      )}
                      <input 
                        id={`${q.id}_file`}
                        type="file" 
                        tabIndex={-1} 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => validateAndUpload(e, q.id)} 
                        disabled={fileStatus === 'uploading'}
                        accept=".png,.jpg,.jpeg,.pdf,.xlsx,.doc,.docx,.hwp,.zip"
                      />
                    </div>
                  </div>
                )}

                {q.isContact && (
                <div className="flex flex-col gap-6">
                    <div className="flex gap-8">
                    <input 
                        type="text" 
                        placeholder="성함 / 닉네임 / 회사명" 
                        className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                        ref={setRef('contact_name')} 
                        onChange={(e) => updateData('contact_name', e.target.value)} 
                        onKeyDown={(e) => handleStepEndTab(e, q.id, 'contact_name')} 
                    />
                    <input 
                        type="text" 
                        // ✨ 핵심: 창작은 SNS/카톡 유도, 제품은 선택사항임을 강조!
                        placeholder={type === 'creative' ? "연락처 (선택 / 트위터, 오픈카톡 등)" : "연락처 (선택)"} 
                        className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                        ref={setRef('contact_phone')} 
                        onChange={(e) => updateData('contact_phone', e.target.value)} 
                        onKeyDown={(e) => handleStepEndTab(e, q.id, 'contact_phone')} 
                    />
                    </div>
    
                    <input 
                    type="email" 
                    placeholder="이메일 (답변 받으실 주소 - 필수)" 
                    className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                    ref={setRef('contact_email')} 
                    onChange={(e) => updateData('contact_email', e.target.value)} 
                    onKeyDown={(e) => handleStepEndTab(e, q.id, 'contact_email')} 
                    />
                    
                    <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer w-max text-gray-500">
                    <input type="checkbox" className="w-4 h-4" style={{ accentColor: type === 'creative' ? '#FB4C4C' : '#3A86FF' }} onChange={(e) => updateData('privacy_agree', e.target.checked)} />
                    <div>
                        <span className="underline font-bold text-black" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}>
                        개인정보처리방침
                        </span>에 동의합니다.
                    </div>
                    </label>
                </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
        <div ref={bottomRef} className="h-10" />
      </div>

      <div className="fixed bottom-10 left-0 w-full px-8 md:px-16 flex justify-between items-center pointer-events-none z-40">
        <button tabIndex={-1} onClick={onBack} className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-50 pointer-events-auto transition-colors cursor-pointer shadow-sm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        {isComplete && (
          <button tabIndex={-1} onClick={handleSubmit} disabled={isLoading} className={`w-16 h-16 rounded-full border flex items-center justify-center bg-white pointer-events-auto transition-colors shadow-sm ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${currentTheme.border}`}>
            {isLoading ? (
              <svg className="animate-spin h-6 w-6 text-gray-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={type === 'creative' ? '#FB4C4C' : '#3A86FF'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}