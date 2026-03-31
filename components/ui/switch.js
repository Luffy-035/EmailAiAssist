"use client";

import { motion } from "framer-motion";

export const Switch = ({ checked, onCheckedChange }) => {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]/40 ${
        checked ? "bg-[#D97757]" : "bg-gray-100"
      }`}
    >
      <motion.span
        animate={{ x: checked ? 20 : 4 }}
        className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-all"
      />
    </button>
  );
};
