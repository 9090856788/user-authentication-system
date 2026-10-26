import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes cache
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry 401/403/404 errors automatically
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false, // Never automatically retry login, OTP or mutation submissions
    },
  },
});
