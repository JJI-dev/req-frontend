"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { RequestType, QUESTIONS } from "@/components/reqData";
import IntroView from "@/components/IntroView";
import FormView from "@/components/FormView";
import SuccessView from "@/components/SuccessView";
import Toast from "@/components/Toast";
import PrivacyModal from "@/components/PrivacyModal";

export default function RequestForm() {
  const [mounted, setMounted] = useState(false); // ✅ Hydration mismatch 방지 가드
  const [view, setView] = useState<"intro" | "form" | "success">("intro");
  const [type, setType] = useState<RequestType>(null);
  const [visibleStep, setVisibleStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  
  const [toastMessage, setToastMessage] = useState("");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  // ✅ 브라우저 마운트 후 렌더링 시작 (Hydration 에러 해결)
  useEffect(() => {
    setMounted(true);
  }, []);

  const setRef = (id: string) => (el: any) => { inputRefs.current[id] = el; };
  const focusInput = (id: string) => { setTimeout(() => { inputRefs.current[id]?.focus({ preventScroll: true }); }, 600); };
  const displayToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(""), 2000); };
  const updateData = (key: string, value: any) => { setFormData((prev: any) => ({ ...prev, [key]: value })); setToastMessage(""); };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "42px"; // ✅ 기본 높이 42px 강제
    e.target.style.height = `${e.target.scrollHeight}px`;
    updateData(e.target.name, e.target.value);
  };

  const advanceStep = (stepId: string) => {
    const currentQuestions = QUESTIONS[type!].items;
    const currentIndex = currentQuestions.findIndex((q: any) => q.id === stepId);
    if (currentIndex !== -1 && visibleStep < currentQuestions.length - 1) setVisibleStep(currentIndex + 1);
  };

  const focusNextOf = (stepId: string) => {
    const currentQuestions = QUESTIONS[type!].items;
    const currentIndex = currentQuestions.findIndex((q: any) => q.id === stepId);
    const nextQ = currentQuestions[currentIndex + 1];
    if (nextQ) {
      if (nextQ.id === 'name') focusInput('name');
      else if (nextQ.id === 'date') focusInput('date_start');
      else if (nextQ.id === 'info') focusInput('info');
      else if (nextQ.id === 'contact') focusInput('contact_name');
    }
  };

  const handleBlur = (value: any, stepId: string, isOptional: boolean = false) => {
    if (value || isOptional) advanceStep(stepId);
    else displayToast("선택 혹은 입력해주세요!");
  };

  const handleStepEndTab = (e: React.KeyboardEvent, stepId: string, currentInputId: string, isOptional = false) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      if (e.key === 'Enter' && stepId === 'info') return;
      e.preventDefault();
      if (currentInputId === 'date_start') focusInput('date_end');
      else if (currentInputId === 'contact_name') focusInput('contact_phone');
      else if (currentInputId === 'contact_phone') focusInput('contact_email');
      else if (!formData[currentInputId] && !isOptional) { 
        displayToast("선택 혹은 입력해주세요!"); 
        focusInput(currentInputId); 
      }
      else { advanceStep(stepId); focusNextOf(stepId); }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("최대 10MB까지만 업로드 가능합니다."); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev: any) => ({ ...prev, file: file.name, fileName: file.name, fileData: reader.result }));
      advanceStep(QUESTIONS[type!].items[4].id); focusNextOf(QUESTIONS[type!].items[4].id);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.contact_name?.trim() || !formData.contact_email?.trim()) {
      displayToast("담당자 정보를 모두 입력해 주세요!");
      return;
    }

    if (!formData.privacy_agree) {
      displayToast("개인정보처리방침에 동의해 주세요!");
      return;
    }

    // 이메일 형식 체크
    if (!formData.contact_email.includes('@')) {
      displayToast("유효한 이메일을 입력해주세요!");
      return;
    }

    setIsLoading(true);
    displayToast("전송 중입니다... 잠시만 기다려주세요! 🚀");

    try {
      const res = await fetch("/api/send", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ...formData, type }) 
      });

      if (res.ok) { 
        setView("success"); 
        window.scrollTo(0, 0); 
      } else { 
        throw new Error(); 
      }
    } catch { 
      alert("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [visibleStep]);

  // ✅ 마운트 전에는 아무것도 보여주지 않아 Hydration mismatch 방지
  if (!mounted) return <div className="min-h-screen bg-white" />;

  const isComplete = 
    formData.contact_name?.trim() && 
    formData.contact_email?.trim() && 
    // formData.contact_phone?.trim() && // 연락처도 필수로 추가
    formData.privacy_agree === true;
  const progressPercentage = type ? Math.min(100, ((visibleStep + 1) / QUESTIONS[type].items.length) * 100) : 0;

  return (
    <div className="w-full relative flex flex-col items-center">
      <AnimatePresence mode="wait">
        {view === "intro" && (
          <IntroView key="intro" onSelect={(t) => { setType(t); setView("form"); }} />
        )}
        
        {view === "form" && type && (
          <FormView 
            key="form"
            type={type}
            formData={formData}
            visibleStep={visibleStep}
            isLoading={isLoading}
            isComplete={isComplete}
            progressPercentage={progressPercentage}
            bottomRef={bottomRef}
            updateData={updateData}
            handleBlur={handleBlur}
            handleStepEndTab={handleStepEndTab}
            handleFileUpload={handleFileUpload}
            handleTextareaResize={handleTextareaResize}
            handleSubmit={handleSubmit}
            setRef={setRef}
            setShowPrivacyModal={setShowPrivacyModal}
            onBack={() => { setView("intro"); setType(null); setVisibleStep(0); setFormData({}); }}
          />
        )}
        
        {view === "success" && (
          <SuccessView key="success" />
        )}
      </AnimatePresence>

      <Toast message={toastMessage} />
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
}