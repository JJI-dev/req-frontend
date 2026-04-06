import React from "react";

export const getHighlightedText = (title: string, colorClass: string) => {
  const keywords = ["어떤 프로젝트", "어떤 서비스", "이름", "착수일", "예산범위", "정보", "담당자"];
  let result: React.ReactNode = title;

  keywords.forEach((keyword) => {
    if (title.includes(keyword)) {
      const parts = title.split(keyword);
      result = React.createElement(
        React.Fragment,
        null,
        parts[0],
        React.createElement("span", { className: colorClass }, keyword),
        parts[1]
      );
    }
  });
  return result;
};