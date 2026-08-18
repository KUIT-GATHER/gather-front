import { Eye, EyeOff } from "lucide-react";
import {
  useState,
  type ChangeEventHandler,
  type FocusEventHandler,
  type ReactNode,
  type Ref,
} from "react";

import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";

type PasswordFieldProps = {
  id: string;
  label: ReactNode;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  name?: string;
  inputRef?: Ref<HTMLInputElement>;
  error?: string;
  autoComplete?: string;
};

export default function PasswordField({
  id,
  label,
  required = false,
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  error,
  autoComplete = "new-password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      htmlFor={id}
      label={label}
      required={required}
      error={error}
      errorId={`${id}-error`}
      labelClassName="mb-3 text-[15px] font-semibold leading-5"
    >
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-describedby={error ? `${id}-error` : undefined}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="pr-12"
          invalid={Boolean(error)}
        />
        <button
          type="button"
          aria-label={visible ? `${label} 숨기기` : `${label} 보기`}
          className="absolute top-1/2 right-4 flex size-6 -translate-y-1/2 items-center justify-center text-text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
    </FormField>
  );
}
