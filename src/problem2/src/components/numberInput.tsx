import { useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";

interface NumberInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function NumberInput({
  name,
  label,
  placeholder,
  value,
  onChange,
}: NumberInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const validateRule = (value: number) => {
    return value > 0 ? true : "Value must be greater than 0";
  };
  return (
    <div className="w-full">
      <label className="flex flex-col h-full">
        {label}
        <motion.input
          type="number"
          placeholder={placeholder}
          value={value}
          {...register(name, {
            required: "This field is required",
            valueAsNumber: true,
            validate: validateRule,
            onChange: (e) => onChange(e),
          })}
          className="text-white w-full rounded p-2 border border-transparent outline-none focus:border-indigo-500 focus:shadow-md transition-all"
          whileFocus={{
            boxShadow: "0 0 8px rgba(99, 102, 241, 0.8)",
            transition: { ease: "easeInOut" },
          }}
        />
        <AnimatePresence>
          {errors[name] && (
            <motion.span
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-red-500 font-bold text-sm"
            >
              {errors[name]?.message?.toString()}
            </motion.span>
          )}
        </AnimatePresence>
      </label>
    </div>
  );
}
