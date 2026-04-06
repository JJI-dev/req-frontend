"use client";
import { motion, AnimatePresence } from "framer-motion";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="bg-white p-8 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 text-2xl cursor-pointer" onClick={onClose}>&times;</button>
            <h2 className="text-2xl font-bold mb-6">개인정보처리방침</h2>
            <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
              <p>1. 수집하는 개인정보 항목: 이름, 연락처, 이메일</p>
              <p>2. 수집 및 이용 목적: 프로젝트 문의 접수 및 상담, 견적 안내</p>
              <p>3. 보유 및 이용 기간: 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
              <p>4. 동의를 거부할 권리 및 불이익: 동의 거부 시 프로젝트 문의 접수가 제한될 수 있습니다.</p>
            </div>
            <button className="mt-8 w-full bg-black text-white py-3 rounded-lg" onClick={onClose}>확인</button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}