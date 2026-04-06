import React from "react";

export type RequestType = "creative" | "product" | null;

export interface QuestionItem {
  id: string;
  title: string;
  options?: string[];
  sub?: React.ReactNode;
  subRender?: (colorClass: string) => React.ReactNode;
  placeholder?: string;
  isDateRange?: boolean;
  isFile?: boolean;
  isContact?: boolean;
}

export interface Theme {
  color: string;
  border: string;
  bgHover: string;
  bgActive: string;
  items: QuestionItem[];
}

export const availableSlots = 3;

export const QUESTIONS: Record<"creative" | "product", Theme> = {
  creative: {
    color: "text-[#FB4C4C]", border: "border-[#FB4C4C]", bgHover: "hover:bg-[#FB4C4C]/8 hover:text-[#FB4C4C]", bgActive: "bg-[#FB4C4C]/8 text-[#FB4C4C] border-transparent",
    items: [
      { id: "service", title: "어떤 프로젝트를\n문의하고 싶으신가요?", options: ["일러스트 커미션", "3D", "그래픽", "영상", "디자인", "썸네일", "기타"], subRender: (colorClass) => (<>*현재 슬롯은 <span className={`font-bold ${colorClass}`}>{availableSlots}</span>개 남았습니다! <a href="https://ne.jji.kr/about" target="_blank" rel="noreferrer" tabIndex={-1} className="text-black underline underline-offset-2 hover:opacity-70 transition-opacity cursor-pointer">작업과정, 안내사항</a> 및 <a href="https://ne.jji.kr" target="_blank" rel="noreferrer" tabIndex={-1} className="text-black underline underline-offset-2 hover:opacity-70 transition-opacity cursor-pointer">작업물</a> 참고 부탁드립니다!</>) },
      { id: "name", title: "프로젝트의 이름을\n알려주세요!", placeholder: "프로젝트 이름을 입력해 주세요." },
      { id: "date", title: "프로젝트의 착수일이\n어떻게 되나요?", isDateRange: true },
      { id: "budget", title: "프로젝트의 예산범위를\n선택해주세요!", options: ["5천원 ~ 1만원", "1만원 ~ 3만원", "3만원 ~ 5만원", "5만원 ~ 10만원", "10만원 ~ 20만원", "30만원 ~ 50만원", "50만원 이상"] },
      { id: "info", title: "프로젝트의 정보를\n알려주세요!", isFile: true, placeholder: "프로젝트에 대해 알고 싶어요." },
      { id: "contact", title: "담당자의 정보를\n입력해주세요!", isContact: true },
    ],
  },
  product: {
    color: "text-[#3A86FF]", border: "border-[#3A86FF]", bgHover: "hover:bg-[#3A86FF]/8 hover:text-[#3A86FF]", bgActive: "bg-[#3A86FF]/8 text-[#3A86FF] border-transparent",
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