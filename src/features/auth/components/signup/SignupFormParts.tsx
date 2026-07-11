import { Eye, EyeOff } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import Spinner from "@/shared/ui/Spinner";

import {
  getSignupFieldDescribedBy,
  getSignupFieldErrorId,
} from "@/features/auth/lib/signupFieldA11y";

export function SignupStepButton({
  children,
  disabled,
  isPending,
}: {
  children: string;
  disabled?: boolean;
  isPending?: boolean;
}) {
  return (
    <Button
      fullWidth
      type="submit"
      disabled={disabled || isPending}
      className="mx-auto h-12 max-w-[19.6875rem] text-base font-semibold"
      leftIcon={isPending ? <Spinner size="small" /> : undefined}
    >
      {children}
    </Button>
  );
}

export function SignupRootError({
  message,
}: {
  message?: string | null;
}) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="mt-3 text-center text-sm text-point-red">
      {message}
    </p>
  );
}

export function PasswordField({
  name,
  label,
  placeholder,
  visible,
  onVisibleChange,
}: {
  name: "password" | "passwordConfirm";
  label: string;
  placeholder: string;
  visible: boolean;
  onVisibleChange: (value: boolean) => void;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const error = errors[name]?.message;

  return (
    <FormField
      htmlFor={name}
      label={label}
      required
      error={error}
      errorId={getSignupFieldErrorId(name)}
      labelClassName="mb-3 text-[15px] font-semibold leading-5"
    >
      <div className="relative">
        <Input
          id={name}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          placeholder={placeholder}
          className="pr-12"
          invalid={Boolean(error)}
          aria-describedby={getSignupFieldDescribedBy(name, Boolean(error))}
          {...register(name)}
        />
        <button
          type="button"
          aria-label={visible ? `${label} 숨기기` : `${label} 보기`}
          className="absolute top-1/2 right-4 flex size-6 -translate-y-1/2 items-center justify-center text-text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() => onVisibleChange(!visible)}
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
    </FormField>
  );
}
