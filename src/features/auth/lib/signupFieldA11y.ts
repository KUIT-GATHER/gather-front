export function getSignupFieldErrorId(name: string) {
  return `${name}-error`;
}

export function getSignupFieldDescribedBy(name: string, hasError: boolean) {
  return hasError ? getSignupFieldErrorId(name) : undefined;
}
