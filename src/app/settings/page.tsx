"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { User, Mail, Loader2, LogOut, Lock } from "lucide-react";
import { useUser } from "@/hooks";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/shared";

// Dynamically import ThemeToggle to avoid SSR issues with useTheme
const ThemeToggle = dynamic(
  () => import("@/components/theme/ThemeToggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: userLoading, signOut } = useUser();
  const [signingOut, setSigningOut] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push("/login");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setUpdatingPassword(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
      setUpdatingPassword(false);
      return;
    }

    setPasswordSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    setUpdatingPassword(false);
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customise your AutoFlow experience
        </p>
      </header>

      {/* Account section */}
      <section className="card mb-6">
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        {userLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-4">
              <Avatar name={userName} size="lg" />
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* User details */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full name</p>
                  <p className="text-sm">{userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Sign out button */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="btn btn-outline flex items-center gap-2"
              >
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Not signed in
          </p>
        )}
      </section>

      {/* Password section - only show if user is signed in */}
      {user && (
        <section className="card mb-6">
          <h2 className="mb-4 text-lg font-semibold">Change Password</h2>

          {passwordError && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
              Password updated successfully
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1.5">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input w-full pl-10"
                  disabled={updatingPassword}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="input w-full pl-10"
                  disabled={updatingPassword}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updatingPassword || !newPassword || !confirmPassword}
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </section>
      )}

      {/* Theme section */}
      <section className="card mb-6">
        <h2 className="mb-4 text-lg font-semibold">Theme</h2>
        <ThemeToggle />
      </section>

      {/* Data section placeholder */}
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Data & Privacy</h2>
        <p className="text-muted-foreground">
          Export and privacy controls coming soon
        </p>
      </section>
    </div>
  );
}
