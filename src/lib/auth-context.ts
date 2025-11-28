import { AsyncLocalStorage } from "async_hooks";

export type AuthContext = {
  userId: string;
  email: string;
  orgId: string | null;
  roles: ("admin" | "user")[];
};

export const authContextStorage = new AsyncLocalStorage<AuthContext>();

export function setAuthContext(context: AuthContext): void {
  authContextStorage.enterWith(context);
}

export function getAuthContext(): AuthContext {
  const context = authContextStorage.getStore();
  if (!context) {
    throw new Error(
      "Auth context not available. Ensure this is called within an authenticated request."
    );
  }
  return context;
}
