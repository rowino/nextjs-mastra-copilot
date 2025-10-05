/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        name\n        email\n        emailVerifiedAt\n        createdAt\n        updatedAt\n      }\n      accessToken\n      refreshToken\n      expiresAt\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      user {\n        id\n        name\n        email\n        emailVerifiedAt\n        createdAt\n        updatedAt\n      }\n      accessToken\n      refreshToken\n      expiresAt\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      emailVerifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.MeDocument,
    "\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input)\n  }\n": typeof types.VerifyEmailDocument,
    "\n  mutation ResendVerification {\n    resendVerification\n  }\n": typeof types.ResendVerificationDocument,
    "\n  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {\n    requestPasswordReset(input: $input)\n  }\n": typeof types.RequestPasswordResetDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input)\n  }\n": typeof types.ResetPasswordDocument,
    "\n  query PasswordPolicy {\n    passwordPolicy {\n      minLength\n      requiresUppercase\n      requiresLowercase\n      requiresNumbers\n      requiresSpecialCharacters\n    }\n  }\n": typeof types.PasswordPolicyDocument,
    "\n  query Profile {\n    profile {\n      id\n      userId\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ProfileDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      userId\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  mutation UploadAvatar($avatar: Upload!) {\n    uploadAvatar(avatar: $avatar) {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UploadAvatarDocument,
    "\n  mutation DeleteAvatar {\n    deleteAvatar {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.DeleteAvatarDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n": typeof types.ChangePasswordDocument,
    "\n  mutation DeleteAccount($input: DeleteAccountInput!) {\n    deleteAccount(input: $input)\n  }\n": typeof types.DeleteAccountDocument,
    "\n  query Settings {\n    settings {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.SettingsDocument,
    "\n  mutation UpdateSettings($input: UpdateSettingsInput!) {\n    updateSettings(input: $input) {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateSettingsDocument,
    "\n  mutation ResetSettings {\n    resetSettings {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ResetSettingsDocument,
    "\n  query Dashboard {\n    dashboard {\n      user {\n        id\n        name\n        email\n      }\n      stats {\n        totalLogins\n        lastLoginAt\n        accountAgeInDays\n      }\n      widgets {\n        id\n        type\n        title\n        data\n        order\n      }\n      recentActivities {\n        id\n        type\n        description\n        ipAddress\n        userAgent\n        createdAt\n      }\n    }\n  }\n": typeof types.DashboardDocument,
    "\n  query DashboardStats {\n    dashboardStats {\n      totalLogins\n      lastLoginAt\n      accountAgeInDays\n    }\n  }\n": typeof types.DashboardStatsDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        name\n        email\n        emailVerifiedAt\n        createdAt\n        updatedAt\n      }\n      accessToken\n      refreshToken\n      expiresAt\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      user {\n        id\n        name\n        email\n        emailVerifiedAt\n        createdAt\n        updatedAt\n      }\n      accessToken\n      refreshToken\n      expiresAt\n    }\n  }\n": types.RegisterDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      emailVerifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n": types.MeDocument,
    "\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input)\n  }\n": types.VerifyEmailDocument,
    "\n  mutation ResendVerification {\n    resendVerification\n  }\n": types.ResendVerificationDocument,
    "\n  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {\n    requestPasswordReset(input: $input)\n  }\n": types.RequestPasswordResetDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input)\n  }\n": types.ResetPasswordDocument,
    "\n  query PasswordPolicy {\n    passwordPolicy {\n      minLength\n      requiresUppercase\n      requiresLowercase\n      requiresNumbers\n      requiresSpecialCharacters\n    }\n  }\n": types.PasswordPolicyDocument,
    "\n  query Profile {\n    profile {\n      id\n      userId\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n": types.ProfileDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      userId\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  mutation UploadAvatar($avatar: Upload!) {\n    uploadAvatar(avatar: $avatar) {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n": types.UploadAvatarDocument,
    "\n  mutation DeleteAvatar {\n    deleteAvatar {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n": types.DeleteAvatarDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n": types.ChangePasswordDocument,
    "\n  mutation DeleteAccount($input: DeleteAccountInput!) {\n    deleteAccount(input: $input)\n  }\n": types.DeleteAccountDocument,
    "\n  query Settings {\n    settings {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n": types.SettingsDocument,
    "\n  mutation UpdateSettings($input: UpdateSettingsInput!) {\n    updateSettings(input: $input) {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateSettingsDocument,
    "\n  mutation ResetSettings {\n    resetSettings {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n": types.ResetSettingsDocument,
    "\n  query Dashboard {\n    dashboard {\n      user {\n        id\n        name\n        email\n      }\n      stats {\n        totalLogins\n        lastLoginAt\n        accountAgeInDays\n      }\n      widgets {\n        id\n        type\n        title\n        data\n        order\n      }\n      recentActivities {\n        id\n        type\n        description\n        ipAddress\n        userAgent\n        createdAt\n      }\n    }\n  }\n": types.DashboardDocument,
    "\n  query DashboardStats {\n    dashboardStats {\n      totalLogins\n      lastLoginAt\n      accountAgeInDays\n    }\n  }\n": types.DashboardStatsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        name\n        email\n        emailVerifiedAt\n        createdAt\n        updatedAt\n      }\n      accessToken\n      refreshToken\n      expiresAt\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        name\n        email\n        emailVerifiedAt\n        createdAt\n        updatedAt\n      }\n      accessToken\n      refreshToken\n      expiresAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      user {\n        id\n        name\n        email\n        emailVerifiedAt\n        createdAt\n        updatedAt\n      }\n      accessToken\n      refreshToken\n      expiresAt\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      user {\n        id\n        name\n        email\n        emailVerifiedAt\n        createdAt\n        updatedAt\n      }\n      accessToken\n      refreshToken\n      expiresAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      name\n      email\n      emailVerifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      name\n      email\n      emailVerifiedAt\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input)\n  }\n"): (typeof documents)["\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResendVerification {\n    resendVerification\n  }\n"): (typeof documents)["\n  mutation ResendVerification {\n    resendVerification\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {\n    requestPasswordReset(input: $input)\n  }\n"): (typeof documents)["\n  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {\n    requestPasswordReset(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input)\n  }\n"): (typeof documents)["\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PasswordPolicy {\n    passwordPolicy {\n      minLength\n      requiresUppercase\n      requiresLowercase\n      requiresNumbers\n      requiresSpecialCharacters\n    }\n  }\n"): (typeof documents)["\n  query PasswordPolicy {\n    passwordPolicy {\n      minLength\n      requiresUppercase\n      requiresLowercase\n      requiresNumbers\n      requiresSpecialCharacters\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Profile {\n    profile {\n      id\n      userId\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query Profile {\n    profile {\n      id\n      userId\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      userId\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      userId\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UploadAvatar($avatar: Upload!) {\n    uploadAvatar(avatar: $avatar) {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UploadAvatar($avatar: Upload!) {\n    uploadAvatar(avatar: $avatar) {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteAvatar {\n    deleteAvatar {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteAvatar {\n    deleteAvatar {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n"): (typeof documents)["\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteAccount($input: DeleteAccountInput!) {\n    deleteAccount(input: $input)\n  }\n"): (typeof documents)["\n  mutation DeleteAccount($input: DeleteAccountInput!) {\n    deleteAccount(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Settings {\n    settings {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query Settings {\n    settings {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateSettings($input: UpdateSettingsInput!) {\n    updateSettings(input: $input) {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateSettings($input: UpdateSettingsInput!) {\n    updateSettings(input: $input) {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetSettings {\n    resetSettings {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation ResetSettings {\n    resetSettings {\n      id\n      userId\n      theme\n      language\n      timezone\n      notificationsEmail\n      notificationsPush\n      notificationsSms\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Dashboard {\n    dashboard {\n      user {\n        id\n        name\n        email\n      }\n      stats {\n        totalLogins\n        lastLoginAt\n        accountAgeInDays\n      }\n      widgets {\n        id\n        type\n        title\n        data\n        order\n      }\n      recentActivities {\n        id\n        type\n        description\n        ipAddress\n        userAgent\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query Dashboard {\n    dashboard {\n      user {\n        id\n        name\n        email\n      }\n      stats {\n        totalLogins\n        lastLoginAt\n        accountAgeInDays\n      }\n      widgets {\n        id\n        type\n        title\n        data\n        order\n      }\n      recentActivities {\n        id\n        type\n        description\n        ipAddress\n        userAgent\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DashboardStats {\n    dashboardStats {\n      totalLogins\n      lastLoginAt\n      accountAgeInDays\n    }\n  }\n"): (typeof documents)["\n  query DashboardStats {\n    dashboardStats {\n      totalLogins\n      lastLoginAt\n      accountAgeInDays\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;