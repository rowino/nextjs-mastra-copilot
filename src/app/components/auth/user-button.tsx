/**
 * UserButton Component
 *
 * Displays user avatar, name, and role with dropdown menu.
 * Includes profile link and sign out action.
 */

"use client";

import { UserButton as BetterAuthUserButton } from "@daveyplate/better-auth-ui";

export function UserButton() {
  return <BetterAuthUserButton />;
}
