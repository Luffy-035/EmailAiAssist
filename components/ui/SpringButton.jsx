"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const C = '#D97757'; // primary color (coral/orange)

export function SpringButton({ children, onClick, className = "", primary = true, icon = true }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-bold transition-all duration-300 shadow-md ${
        primary
          ? "text-white"
          : "bg-white text-[#D97757] border border-[#D97757]/20"
      } ${className}`}
      style={{ background: primary ? C : undefined }}
    >
      {children}
      {icon && (
        <motion.div
          initial={{ x: 0, opacity: 0.8 }}
          whileHover={{ x: 5, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <ArrowRight className="w-4 h-4" />
        </motion.div>
      )}
    </motion.button>
  );
}
