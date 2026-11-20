"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { User, Lock, Phone, Mail, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDonorProfileAction, changePasswordAction } from "@/actions/auth";

interface DonorProfileFormProps {
  initialName: string;
  initialPhone: string;
  email: string;
  hasPassword: boolean;
}

export function DonorProfileForm({
  initialName,
  initialPhone,
  email,
  hasPassword,
}: DonorProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [isProfilePending, startProfileTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startProfileTransition(async () => {
      const res = await updateDonorProfileAction({ name, phone });
      if (res.success) {
        toast.success("Profile details updated successfully!");
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    startPasswordTransition(async () => {
      const res = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Failed to change password");
      }
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Profile Details Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white">
              <User className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Account Details</CardTitle>
              <CardDescription className="text-xs">
                Update your contact details for receipts and sponsorship communication.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="donorName" className="text-xs font-semibold">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="donorName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="donorEmail" className="text-xs font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="donorEmail"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted pl-9 text-muted-foreground cursor-not-allowed text-xs"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Email is linked to your login and verified gift history.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="donorPhone" className="text-xs font-semibold">
                Phone Number (optional)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="donorPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="pl-9 text-xs"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Used for Mobile Money receipt verification and urgent child updates.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isProfilePending}
              size="sm"
              className="bg-brand-navy hover:bg-brand-navy/90 text-white font-medium"
            >
              {isProfilePending ? "Saving Changes…" : "Update Details"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security & Password Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Security &amp; Password</CardTitle>
              <CardDescription className="text-xs">
                {hasPassword
                  ? "Change your password to keep your donor account protected."
                  : "Set a password to enable email & password sign in alongside OAuth."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {hasPassword && (
              <div className="space-y-1.5">
                <Label htmlFor="currentPasswordInput" className="text-xs font-semibold">
                  Current Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="currentPasswordInput"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="newPasswordInput" className="text-xs font-semibold">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="newPasswordInput"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPasswordInput" className="text-xs font-semibold">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="confirmPasswordInput"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPasswordPending}
              size="sm"
              variant="outline"
              className="border-brand-navy/30 text-brand-navy hover:bg-brand-navy/5 font-medium"
            >
              {isPasswordPending ? "Updating Password…" : "Save New Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
