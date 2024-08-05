import { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { CurrencyConfig } from "../types";

type DropdownInputProps = {
  label?: string;
  name: string;
  list: CurrencyConfig[];
};

export default function DropdownButton({
  label,
  name,
  list,
}: DropdownInputProps) {
  const { register, setValue, watch } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItem = watch(name)?.currency;

  // Register the field in the form
  useEffect(() => {
    register(name);
  }, [register, name]);

  const handleSelect = (item: CurrencyConfig) => {
    setValue(name, item);
    setIsOpen(false);
  };

  // Close the dropdown if clicking outside of it or hitting "Escape"
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const containerVariants = {
    hidden: { height: 0 },
    visible: {
      height: "320px",
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div ref={dropdownRef} className="relative sm:w-1/4">
      <label>
        {label}
        <button
          type="button"
          className="text-left bg-slate-400 bg-opacity-30 rounded-md shadow-sm flex justify-center items-center w-full py-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedItem && (
            <>
              <img
                src={`/${selectedItem}.svg`}
                alt={selectedItem}
                className="inline-block size-6 mr-2"
              />
              {selectedItem}
            </>
          )}
        </button>
      </label>
      {/**Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto w-full sm:w-max"
          >
            {list.map((item) => (
              <motion.li
                key={item.currency}
                onClick={() => handleSelect(item)}
                variants={itemVariants}
                className="flex items-center px-1 sm:p-4 space-y-2 cursor-pointer hover:bg-gray-200 text-black"
              >
                <img
                  src={`/${item.currency}.svg`}
                  alt={item.currency}
                  className="inline-block size-10 mr-2"
                />
                <div>
                  <p className="font-bold">{item.currency}</p>
                  <span className="block text-sm text-slate-500">
                    {item.price}
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
