"use client";
import { motion, Variants } from "framer-motion";

export default function SuccessView() {
  const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  return (
    <main className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white text-black p-6 overflow-hidden">
      <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#3A86FF]/10 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-[#FB4C4C]/10 blur-[100px] pointer-events-none"></div>

      <motion.div className="text-center flex flex-col items-center z-10 w-full" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-8 leading-tight">성공적으로 <br/> 접수 완료되었습니다!</motion.h1>
        <motion.div variants={itemVariants} className="text-gray-400 mb-12 space-y-2"><p>검토 후 3~4일 이내 연락드리겠습니다.</p><p>문의 메일 : contact@jji.kr</p></motion.div>
        <motion.p variants={itemVariants} className="font-bold mb-12 text-sm md:text-base">작성하신 요청 내용이 입력하신 이메일로 함께 발송되었습니다.</motion.p>
        <motion.div variants={itemVariants} className="flex gap-4">
          <a href="https://ne.jji.kr" className="px-8 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-black font-semibold">NE 둘러보기</a>
          <a href="https://mo.jji.kr" className="px-8 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-black font-semibold">MO 둘러보기</a>
        </motion.div>
      </motion.div>
    </main>
  );
}