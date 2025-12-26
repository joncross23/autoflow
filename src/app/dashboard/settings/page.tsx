"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Loader2, LogOut, Lock, Download } from "lucide-react";
import { useUser } from "@/hooks";
import { useToast } from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/shared";
import { getIdeas, getArchivedIdeas } from "@/lib/api/ideas";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: userLoading, signOut } = useUser();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const handleExportData = async () => {
    setExporting(true);
    try {
      // Fetch all user data
      const [ideas, archivedIdeas] = await Promise.all([
        getIdeas({ archived: false }),
        getArchivedIdeas(),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        ideas: [...ideas, ...archivedIdeas],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `autoflow-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast("Data exported successfully", "success");
    } catch (error) {
      console.error("Export failed:", error);
      toast("Failed to export data", "error");
    } finally {
      setExporting(false);
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-6">
      {/* Account section */}
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text)" }}>
          Account
        </h2>
        {userLoading ? (
          <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-4">
              <Avatar name={userName} size="lg" />
              <div>
                <p className="font-medium" style={{ color: "var(--text)" }}>{userName}</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
              </div>
            </div>

            {/* User details */}
            <div className="space-y-3 pt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                <div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Full name</p>
                  <p className="text-sm" style={{ color: "var(--text)" }}>{userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                <div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Email</p>
                  <p className="text-sm" style={{ color: "var(--text)" }}>{user.email}</p>
                </div>
              </div>
            </div>

            {/* Sign out button */}
            <div className="pt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
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
          <p style={{ color: "var(--text-muted)" }}>
            Not signed in
          </p>
        )}
      </section>

      {/* Password section - only show if user is signed in */}
      {user && (
        <section className="card">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text)" }}>
            Change Password
          </h2>

          {passwordError && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--error-muted)",
                border: "1px solid var(--error)",
                color: "var(--error)",
              }}
            >
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--success-muted)",
                border: "1px solid var(--success)",
                color: "var(--success)",
              }}
            >
              Password updated successfully
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text)" }}
              >
                New password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--text-muted)" }}
                />
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
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text)" }}
              >
                Confirm new password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--text-muted)" }}
                />
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

      {/* Data & Privacy section */}
      {user && (
        <section className="card">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text)" }}>
            Data & Privacy
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                Download a copy of all your ideas and data in JSON format.
              </p>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="btn btn-outline flex items-center gap-2"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {exporting ? "Exporting..." : "Export My Data"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
