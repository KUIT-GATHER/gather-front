import { useMutation } from "@tanstack/react-query";

import { checkPhoneAvailability } from "@/features/auth/api/auth.api";

export function usePhoneAvailabilityMutation() {
  return useMutation({
    mutationFn: checkPhoneAvailability,
  });
}
