"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm whitespace-nowrap"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}