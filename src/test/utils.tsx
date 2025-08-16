import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TRPCClientError, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@/server/api/root";

export const api = createTRPCReact<AppRouter>();

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const createTestTRPCClient = () => {
  return api.createClient({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/api/trpc",
        transformer: superjson,
      }),
    ],
  });
};

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();
  const trpcClient = createTestTRPCClient();

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

export const createMockUser = () => ({
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  image: null,
  emailVerified: null,
});

export const createMockOrganization = () => ({
  id: "test-org-id",
  name: "Test Organization",
  ownerId: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const mockTRPCError = (
  message: string,
  code:
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "NOT_FOUND"
    | "INTERNAL_SERVER_ERROR" = "BAD_REQUEST",
) => {
  return new TRPCClientError(message, {
    result: {
      error: {
        message,
        code: -32600,
        data: {
          code,
          httpStatus:
            code === "BAD_REQUEST"
              ? 400
              : code === "UNAUTHORIZED"
                ? 401
                : code === "NOT_FOUND"
                  ? 404
                  : 500,
        },
      },
    },
  });
};
