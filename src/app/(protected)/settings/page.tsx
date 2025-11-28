"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { authConfig } from "@/lib/auth-config";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import {
  Key,
  Shield,
  Smartphone,
  Trash2,
  Plus,
  User,
  Link2,
  Loader2,
  Check,
  X,
  Monitor,
  LogOut,
  Copy,
  Github,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface Session {
  id: string;
  token: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
}

interface Passkey {
  id: string;
  name: string | null;
  createdAt: Date;
}

export default function SettingsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    totpURI: string;
    backupCodes: string[];
  } | null>(null);
  const [disableTwoFactorPassword, setDisableTwoFactorPassword] = useState("");
  const [showDisableTwoFactorDialog, setShowDisableTwoFactorDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [showAddPasskeyDialog, setShowAddPasskeyDialog] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const [passkeyToDelete, setPasskeyToDelete] = useState<Passkey | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionToken, setCurrentSessionToken] = useState<string>("");

  const [connectedAccounts, setConnectedAccounts] = useState<{
    github: boolean;
    google: boolean;
  }>({ github: false, google: false });

  const loadSessions = useCallback(async () => {
    try {
      const result = await authClient.listSessions();
      if (result.data) {
        setSessions(result.data as Session[]);
        const current = result.data.find(
          (s) => s.token === session?.session?.token
        );
        if (current) {
          setCurrentSessionToken(current.token);
        }
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  }, [session?.session?.token]);

  const loadPasskeys = useCallback(async () => {
    try {
      const result = await authClient.passkey.listUserPasskeys();
      if (result.data) {
        setPasskeys(result.data as Passkey[]);
      }
    } catch (error) {
      console.error("Failed to load passkeys:", error);
    }
  }, []);

  const loadConnectedAccounts = useCallback(async () => {
    try {
      const result = await authClient.listAccounts();
      if (result.data) {
        const accounts = result.data;
        setConnectedAccounts({
          github: accounts.some((a) => a.providerId === "github"),
          google: accounts.some((a) => a.providerId === "google"),
        });
      }
    } catch (error) {
      console.error("Failed to load connected accounts:", error);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setTwoFactorEnabled(session.user.twoFactorEnabled || false);
    }
  }, [session]);

  useEffect(() => {
    if (activeTab === "security") {
      loadSessions();
      if (authConfig.passkey) {
        loadPasskeys();
      }
    }
  }, [activeTab, loadSessions, loadPasskeys]);

  useEffect(() => {
    if (activeTab === "accounts") {
      loadConnectedAccounts();
    }
  }, [activeTab, loadConnectedAccounts]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.updateUser({ name: name.trim() });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to change password");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableTwoFactor = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.twoFactor.enable({
        password: currentPassword,
      });
      if (result.data) {
        setTwoFactorData({
          totpURI: result.data.totpURI,
          backupCodes: result.data.backupCodes,
        });
        setShowTwoFactorDialog(true);
      } else if (result.error) {
        toast.error(result.error.message || "Failed to enable 2FA");
      }
    } catch (error) {
      toast.error("Failed to enable 2FA");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTwoFactor = async (code: string) => {
    const result = await authClient.twoFactor.verifyTotp({ code });
    if (result.error) {
      throw new Error(result.error.message || "Verification failed");
    }
    setTwoFactorEnabled(true);
    setShowTwoFactorDialog(false);
    setTwoFactorData(null);
    setCurrentPassword("");
    toast.success("Two-factor authentication enabled");
  };

  const handleDisableTwoFactor = async () => {
    if (!disableTwoFactorPassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.twoFactor.disable({
        password: disableTwoFactorPassword,
      });
      setTwoFactorEnabled(false);
      setShowDisableTwoFactorDialog(false);
      setDisableTwoFactorPassword("");
      toast.success("Two-factor authentication disabled");
    } catch (error) {
      toast.error("Failed to disable 2FA");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!currentPassword) {
      toast.error("Please enter your password first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.twoFactor.generateBackupCodes({
        password: currentPassword,
      });
      if (result.data?.backupCodes) {
        setBackupCodes(result.data.backupCodes);
        setShowBackupCodesDialog(true);
        toast.success("New backup codes generated");
      }
    } catch (error) {
      toast.error("Failed to regenerate backup codes");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setBackupCodesCopied(true);
      setTimeout(() => setBackupCodesCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy backup codes:", error);
    }
  };

  const handleAddPasskey = async () => {
    if (!passkeyName.trim()) {
      toast.error("Please enter a name for the passkey");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.passkey.addPasskey({
        name: passkeyName.trim(),
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      await loadPasskeys();
      setShowAddPasskeyDialog(false);
      setPasskeyName("");
      toast.success("Passkey added successfully");
    } catch (error) {
      toast.error("Failed to add passkey");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePasskey = async () => {
    if (!passkeyToDelete) return;

    setIsLoading(true);
    try {
      await authClient.passkey.deletePasskey({ id: passkeyToDelete.id });
      await loadPasskeys();
      setPasskeyToDelete(null);
      toast.success("Passkey deleted");
    } catch (error) {
      toast.error("Failed to delete passkey");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    setIsLoading(true);
    try {
      await authClient.revokeSession({ token: sessionToken });
      await loadSessions();
      toast.success("Session revoked");
    } catch (error) {
      toast.error("Failed to revoke session");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    setIsLoading(true);
    try {
      await authClient.revokeOtherSessions();
      await loadSessions();
      toast.success("All other sessions revoked");
    } catch (error) {
      toast.error("Failed to revoke sessions");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkSocial = async (provider: "github" | "google") => {
    try {
      await authClient.linkSocial({
        provider,
        callbackURL: window.location.href,
      });
    } catch (error) {
      toast.error(`Failed to link ${provider}`);
      console.error(error);
    }
  };

  const handleUnlinkAccount = async (providerId: string) => {
    setIsLoading(true);
    try {
      await authClient.unlinkAccount({ providerId });
      await loadConnectedAccounts();
      toast.success("Account unlinked");
    } catch (error) {
      toast.error("Failed to unlink account");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return "Unknown device";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown browser";
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-[#00ff88]" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#00ff88] font-mono uppercase tracking-wider">Account Settings</h1>
        <p className="text-[#888888] mt-2 font-mono text-sm">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-[#2a2a2a] rounded-none p-0 mb-8 h-auto gap-0">
          <TabsTrigger
            value="profile"
            className="bg-transparent data-[state=active]:bg-transparent text-[#888888] data-[state=active]:text-[#00ff88] border-b-2 border-transparent data-[state=active]:border-[#00ff88] rounded-none px-6 py-3 font-mono uppercase text-xs tracking-wider transition-all duration-150 ease-linear relative -mb-[1px]"
          >
            <User className="size-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="bg-transparent data-[state=active]:bg-transparent text-[#888888] data-[state=active]:text-[#00ff88] border-b-2 border-transparent data-[state=active]:border-[#00ff88] rounded-none px-6 py-3 font-mono uppercase text-xs tracking-wider transition-all duration-150 ease-linear relative -mb-[1px]"
          >
            <Shield className="size-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="accounts"
            className="bg-transparent data-[state=active]:bg-transparent text-[#888888] data-[state=active]:text-[#00ff88] border-b-2 border-transparent data-[state=active]:border-[#00ff88] rounded-none px-6 py-3 font-mono uppercase text-xs tracking-wider transition-all duration-150 ease-linear relative -mb-[1px]"
          >
            <Link2 className="size-4 mr-2" />
            Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          {/* Profile Information Section */}
          <div className="relative">
            <div className="absolute inset-x-0 top-3 border-t border-[#2a2a2a]" />
            <h2 className="relative inline-block bg-[#0a0a0a] pr-4 text-sm font-mono uppercase tracking-wider text-[#888888]">
              <User className="inline-block size-4 mr-2 mb-1" />
              Profile Information
            </h2>
          </div>

          <div className="border border-[#2a2a2a] rounded-lg p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#888888] font-mono uppercase text-xs tracking-wider">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-[#141414] border-[#2a2a2a] text-[#888888] font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#888888] font-mono uppercase text-xs tracking-wider">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#888888] focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] font-mono transition-colors duration-150 ease-linear"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[#2a2a2a]">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="bg-[#00ff88] text-[#0a0a0a] hover:bg-[#00ff88]/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="size-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="relative">
            <div className="absolute inset-x-0 top-3 border-t border-[#2a2a2a]" />
            <h2 className="relative inline-block bg-[#0a0a0a] pr-4 text-sm font-mono uppercase tracking-wider text-[#888888]">
              <Key className="inline-block size-4 mr-2 mb-1" />
              Change Password
            </h2>
          </div>

          <div className="border border-[#2a2a2a] rounded-lg p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-[#888888] font-mono uppercase text-xs tracking-wider">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#888888] focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] font-mono transition-colors duration-150 ease-linear"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-[#888888] font-mono uppercase text-xs tracking-wider">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#888888] focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] font-mono transition-colors duration-150 ease-linear"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#888888] font-mono uppercase text-xs tracking-wider">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#888888] focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] font-mono transition-colors duration-150 ease-linear"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[#2a2a2a]">
                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="bg-[#00ff88] text-[#0a0a0a] hover:bg-[#00ff88]/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="size-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-8">
          {authConfig.twoFactor && (
            <>
              <div className="relative">
                <div className="absolute inset-x-0 top-3 border-t border-[#2a2a2a]" />
                <h2 className="relative inline-block bg-[#0a0a0a] pr-4 text-sm font-mono uppercase tracking-wider text-[#888888]">
                  <Smartphone className="inline-block size-4 mr-2 mb-1" />
                  Two-Factor Authentication
                </h2>
              </div>

              <div className="border border-[#2a2a2a] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[#888888] font-mono uppercase text-xs">Status</p>
                    <p
                      className={`text-sm font-mono ${twoFactorEnabled ? "text-[#00ff88]" : "text-[#888888]"}`}
                    >
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider ${twoFactorEnabled ? "bg-[#00ff88]/20 text-[#00ff88]" : "bg-[#2a2a2a] text-[#888888]"}`}
                  >
                    {twoFactorEnabled ? "Active" : "Inactive"}
                  </div>
                </div>

                {!twoFactorEnabled ? (
                  <div className="space-y-4">
                    <p className="text-sm text-[#888888] font-mono">
                      Add an extra layer of security to your account by enabling
                      two-factor authentication.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="2faPassword" className="text-[#888888] font-mono uppercase text-xs tracking-wider">
                        Enter your password to enable 2FA
                      </Label>
                      <Input
                        id="2faPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Your password"
                        className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#888888] focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] font-mono transition-colors duration-150 ease-linear"
                      />
                    </div>
                    <Button
                      onClick={handleEnableTwoFactor}
                      disabled={isLoading || !currentPassword}
                      className="bg-[#00ff88] text-[#0a0a0a] hover:bg-[#00ff88]/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="size-4 mr-2" />
                      )}
                      Enable 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="viewCodesPassword" className="text-[#888888] font-mono uppercase text-xs tracking-wider">
                        Enter password to manage 2FA
                      </Label>
                      <Input
                        id="viewCodesPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Your password"
                        className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#888888] focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] font-mono transition-colors duration-150 ease-linear"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={handleRegenerateBackupCodes}
                        disabled={isLoading || !currentPassword}
                        className="bg-transparent hover:bg-[#2a2a2a] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                      >
                        View/Regenerate Backup Codes
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDisableTwoFactorDialog(true)}
                        disabled={isLoading}
                        className="bg-[#ff4444] hover:bg-[#ff4444]/90 text-[#0a0a0a] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                      >
                        <X className="size-4 mr-2" />
                        Disable 2FA
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {authConfig.passkey && (
            <>
              <div className="relative">
                <div className="absolute inset-x-0 top-3 border-t border-[#2a2a2a]" />
                <div className="relative flex items-center justify-between">
                  <h2 className="inline-block bg-[#0a0a0a] pr-4 text-sm font-mono uppercase tracking-wider text-[#888888]">
                    <Key className="inline-block size-4 mr-2 mb-1" />
                    Passkeys
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => setShowAddPasskeyDialog(true)}
                    className="bg-[#00ff88] text-[#0a0a0a] hover:bg-[#00ff88]/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                  >
                    <Plus className="size-4 mr-2" />
                    Add Passkey
                  </Button>
                </div>
              </div>

              <div className="border border-[#2a2a2a] rounded-lg p-6">
                {passkeys.length === 0 ? (
                  <p className="text-[#888888] text-sm font-mono">
                    No passkeys registered. Add a passkey for passwordless sign-in.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {passkeys.map((passkey) => (
                      <div
                        key={passkey.id}
                        className="flex items-center justify-between p-3 bg-[#141414] rounded border border-[#2a2a2a]"
                      >
                        <div>
                          <p className="text-[#e5e5e5] font-medium font-mono">
                            {passkey.name || "Unnamed passkey"}
                          </p>
                          <p className="text-sm text-[#888888] font-mono">
                            Added {formatDate(passkey.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPasskeyToDelete(passkey)}
                          className="text-[#ff4444] hover:text-[#ff4444] hover:bg-[#ff4444]/10 transition-colors duration-150 ease-linear"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="relative">
            <div className="absolute inset-x-0 top-3 border-t border-[#2a2a2a]" />
            <div className="relative flex items-center justify-between">
              <h2 className="inline-block bg-[#0a0a0a] pr-4 text-sm font-mono uppercase tracking-wider text-[#888888]">
                <Monitor className="inline-block size-4 mr-2 mb-1" />
                Active Sessions
              </h2>
              {sessions.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllSessions}
                  disabled={isLoading}
                  className="bg-transparent hover:bg-[#2a2a2a] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                >
                  <LogOut className="size-4 mr-2" />
                  Revoke Others
                </Button>
              )}
            </div>
          </div>

          <div className="border border-[#2a2a2a] rounded-lg p-6">
            {sessions.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-5 animate-spin text-[#00ff88]" />
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-3 bg-[#141414] rounded border border-[#2a2a2a]"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="size-5 text-[#888888]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[#e5e5e5] font-medium font-mono">
                            {parseUserAgent(sess.userAgent)}
                          </p>
                          {sess.token === currentSessionToken && (
                            <span className="px-2 py-0.5 text-xs bg-[#00ff88]/20 text-[#00ff88] rounded font-mono uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#888888] font-mono">
                          {sess.ipAddress || "Unknown IP"} ·{" "}
                          {formatDate(sess.createdAt)}
                        </p>
                      </div>
                    </div>
                    {sess.token !== currentSessionToken && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevokeSession(sess.token)}
                        disabled={isLoading}
                        className="text-[#ff4444] hover:text-[#ff4444] hover:bg-[#ff4444]/10 transition-colors duration-150 ease-linear"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-8">
          <div className="relative">
            <div className="absolute inset-x-0 top-3 border-t border-[#2a2a2a]" />
            <h2 className="relative inline-block bg-[#0a0a0a] pr-4 text-sm font-mono uppercase tracking-wider text-[#888888]">
              <Link2 className="inline-block size-4 mr-2 mb-1" />
              Connected Accounts
            </h2>
          </div>

          <div className="border border-[#2a2a2a] rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#141414] rounded border border-[#2a2a2a]">
                <div className="flex items-center gap-3">
                  <Github className="size-6 text-[#e5e5e5]" />
                  <div>
                    <p className="text-[#e5e5e5] font-medium font-mono">GitHub</p>
                    <p className="text-sm text-[#888888] font-mono">
                      {connectedAccounts.github
                        ? "Connected"
                        : "Not connected"}
                    </p>
                  </div>
                </div>
                {connectedAccounts.github ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlinkAccount("github")}
                    disabled={isLoading}
                    className="bg-transparent hover:bg-[#2a2a2a] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleLinkSocial("github")}
                    className="bg-[#00ff88] text-[#0a0a0a] hover:bg-[#00ff88]/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                  >
                    Connect
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-[#141414] rounded border border-[#2a2a2a]">
                <div className="flex items-center gap-3">
                  <Mail className="size-6 text-[#e5e5e5]" />
                  <div>
                    <p className="text-[#e5e5e5] font-medium font-mono">Google</p>
                    <p className="text-sm text-[#888888] font-mono">
                      {connectedAccounts.google
                        ? "Connected"
                        : "Not connected"}
                    </p>
                  </div>
                </div>
                {connectedAccounts.google ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlinkAccount("google")}
                    disabled={isLoading}
                    className="bg-transparent hover:bg-[#2a2a2a] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleLinkSocial("google")}
                    className="bg-[#00ff88] text-[#0a0a0a] hover:bg-[#00ff88]/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] font-mono max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#e5e5e5] font-mono uppercase tracking-wider">Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription className="text-[#888888] font-mono">
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          {twoFactorData && (
            <TwoFactorSetup
              totpURI={twoFactorData.totpURI}
              backupCodes={twoFactorData.backupCodes}
              onVerify={handleVerifyTwoFactor}
              onClose={() => {
                setShowTwoFactorDialog(false);
                setTwoFactorData(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDisableTwoFactorDialog}
        onOpenChange={setShowDisableTwoFactorDialog}
      >
        <DialogContent className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#e5e5e5] font-mono uppercase tracking-wider">Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription className="text-[#888888] font-mono">
              Enter your password to disable 2FA. This will make your account
              less secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disablePassword" className="text-[#888888] font-mono uppercase text-xs tracking-wider">
                Password
              </Label>
              <Input
                id="disablePassword"
                type="password"
                value={disableTwoFactorPassword}
                onChange={(e) => setDisableTwoFactorPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#888888] focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] font-mono transition-colors duration-150 ease-linear"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisableTwoFactorDialog(false)}
              className="bg-transparent hover:bg-[#2a2a2a] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableTwoFactor}
              disabled={isLoading || !disableTwoFactorPassword}
              className="bg-[#ff4444] hover:bg-[#ff4444]/90 text-[#0a0a0a] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              {isLoading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : null}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog}>
        <DialogContent className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#e5e5e5] font-mono uppercase tracking-wider">Backup Codes</DialogTitle>
            <DialogDescription className="text-[#888888] font-mono">
              Save these codes in a secure location. Each code can only be used
              once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-2"
                >
                  <code className="text-sm font-mono text-[#00ff88]">{code}</code>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={handleCopyBackupCodes}
              className="w-full bg-transparent hover:bg-[#2a2a2a] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              {backupCodesCopied ? (
                <>
                  <Check className="size-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-2" />
                  Copy All Codes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddPasskeyDialog} onOpenChange={setShowAddPasskeyDialog}>
        <DialogContent className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#e5e5e5] font-mono uppercase tracking-wider">Add Passkey</DialogTitle>
            <DialogDescription className="text-[#888888] font-mono">
              Give your passkey a name to identify it later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passkeyName" className="text-[#888888] font-mono uppercase text-xs tracking-wider">
                Passkey Name
              </Label>
              <Input
                id="passkeyName"
                type="text"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder="e.g., MacBook Pro"
                className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#888888] focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] font-mono transition-colors duration-150 ease-linear"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddPasskeyDialog(false);
                setPasskeyName("");
              }}
              className="bg-transparent hover:bg-[#2a2a2a] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPasskey}
              disabled={isLoading || !passkeyName.trim()}
              className="bg-[#00ff88] text-[#0a0a0a] hover:bg-[#00ff88]/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              {isLoading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              Add Passkey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!passkeyToDelete}
        onOpenChange={(open) => !open && setPasskeyToDelete(null)}
      >
        <DialogContent className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#e5e5e5] font-mono uppercase tracking-wider">Delete Passkey</DialogTitle>
            <DialogDescription className="text-[#888888] font-mono">
              Are you sure you want to delete &quot;{passkeyToDelete?.name || "this passkey"}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasskeyToDelete(null)}
              className="bg-transparent hover:bg-[#2a2a2a] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePasskey}
              disabled={isLoading}
              className="bg-[#ff4444] hover:bg-[#ff4444]/90 text-[#0a0a0a] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              {isLoading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="size-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
