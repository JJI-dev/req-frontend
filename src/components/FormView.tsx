"use client";
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
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

  const smoothTransition = { type: "spring" as const, stiffness: 30, damping: 18 };
  const currentTheme = QUESTIONS[type as "creative" | "product"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-16 w-full max-w-3xl px-8 relative text-left text-black">
      <motion.div 
        className={`h-2 fixed top-0 left-0 z-50 ${type === 'creative' ? 'bg-[#FB4C4C]' : 'bg-[#3A86FF]'}`}
        initial={{ width: 0 }} 
        animate={{ width: `${progressPercentage}%` }} 
        transition={{ duration: 0.5, ease: "easeInOut" }} 
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
                        <button key={opt} onClick={() => { updateData(q.id, opt); if (opt !== '기타') setTimeout(() => handleBlur(opt, q.id, true), 500); }} 
                          className={`px-5 py-2 rounded-full border border-gray-300 transition-colors cursor-pointer ${formData[q.id] === opt ? currentTheme.bgActive : currentTheme.bgHover}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    {q.subRender && <p className="text-sm mt-4 text-gray-500">{q.subRender(currentTheme.color)}</p>}
                    <AnimatePresence>
                      {formData[q.id] === '기타' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
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
                  <div className="flex gap-8">
                    <input type="text" placeholder="착수 예정일 : 0000년 00월 00일" className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" ref={setRef(`${q.id}_start`)} onChange={(e) => updateData(`${q.id}_start`, e.target.value)} onBlur={() => { if (formData[`${q.id}_start`] && formData[`${q.id}_end`]) handleBlur(true, q.id, true); }} onKeyDown={(e) => handleStepEndTab(e, q.id, `${q.id}_start`)} />
                    <input type="text" placeholder="프로젝트 마감일 : 0000년 00월 00일" className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" ref={setRef(`${q.id}_end`)} onChange={(e) => updateData(`${q.id}_end`, e.target.value)} onBlur={() => { if (formData[`${q.id}_start`] && formData[`${q.id}_end`]) handleBlur(true, q.id, true); }} onKeyDown={(e) => handleStepEndTab(e, q.id, `${q.id}_end`)} />
                  </div>
                )}

                {q.isFile && (
                  <div className="flex flex-col gap-4">
                    <textarea 
                      placeholder={q.placeholder} 
                      className="w-full border-b border-gray-300 py-2 outline-none resize-none overflow-hidden min-h-[42px]" 
                      style={{ height: '42px' }} 
                      ref={setRef(q.id)} 
                      onChange={handleTextareaResize} 
                      onBlur={(e) => handleBlur(e.target.value, q.id, true)} 
                      onKeyDown={(e) => handleStepEndTab(e, q.id, q.id, true)} 
                    />
                    <div className="relative flex items-center gap-2 text-sm border border-gray-300 rounded-full px-4 py-2 w-max hover:bg-gray-50 cursor-pointer">
                      <span className="text-xl leading-none mb-1">+</span>
                      <span>{formData.file || '첨부파일 (jpg, png, pdf, doc, zip / 최대 10MB)'}</span>
                      <input type="file" tabIndex={-1} className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                    </div>
                  </div>
                )}

                {q.isContact && (
                  <div className="flex flex-col gap-6">
                    <div className="flex gap-8">
                      <input type="text" placeholder="성함 / 회사명" className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" ref={setRef('contact_name')} onChange={(e) => updateData('contact_name', e.target.value)} onKeyDown={(e) => handleStepEndTab(e, q.id, 'contact_name')} />
                      <input type="text" placeholder="연락처" className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" ref={setRef('contact_phone')} onChange={(e) => updateData('contact_phone', e.target.value)} onKeyDown={(e) => handleStepEndTab(e, q.id, 'contact_phone')} />
                    </div>
                    <input type="email" placeholder="이메일" className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" ref={setRef('contact_email')} onChange={(e) => updateData('contact_email', e.target.value)} onKeyDown={(e) => handleStepEndTab(e, q.id, 'contact_email')} />
                    <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer w-max text-gray-500">
                      <input type="checkbox" className="w-4 h-4" style={{ accentColor: type === 'creative' ? '#FB4C4C' : '#3A86FF' }} onChange={(e) => updateData('privacy_agree', e.target.checked)} />
                      <div><span className="underline font-bold text-black" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}>개인정보처리방침</span>에 동의합니다.</div>
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