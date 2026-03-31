"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type RequestType = "creative" | "product" | null;

type QuestionItem = {
  id: string;
  title: string;
  options?: string[];
  sub?: React.ReactNode; 
  subRender?: (colorClass: string) => React.ReactNode;
  placeholder?: string;
  isDateRange?: boolean;
  isFile?: boolean;
  isContact?: boolean;
};

type Theme = {
  color: string;
  border: string;
  bgHover: string;
  bgActive: string;
  items: QuestionItem[];
};

const getHighlightedText = (title: string, colorClass: string) => {
  const keywords = ["어떤 프로젝트를", "어떤 서비스를", "이름을", "착수일이", "예산범위를", "정보를", "담당자의"];
  let result = <>{title}</>;
  keywords.forEach(keyword => {
    if (title.includes(keyword)) {
      const parts = title.split(keyword);
      result = <>{parts[0]}<span className={colorClass}>{keyword}</span>{parts[1]}</>;
    }
  });
  return result;
};

const availableSlots = 3;

const QUESTIONS: Record<"creative" | "product", Theme> = {
  creative: {
    color: "text-[#FB4C4C]",
    border: "border-[#FB4C4C]",
    bgHover: "hover:bg-[#FB4C4C]/8 hover:text-[#FB4C4C]",
    bgActive: "bg-[#FB4C4C]/8 text-[#FB4C4C] border-transparent",
    items: [
      { 
        id: "service", 
        title: "어떤 프로젝트를\n문의하고 싶으신가요?", 
        options: ["일러스트 커미션", "3D", "그래픽", "영상", "디자인", "썸네일", "기타"], 
        subRender: (colorClass) => (
          <>
            *현재 슬롯은 <span className={`font-bold ${colorClass}`}>{availableSlots}</span>개 남았습니다!{' '}
            <a href="https://ne.jji.kr/about" target="_blank" rel="noreferrer" tabIndex={-1} className="text-black underline underline-offset-2 hover:opacity-70 transition-opacity cursor-pointer">작업과정, 안내사항</a> 및{' '}
            <a href="https://ne.jji.kr/work" target="_blank" rel="noreferrer" tabIndex={-1} className="text-black underline underline-offset-2 hover:opacity-70 transition-opacity cursor-pointer">작업물</a> 참고 부탁드립니다!
          </>
        )
      },
      { id: "name", title: "프로젝트의 이름을\n알려주세요!", placeholder: "프로젝트 이름을 입력해 주세요." },
      { id: "date", title: "프로젝트의 착수일이\n어떻게 되나요?", isDateRange: true },
      { id: "budget", title: "프로젝트의 예산범위를\n선택해주세요!", options: ["5천원 ~ 1만원", "1만원 ~ 3만원", "3만원 ~ 5만원", "5만원 ~ 10만원", "10만원 ~ 20만원", "30만원 ~ 50만원", "50만원 이상"] },
      { id: "info", title: "프로젝트의 정보를\n알려주세요!", isFile: true, placeholder: "프로젝트에 대해 알고 싶어요." },
      { id: "contact", title: "담당자의 정보를\n입력해주세요!", isContact: true },
    ],
  },
  product: {
    color: "text-[#3A86FF]",
    border: "border-[#3A86FF]",
    bgHover: "hover:bg-[#3A86FF]/8 hover:text-[#3A86FF]", 
    bgActive: "bg-[#3A86FF]/8 text-[#3A86FF] border-transparent",
    items: [
      { id: "service", title: "어떤 서비스를\n문의하고 싶으신가요?", options: ["제품", "커머스", "브랜딩", "UI/UX 디자인", "워드프레스", "프로모션", "기타"] },
      { id: "name", title: "프로젝트의 이름을\n알려주세요!", placeholder: "프로젝트 이름을 입력해 주세요." },
      { id: "date", title: "프로젝트의 착수일이\n어떻게 되나요?", isDateRange: true },
      { id: "budget", title: "프로젝트의 예산범위를\n선택해주세요!", options: ["1백만원 ~ 5백만원", "5백만원 ~ 1천만원", "1천만원 ~ 3천만원", "5천만원 ~ 1억원", "1억원 ~ 3억원", "5억원", "10억원 이상"] },
      { id: "info", title: "프로젝트의 정보를\n알려주세요!", isFile: true, placeholder: "프로젝트에 대해 알고 싶어요." },
      { id: "contact", title: "담당자의 정보를\n입력해주세요!", isContact: true },
    ],
  },
};

export default function RequestForm() {
  const [view, setView] = useState<"intro" | "form" | "success">("intro");
  const [type, setType] = useState<RequestType>(null);
  const [visibleStep, setVisibleStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  
  const [toastMessage, setToastMessage] = useState("");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  const setRef = (id: string) => (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    inputRefs.current[id] = el;
  };

  const focusInput = (id: string) => {
    setTimeout(() => {
      inputRefs.current[id]?.focus({ preventScroll: true });
    }, 600); 
  };

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    updateData(e.target.name, e.target.value);
  };

  const updateData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    setToastMessage("");
  };

  const advanceStep = (stepId: string) => {
    const currentQuestions = QUESTIONS[type!].items;
    const currentIndex = currentQuestions.findIndex(q => q.id === stepId);
    if (currentIndex !== -1 && visibleStep < currentQuestions.length - 1) {
      setVisibleStep((prev) => Math.max(prev, currentIndex + 1));
    }
  };

  const focusNextOf = (stepId: string) => {
    const currentQuestions = QUESTIONS[type!].items;
    const currentIndex = currentQuestions.findIndex(q => q.id === stepId);
    const nextQ = currentQuestions[currentIndex + 1];
    
    if (nextQ) {
      if (nextQ.id === 'name') focusInput('name');
      else if (nextQ.id === 'date') focusInput('date_start');
      else if (nextQ.id === 'info') focusInput('info');
      else if (nextQ.id === 'contact') focusInput('contact_name');
      else { (document.activeElement as HTMLElement)?.blur(); }
    }
  };

  const handleBlur = (value: any, stepId: string, isOptional: boolean = false) => {
    if (value || isOptional) {
      advanceStep(stepId);
    } else {
      displayToast("선택 및 입력을 완료해주세요!");
    }
  };

  const handleStepEndTab = (e: React.KeyboardEvent, stepId: string, currentInputId: string, isOptional = false) => {
    if (e.key === 'Enter' && stepId === 'info') return; // info칸 엔터 줄바꿈 허용

    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault(); 

      if (e.key === 'Enter') {
        displayToast("탭 버튼 눌러주세요!");
        return;
      }

      if (currentInputId === 'date_start') { focusInput('date_end'); return; }
      if (currentInputId === 'contact_name') { focusInput('contact_phone'); return; }
      if (currentInputId === 'contact_phone') { focusInput('contact_email'); return; }
      if (currentInputId === 'contact_email') { 
        (document.activeElement as HTMLElement)?.blur(); 
        return; 
      }

      if (stepId === 'date') {
        if (!formData['date_start']) { displayToast("착수 예정일을 입력해주세요!"); focusInput('date_start'); return; }
        if (!formData['date_end']) { displayToast("프로젝트 마감일을 입력해주세요!"); focusInput('date_end'); return; }
        advanceStep(stepId);
        focusNextOf(stepId);
        return;
      }

      if (stepId === 'contact') {
        if (!formData['contact_name']) { displayToast("성함/회사명을 입력해주세요!"); focusInput('contact_name'); return; }
        if (!formData['contact_phone']) { displayToast("연락처를 입력해주세요!"); focusInput('contact_phone'); return; }
        if (!formData['contact_email']) { displayToast("이메일을 입력해주세요!"); focusInput('contact_email'); return; }
        (document.activeElement as HTMLElement)?.blur();
        return;
      }

      if (!formData[currentInputId] && !isOptional) {
        displayToast("선택 및 입력을 완료해주세요!");
        focusInput(currentInputId);
        return;
      }

      advanceStep(stepId);
      focusNextOf(stepId);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['ppt', 'pdf', 'doc', 'docx', 'xlsx', 'hwp', 'zip'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension || '')) {
      alert("지원하지 않는 파일 형식입니다. (ppt, pdf, doc, xlsx, hwp, zip 가능)");
      e.target.value = '';
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      alert("최대 30MB까지만 업로드 가능합니다.");
      e.target.value = '';
      return;
    }
    updateData('file', file.name);
    advanceStep(QUESTIONS[type!].items[4].id); 
    focusNextOf(QUESTIONS[type!].items[4].id);
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleStep]);

  const handleSubmit = async () => {
    try {
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type }),
      });
      setView("success");
      window.scrollTo(0, 0);
    } catch (error) {
      alert("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const isComplete = formData.contact_name && formData.contact_email && formData.privacy_agree;
  const progressPercentage = type ? Math.min(100, ((visibleStep + 1) / QUESTIONS[type].items.length) * 100) : 0;
  
  const smoothTransition = { type: "spring" as const, stiffness: 30, damping: 18 };

  return (
    <div className="w-full relative flex flex-col items-center">
      <AnimatePresence mode="wait">
        
        {view === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col w-full min-h-screen"
          >
            {/* 1. 헤더 영역 (높이 80px, 좌우 패딩 28px 유지) */}
            <header className="h-[80px] px-[28px] py-[20px] flex items-center w-full shrink-0">
              <Link href="/" tabIndex={-1} className="cursor-pointer block">
                <svg width="86" height="21" viewBox="0 0 86 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M66.5366 7.04167C66.6302 6.9761 66.944 6.77012 67.4502 6.65565C67.7583 6.58599 68.1887 6.72309 68.668 6.99606C68.8505 7.10175 68.9962 7.19674 69.1155 7.28398C69.1725 7.32078 69.2223 7.3424 69.349 7.43018" stroke="black" strokeLinecap="round"/>
                  <path d="M75.6733 14.8593C75.988 15.0571 76.6377 15.2897 78.8617 15.2315C80.0628 15.2001 80.9423 14.5479 81.49 14.0621C81.7277 13.8514 81.9211 13.5851 82.1799 13.4015C82.5844 13.1144 83.168 13.3973 84.6256 13.9689C84.9275 14.082 85.0145 14.1066 85.1116 14.1479C85.2087 14.1893 85.3131 14.2467 85.4999 14.4549" stroke="black" strokeLinecap="round"/>
                  <path d="M61.7245 10.8679C61.6974 10.9048 61.593 11.044 61.3723 11.3323C61.0786 11.7161 60.8011 12.1002 60.5795 12.5145C60.2876 13.0604 60.1162 13.7221 60.0067 14.3599C59.8969 14.9995 59.9464 15.4465 59.9823 15.7207C60.0344 16.1183 60.1985 16.6302 60.4235 17.182C60.6468 17.7294 61.1049 18.2266 61.5693 18.7019C61.9408 19.0823 62.2225 19.2323 62.3733 19.3254C62.5684 19.4458 62.9657 19.6097 63.4574 19.7962C63.8082 19.9293 64.1859 19.9884 64.5963 20.0607C65.1505 20.1583 65.7736 20.2076 66.2845 20.2733C67.0128 20.367 67.4058 20.4271 67.8986 20.4602C68.6093 20.5078 69.1296 20.5022 69.2219 20.4952C69.5665 20.4688 70.1536 20.3798 70.853 20.2503C71.2247 20.1814 71.7413 20.0313 72.1354 19.9056C72.3723 19.8301 72.5444 19.7383 72.7813 19.5592C72.9872 19.4036 73.2753 19.1307 73.5109 18.8799C73.7535 18.6217 73.9039 18.3943 74.0711 18.1699C74.3887 17.7438 74.4733 17.5634 74.6629 17.2478C74.8262 16.9761 74.8937 16.8226 74.957 16.6644C75.0385 16.461 75.097 16.2612 75.2211 15.6543C75.2838 15.3478 75.2689 14.7876 75.2779 14.0691C75.2875 13.3071 75.3141 13.025 75.3434 12.8095C75.3681 12.6282 75.3818 12.4206 75.4134 12.2103C75.4484 11.9771 75.4631 11.7598 75.47 11.5427C75.4767 11.4483 75.4813 11.2088 75.4835 10.8905C75.4858 10.7684 75.4902 10.7264 75.4948 10.584" stroke="black" strokeLinecap="round"/>
                  <path d="M69.4565 6.88138C69.5602 6.66957 69.7173 6.37712 69.9372 6.01139C70.1595 5.64181 70.7697 4.96546 71.7652 3.94733C72.2817 3.41907 72.8953 2.93395 73.4738 2.4832C74.5761 1.62441 75.2822 1.12461 75.5062 0.889964C75.6817 0.706189 75.7767 0.553912 75.8809 0.510196C76.0571 0.43629 76.2768 0.776752 76.9135 1.12455C77.4119 1.39683 78.2864 1.8302 78.8565 2.1485C79.6927 2.61536 80.2309 3.00489 80.8556 3.32045C82.0969 3.94738 83.0308 3.99408 83.3598 4.27553C83.4403 4.34441 83.4351 4.44441 83.4051 4.53297C83.3392 4.72808 83.1559 4.86871 82.8486 5.10012C82.2226 5.57147 81.3202 6.06607 80.5897 6.46434C80.0308 6.76902 79.1355 7.30853 78.0539 7.86838C77.4295 8.19162 77.1004 8.5808 76.5907 9.27069C75.9499 10.0137 75.8363 10.2465 75.7873 10.3943C75.7608 10.4653 75.7308 10.5281 75.6546 10.5929" stroke="black" strokeLinecap="round"/>
                  <path d="M63.4629 1.09277C63.5754 1.47044 63.6878 1.8481 64.0094 2.59462C64.3309 3.34115 64.8581 4.44508 65.1437 5.06462C65.5486 5.94269 65.5286 6.29246 65.6457 6.5646C65.734 6.67453 65.8268 6.78501 65.9189 6.88757C65.9687 6.93202 66.0249 6.96108 66.1255 6.99101" stroke="black" strokeLinecap="round"/>
                  <path d="M63.2436 0.757873C63.094 0.748234 62.9444 0.738595 61.8314 0.875543C60.7184 1.01249 58.6465 1.29632 57.3999 1.50451C55.0219 1.90164 54.2296 2.57973 53.6719 2.8685C53.4141 3.00195 53.2021 3.06193 53.1009 3.15294C52.9807 3.26108 53.5345 3.97144 54.2772 5.01161C54.9236 5.91671 55.9669 6.67156 56.9724 7.35008C57.7669 7.8862 58.321 8.35768 58.9091 8.8929C60.2289 10.094 60.5747 10.2767 60.8887 10.4935C60.9737 10.5468 61.0625 10.5945 61.1477 10.6476C61.2328 10.7008 61.3118 10.758 61.5724 10.8458" stroke="black" strokeLinecap="round"/>
                  <path d="M37.7719 11.9421C37.5682 12.0383 37.2377 12.0385 35.9704 11.7521C35.2251 11.5837 33.946 11.3313 33.1699 11.1454C31.8058 10.8186 31.5326 10.4809 31.2383 10.1528C30.9849 9.87023 30.7545 8.9878 30.5703 8.22512C30.4537 7.74214 30.5028 7.27676 30.5946 6.69846C30.663 6.26676 30.8446 5.56714 30.9888 5.06097C31.2182 4.25581 31.446 3.84532 31.6123 3.57259C31.8107 3.24736 32.2288 2.7837 32.9468 2.15203C33.3567 1.79148 33.9431 1.45517 34.3826 1.20905C35.1 0.80739 35.5982 0.677297 36.0776 0.592334C36.8074 0.462997 37.4821 0.493297 37.9306 0.54074C38.3843 0.588738 38.8768 0.783439 39.4057 0.970923C40.3975 1.32254 41.0174 1.70502 41.3337 1.95924C41.7311 2.27875 42.0842 3.2246 42.3821 4.04475C42.518 4.41888 42.5211 4.7954 42.5242 5.41156C42.5304 6.62357 42.4826 7.48914 42.4603 7.66872C42.4443 7.8483 42.4188 8.02286 42.3806 8.1737C42.3613 8.24179 42.3424 8.29272 42.1887 8.40263" stroke="black" strokeLinecap="round"/>
                  <path d="M42.2891 8.29412C42.3754 8.23465 42.6647 8.04784 43.1315 7.94402C43.4155 7.88084 43.8123 8.00519 44.2543 8.25275C44.4226 8.3486 44.5569 8.43476 44.6669 8.51388C44.7195 8.54725 44.7654 8.56685 44.8822 8.64647" stroke="black" strokeLinecap="round"/>
                  <path d="M45.0187 8.75161C45.0187 8.73901 44.9868 8.5631 44.9386 8.08783C44.8635 7.34841 44.9721 6.56503 45.0712 5.96932C45.1482 5.50648 45.26 5.19188 45.4307 4.81682C46.0038 3.55814 46.4743 3.05579 46.777 2.68356C47.0827 2.30769 47.4476 1.96254 47.7792 1.72005C48.1507 1.44838 48.758 1.38871 49.9878 1.4244C50.6014 1.44221 51.0663 1.60006 51.7852 1.80128C52.3824 1.96843 52.8673 2.27311 53.2787 2.48121C53.6645 2.67636 53.9567 2.86494 54.2052 3.04161C54.5729 3.30295 55.1273 3.76498 55.3951 3.99178C55.7576 4.29886 55.9742 4.66464 56.3175 5.18046C56.5441 5.52088 56.7122 5.8604 56.9194 6.27284C57.1868 6.80526 57.2475 7.09507 57.3018 7.43404C57.4246 8.19989 57.2409 8.53595 57.1862 8.80421C57.1367 9.04674 56.9969 9.30417 56.8168 9.56893C56.6037 9.88204 56.2015 10.16 55.4254 10.6082C54.5743 11.0996 54.2558 11.133 53.6011 11.2039C53.3744 11.2242 53.1112 11.252 52.8284 11.2726C52.5456 11.2931 52.2512 11.3056 51.9478 11.2994" stroke="black" strokeLinecap="round"/>
                  <path d="M50.7148 15.383C51.005 15.5624 51.604 15.7733 53.6547 15.7206C54.7622 15.6921 55.5731 15.1005 56.0781 14.66C56.2973 14.4689 56.4757 14.2274 56.7143 14.0609C57.0873 13.8005 57.6253 14.057 58.9693 14.5755C59.2477 14.678 59.328 14.7003 59.4175 14.7378C59.507 14.7754 59.6033 14.8274 59.7755 15.0163" stroke="black" strokeLinecap="round"/>
                  <path d="M37.852 11.7643C37.827 11.7978 37.7307 11.9241 37.5273 12.1855C37.2565 12.5336 37.0006 12.882 36.7963 13.2577C36.5271 13.7528 36.3691 14.3529 36.2681 14.9314C36.1668 15.5114 36.2125 15.9168 36.2456 16.1655C36.2936 16.5262 36.4449 16.9904 36.6524 17.4908C36.8583 17.9873 37.2807 18.4382 37.7089 18.8693C38.0514 19.2143 38.3112 19.3503 38.4502 19.4347C38.6301 19.5439 38.9965 19.6926 39.4498 19.8617C39.7733 19.9824 40.1216 20.0361 40.4999 20.1016C41.011 20.1901 41.5855 20.2348 42.0566 20.2944C42.7282 20.3794 43.0905 20.4339 43.5449 20.4639C44.2002 20.5071 44.6799 20.5021 44.7651 20.4957C45.0828 20.4717 45.6241 20.391 46.269 20.2736C46.6118 20.2111 47.0881 20.075 47.4514 19.961C47.6699 19.8925 47.8285 19.8092 48.047 19.6468C48.2369 19.5056 48.5026 19.2582 48.7198 19.0307C48.9435 18.7966 49.0821 18.5903 49.2363 18.3868C49.5291 18.0003 49.6072 17.8367 49.782 17.5505C49.9325 17.3041 49.9948 17.1649 50.0532 17.0214C50.1283 16.8369 50.1822 16.6557 50.2967 16.1053C50.3545 15.8273 50.3408 15.3193 50.3491 14.6676C50.3579 13.9766 50.3824 13.7207 50.4094 13.5252C50.4322 13.3608 50.4449 13.1725 50.474 12.9818C50.5063 12.7703 50.5198 12.5732 50.5261 12.3763C50.5323 12.2908 50.5366 12.0735 50.5386 11.7849C50.5407 11.6741 50.5448 11.636 50.5491 11.5068" stroke="black" strokeLinecap="round"/>
                  <path d="M50.6758 11.5119C50.7177 11.5119 50.7603 11.5097 50.9326 11.4849C51.365 11.4192 51.6945 11.3704 51.7653 11.3628C51.7964 11.3595 51.8173 11.3574 51.8898 11.3486" stroke="black" strokeLinecap="round"/>
                  <path d="M9.42447 14.5461C9.17441 14.6643 8.76866 14.6645 7.21295 14.3129C6.29804 14.1062 4.72786 13.7964 3.77518 13.5681C2.10057 13.167 1.76527 12.7524 1.40399 12.3496C1.09288 12.0028 0.809988 10.9195 0.583924 9.98325C0.440763 9.39034 0.501036 8.81905 0.613672 8.10914C0.697752 7.5792 0.920632 6.72035 1.09764 6.09898C1.37921 5.11058 1.65886 4.60666 1.86308 4.27187C2.10662 3.87262 2.61981 3.30343 3.5013 2.528C4.00444 2.0854 4.72427 1.67255 5.26388 1.37042C6.14453 0.877348 6.75611 0.717647 7.3446 0.613348C8.24044 0.454576 9.06877 0.491771 9.6193 0.550012C10.1763 0.608934 10.7809 0.847946 11.4301 1.0781C12.6477 1.50973 13.4086 1.97926 13.7968 2.29135C14.2847 2.68356 14.7181 3.84468 15.0839 4.85148C15.2507 5.31076 15.2545 5.77297 15.2584 6.52936C15.2659 8.01721 15.2073 9.07976 15.1799 9.30022C15.1603 9.52067 15.129 9.73496 15.082 9.92013C15.0584 10.0037 15.0351 10.0662 14.8464 10.2012" stroke="black" strokeLinecap="round"/>
                  <path d="M14.9697 10.066C15.0757 9.99298 15.4308 9.76365 16.0038 9.6362C16.3526 9.55864 16.8397 9.71129 17.3823 10.0152C17.5888 10.1329 17.7537 10.2386 17.8888 10.3358C17.9533 10.3767 18.0097 10.4008 18.153 10.4985" stroke="black" strokeLinecap="round"/>
                  <path d="M18.283 10.6245C18.283 10.6091 18.2437 10.3945 18.1842 9.81483C18.0915 8.91294 18.2255 7.95742 18.3479 7.2308C18.4429 6.66627 18.5808 6.28254 18.7915 5.82505C19.4986 4.2898 20.0793 3.67707 20.4528 3.22304C20.8299 2.76458 21.2802 2.34359 21.6894 2.04782C22.1478 1.71645 22.8972 1.64367 24.4148 1.6872C25.1718 1.70892 25.7456 1.90146 26.6326 2.14689C27.3696 2.35078 27.968 2.7224 28.4756 2.97623C28.9517 3.21426 29.3122 3.44428 29.6189 3.65977C30.0726 3.97854 30.7567 4.54209 31.0871 4.81873C31.5344 5.19328 31.8017 5.63943 32.2254 6.26861C32.505 6.68383 32.7124 7.09795 32.968 7.60102C33.298 8.25043 33.373 8.60392 33.44 9.01739C33.5914 9.95151 33.3648 10.3614 33.2973 10.6886C33.2362 10.9845 33.0638 11.2985 32.8414 11.6214C32.5785 12.0033 32.0822 12.3424 31.1245 12.889C30.0743 13.4884 29.6813 13.5291 28.8734 13.6156C28.5937 13.6404 28.2689 13.6743 27.92 13.6994C27.571 13.7245 27.2076 13.7397 26.8333 13.7321" stroke="black" strokeLinecap="round"/>
                  <path d="M9.86332 14.774C9.83244 14.8731 9.70802 15.1646 9.66463 15.453C9.6385 15.6267 9.5906 15.8334 9.54406 16.3853C9.36686 18.4865 9.54941 18.891 9.7036 19.1337C9.85478 19.3716 10.4336 19.3761 10.9129 19.4798C11.7527 19.6614 12.0928 19.7759 12.5021 19.7992C12.6729 19.8089 13.4298 19.8376 14.528 19.8451C15.6168 19.8525 16.5889 19.9832 17.0438 20.0294C17.3216 20.0576 17.905 20.1215 18.7279 20.1881C19.4446 20.2461 19.9966 20.3227 20.3863 20.3572C20.6831 20.3834 21.5476 20.4532 22.7079 20.4955C23.2036 20.5135 23.5116 20.4763 23.9197 20.2495C24.9699 19.666 24.4235 18.8252 24.4891 18.3719C24.606 17.5637 24.6933 17.0505 24.8548 16.3924C25.2101 15.0701 25.2798 14.8134 25.3066 14.6509C25.3258 14.5575 25.3563 14.4421 25.3878 14.3232" stroke="black" strokeLinecap="round"/>
                  <path d="M26.8351 13.7576C26.7613 13.7576 26.5698 13.7348 26.2742 13.7344C26.0683 13.734 25.9491 13.9157 25.8073 14.0188C25.7577 14.0304 25.691 14.0304 25.6285 14.0248C25.5661 14.0191 25.5099 14.0077 25.3882 13.9614" stroke="black" strokeLinecap="round"/>
                  <path d="M25.312 18.7698C25.6682 18.99 26.4036 19.249 28.921 19.1842C30.2805 19.1492 31.2759 18.4231 31.8959 17.8823C32.165 17.6476 32.3839 17.3512 32.6768 17.1468C33.1347 16.8272 33.7952 17.1421 35.4451 17.7785C35.7869 17.9044 35.8854 17.9318 35.9953 17.9778C36.1051 18.0239 36.2234 18.0878 36.4348 18.3196" stroke="black" strokeLinecap="round"/>
                </svg>
              </Link>
            </header>

            {/* 2. 복구된 텍스트 영역 (패딩 값을 창작/제품 의뢰 카드와 일치시켰습니다) */}
            <div className="px-10 md:px-16 pt-8 pb-16 w-full">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-16">
                안녕하세요,<br />
                프로젝트 의뢰에 방문해주셔서 감사합니다.
              </h1>
              <div className="text-gray-400 text-sm space-y-1">
                <p>검토 후 3~4일 이내 연락드리겠습니다.</p>
                <p>문의 메일 : Contact@jji.kr</p>
              </div>
            </div>

            <div className="w-full border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 flex-grow">
              <div 
                className="p-10 md:p-16 border-b md:border-b-0 md:border-r border-gray-200 cursor-pointer group flex flex-col justify-between min-h-[400px]"
                onClick={() => { setType("creative"); setView("form"); }}
              >
                <div>
                  <h2 className="text-3xl font-bold mb-6">창작 의뢰</h2>
                  <ul className="text-gray-400 space-y-1">
                    <li>3D</li><li>Illustration</li><li>Graphics</li><li>Video</li><li>design</li>
                  </ul>
                </div>
                <div className="self-end mt-8 group-hover:scale-110 transition-transform">
                  <svg width="60" height="60" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="59.5" fill="white" stroke="black"/>
                    <path d="M77.3335 60L77.8638 59.4697L78.3942 60L77.8638 60.5303L77.3335 60ZM44.8335 60.75C44.4193 60.75 44.0835 60.4142 44.0835 60C44.0835 59.5858 44.4193 59.25 44.8335 59.25V60V60.75ZM64.3335 47L64.8638 46.4697L77.8638 59.4697L77.3335 60L76.8032 60.5303L63.8032 47.5303L64.3335 47ZM77.3335 60L77.8638 60.5303L64.8638 73.5303L64.3335 73L63.8032 72.4697L76.8032 59.4697L77.3335 60ZM77.3335 60V60.75H44.8335V60V59.25H77.3335V60Z" fill="#FB4C4C"/>
                  </svg>
                </div>
              </div>

              <div 
                className="p-10 md:p-16 cursor-pointer group flex flex-col justify-between min-h-[400px]"
                onClick={() => { setType("product"); setView("form"); }}
              >
                <div>
                  <h2 className="text-3xl font-bold mb-6">제품 의뢰</h2>
                  <ul className="text-gray-400 space-y-1">
                    <li>Commerce</li><li>Brand</li><li>Product</li>
                  </ul>
                </div>
                <div className="self-end mt-8 group-hover:scale-110 transition-transform">
                  <svg width="60" height="60" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="59.5" fill="white" stroke="black"/>
                    <path d="M77.3335 60L77.8638 59.4697L78.3942 60L77.8638 60.5303L77.3335 60ZM44.8335 60.75C44.4193 60.75 44.0835 60.4142 44.0835 60C44.0835 59.5858 44.4193 59.25 44.8335 59.25V60V60.75ZM64.3335 47L64.8638 46.4697L77.8638 59.4697L77.3335 60L76.8032 60.5303L63.8032 47.5303L64.3335 47ZM77.3335 60L77.8638 60.5303L64.8638 73.5303L64.3335 73L63.8032 72.4697L76.8032 59.4697L77.3335 60ZM77.3335 60V60.75H44.8335V60V59.25H77.3335V60Z" fill="#3A86FF"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === "form" && type && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-16 w-full max-w-3xl px-8 relative"
          >
            <motion.div 
              className={`h-2 fixed top-0 left-0 z-50 ${type === 'creative' ? 'bg-[#FB4C4C]' : 'bg-[#3A86FF]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            <div className="space-y-24">
              {QUESTIONS[type].items.map((q, index) => (
                <AnimatePresence key={q.id}>
                  {index <= visibleStep && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={smoothTransition}
                      className="flex flex-col"
                    >
                      <div className="flex gap-4 mb-8">
                        <span className={`font-bold text-xl ${QUESTIONS[type].color}`}>{index + 1}</span>
                        <h2 className="text-3xl font-bold whitespace-pre-line leading-snug">
                          {getHighlightedText(q.title, QUESTIONS[type].color)}
                        </h2>
                      </div>

                      {q.options && (
                        <div>
                          <div className="flex flex-wrap gap-3">
                            {q.options.map(opt => (
                              <button
                                key={opt}
                                tabIndex={-1}
                                onClick={() => {
                                  updateData(q.id, opt);
                                  if (opt !== '기타') setTimeout(() => advanceStep(q.id), 500);
                                }}
                                className={`px-5 py-2 rounded-full border border-gray-300 transition-colors cursor-pointer ${
                                  formData[q.id] === opt ? QUESTIONS[type].bgActive : QUESTIONS[type].bgHover
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          
                          {q.subRender && <p className="text-sm mt-4 text-gray-500">{q.subRender(QUESTIONS[type].color)}</p>}
                          {q.sub && <p className="text-sm mt-4 text-gray-500">{q.sub}</p>}
                          
                          <AnimatePresence>
                            {formData[q.id] === '기타' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <input 
                                  type="text" 
                                  placeholder="서비스를 입력해 주세요." 
                                  className="w-full border-b border-gray-300 py-2 outline-none focus:border-black transition-colors" 
                                  ref={setRef(`${q.id}_etc`)}
                                  onChange={(e) => updateData(`${q.id}_etc`, e.target.value)}
                                  onBlur={(e) => handleBlur(e.target.value, q.id)} 
                                  onKeyDown={(e) => handleStepEndTab(e, q.id, `${q.id}_etc`)} 
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {!q.options && !q.isDateRange && !q.isFile && !q.isContact && (
                        <input
                          type="text"
                          name={q.id}
                          placeholder={q.placeholder}
                          className="w-full border-b border-gray-300 py-2 outline-none focus:border-black transition-colors"
                          ref={setRef(q.id)}
                          onChange={(e) => updateData(q.id, e.target.value)}
                          onBlur={(e) => handleBlur(e.target.value, q.id)} 
                          onKeyDown={(e) => handleStepEndTab(e, q.id, q.id)}
                        />
                      )}

                      {q.isDateRange && (
                        <div className="flex gap-8">
                          <input 
                            type="text" 
                            placeholder="착수 예정일 : 0000년 00월 00일" 
                            className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                            ref={setRef(`${q.id}_start`)}
                            onChange={(e) => updateData(`${q.id}_start`, e.target.value)}
                            onBlur={() => {
                              if (formData[`${q.id}_start`] && formData[`${q.id}_end`]) advanceStep(q.id);
                            }}
                            onKeyDown={(e) => handleStepEndTab(e, q.id, `${q.id}_start`)} 
                          />
                          <input 
                            type="text" 
                            placeholder="프로젝트 마감일 : 0000년 00월 00일" 
                            className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                            ref={setRef(`${q.id}_end`)}
                            onChange={(e) => updateData(`${q.id}_end`, e.target.value)}
                            onBlur={() => {
                              if (formData[`${q.id}_start`] && formData[`${q.id}_end`]) advanceStep(q.id);
                              else if (!formData[`${q.id}_start`] || !formData[`${q.id}_end`]) displayToast("선택 및 입력을 완료해주세요!");
                            }}
                            onKeyDown={(e) => handleStepEndTab(e, q.id, `${q.id}_end`)} 
                          />
                        </div>
                      )}

                      {q.isFile && (
                        <div className="flex flex-col gap-4">
                           <textarea
                            name={q.id}
                            rows={1}
                            placeholder={q.placeholder}
                            className="w-full border-b border-gray-300 py-2 outline-none focus:border-black resize-none overflow-hidden leading-relaxed"
                            ref={setRef(q.id)}
                            onChange={handleTextareaResize}
                            onBlur={(e) => handleBlur(e.target.value, q.id, true)} 
                            onKeyDown={(e) => handleStepEndTab(e, q.id, q.id, true)} 
                          />
                          <div className="relative flex items-center gap-2 text-sm text-black border border-gray-300 rounded-full px-4 py-2 w-max hover:bg-gray-50 cursor-pointer">
                            <span className="text-xl leading-none mb-1">+</span>
                            <span>{formData.file || '첨부파일 (ppt, pdf, doc, xlsx, hwp, zip / 최대 30MB)'}</span>
                            <input type="file" tabIndex={-1} className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                          </div>
                        </div>
                      )}

                      {q.isContact && (
                        <div className="flex flex-col gap-6">
                           <div className="flex gap-8">
                             <input 
                               type="text" 
                               placeholder="성함 / 회사명" 
                               className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                               ref={setRef('contact_name')}
                               onChange={(e) => updateData('contact_name', e.target.value)} 
                               onKeyDown={(e) => handleStepEndTab(e, q.id, 'contact_name')} 
                             />
                             <input 
                               type="text" 
                               placeholder="연락처" 
                               className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                               ref={setRef('contact_phone')}
                               onChange={(e) => updateData('contact_phone', e.target.value)} 
                               onKeyDown={(e) => handleStepEndTab(e, q.id, 'contact_phone')} 
                             />
                           </div>
                           <input 
                             type="email" 
                             placeholder="이메일" 
                             className="w-1/2 border-b border-gray-300 py-2 outline-none focus:border-black" 
                             ref={setRef('contact_email')}
                             onChange={(e) => updateData('contact_email', e.target.value)} 
                             onKeyDown={(e) => handleStepEndTab(e, q.id, 'contact_email')} 
                           />
                           <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer w-max">
                             <input 
                               type="checkbox" 
                               tabIndex={-1}
                               className="w-4 h-4" 
                               style={{ accentColor: type === 'creative' ? '#FB4C4C' : '#3A86FF' }} 
                               onChange={(e) => updateData('privacy_agree', e.target.checked)} 
                             />
                             <span className="underline font-bold cursor-pointer" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}>개인정보처리방침</span>에 동의합니다.
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
              <button 
                tabIndex={-1}
                onClick={() => { setView("intro"); setType(null); setVisibleStep(0); setFormData({}); }}
                className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-50 pointer-events-auto transition-colors cursor-pointer"
              >
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>

              {isComplete && (
                <button 
                  tabIndex={-1}
                  onClick={handleSubmit}
                  className={`w-16 h-16 rounded-full border flex items-center justify-center bg-white pointer-events-auto transition-colors cursor-pointer ${QUESTIONS[type].border}`}
                >
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={type === 'creative' ? '#FB4C4C' : '#3A86FF'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {view === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center text-center w-full px-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-8">성공적으로 접수 완료되었습니다!</h1>
            <div className="text-gray-400 mb-16 space-y-2">
              <p>검토 후 3~4일 이내 연락드리겠습니다.</p>
              <p>문의 메일 : Contact@jji.kr</p>
            </div>
            <p className="font-bold mb-12">작성하신 요청 내용이 입력하신 이메일로 함께 발송되었습니다.</p>
            
            <div className="flex gap-4">
              <a href="https://ne.jji.kr" tabIndex={-1} className="px-8 py-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                NE 둘러보기
              </a>
              <a href="https://mo.jji.kr" tabIndex={-1} className="px-8 py-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                MO 둘러보기
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrivacyModal && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()} 
            >
              <button className="absolute top-4 right-4 text-2xl cursor-pointer" tabIndex={-1} onClick={() => setShowPrivacyModal(false)}>&times;</button>
              <h2 className="text-2xl font-bold mb-6">개인정보처리방침</h2>
              <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
                <p>1. 수집하는 개인정보 항목: 이름, 연락처, 이메일</p>
                <p>2. 수집 및 이용 목적: 프로젝트 문의 접수 및 상담, 견적 안내</p>
                <p>3. 보유 및 이용 기간: 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 보존합니다.</p>
                <p>4. 동의를 거부할 권리 및 불이익: 귀하는 개인정보 수집 및 이용에 동의를 거부할 수 있습니다. 단, 동의 거부 시 프로젝트 문의 및 접수가 제한될 수 있습니다.</p>
              </div>
              <button className="mt-8 w-full bg-black text-white py-3 rounded-lg cursor-pointer" tabIndex={-1} onClick={() => setShowPrivacyModal(false)}>확인</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}