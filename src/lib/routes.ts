export const routes = {
  home: "/",
  terms: "/terms",
  privacy: "/privacy",

  auth: {
    signIn: "/signin",
    signUp: "/signup",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    verify: "/verify",
  },

  dashboard: "/dashboard",
  settings: "/settings",

  organization: {
    create: "/create-organization",
    acceptInvite: "/accept-invite",
    settings: "/settings/organization",
  },

  api: {
    organization: {
      root: "/api/organization",
      current: "/api/organization/current",
      switch: "/api/organization/switch",
      byId: "/api/organization/:orgId",
      members: "/api/organization/:orgId/members",
      invitations: "/api/organization/:orgId/invitations",
    },
    invitations: {
      accept: "/api/invitations/accept",
    },
    copilotKit: "/api/copilotkit",
  },
} as const;

type RouteParams = {
  [key: string]: string | number | boolean;
};

export function getRoute(
  path: string,
  params?: RouteParams,
  absolute: boolean = false
): string {
  let url = path;

  // Replace dynamic params like :orgId
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string" || typeof value === "number") {
        url = url.replace(`:${key}`, String(value));
      }
    });

    // Add query params (non-path params)
    const usedParams = new Set(
      (path.match(/:\w+/g) || []).map((p) => p.slice(1))
    );
    const queryParams = Object.entries(params)
      .filter(([key]) => !usedParams.has(key))
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");

    if (queryParams) {
      url += `?${queryParams}`;
    }
  }

  return absolute
    ? `${process.env.APP_URL || "http://localhost:3000"}${url}`
    : url;
}
