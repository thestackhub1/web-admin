"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/client/components/ui/button";
import { TextInput } from "@/client/components/ui/input";
import { GlassCard } from "@/client/components/ui/premium";
import { PasscodeInput } from "@/client/components/ui/passcode-input";
import { Lock, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSetPasscode } from "@/client/hooks/use-profile";

export function PasscodeSetupClient() {
  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/dashboard/settings" className="flex items-center text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Setup Passcode
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Secure your admin account with a 6-digit PIN.
        </p>
      </div>

      <SetupForm />
    </div>
  );
}

function SetupForm() {
  const router = useRouter();

  const [step, setStep] = useState<"verify" | "create" | "confirm">("verify");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use hook for passcode setup
  const { mutate: setPasscodeApi, loading: isLoading } = useSetPasscode();

  const handleVerifyParams = async () => {
    // In a real app, we verify the password first against the backend.
    if (!password) {
      setErrors({ password: "Password is required to set a passcode" });
      return;
    }

    // Mock verify success
    setStep("create");
    setErrors({});
  };

  const handleCreate = () => {
    if (passcode.length !== 6) {
      setErrors({ passcode: "Passcode must be 6 digits" });
      return;
    }
    setStep("confirm");
    setErrors({});
  };

  const handleSubmit = async () => {
    if (passcode !== confirmPasscode) {
      setErrors({ confirmPasscode: "Passcodes do not match" });
      return;
    }

    const result = await setPasscodeApi({ passcode, password });

    if (result) {
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }
  };

  return (
    <GlassCard className="p-8">
      {step === "verify" && (
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Shield className="w-8 h-8" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Verify Identity</h3>
            <p className="text-sm text-neutral-500">Please enter your password to continue.</p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pl-10"
                required
              />
            </div>
            {errors.password && <p className="text-sm text-rose-500">{errors.password}</p>}
          </div>

          <Button onClick={handleVerifyParams} className="w-full" size="lg">
            Verify & Continue
          </Button>
        </div>
      )}

      {step === "create" && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Create Passcode</h3>
            <p className="text-sm text-neutral-500">Enter a 6-digit security code.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-center">
              <PasscodeInput
                value={passcode}
                onChange={setPasscode}
                error={!!errors.passcode}
              />
            </div>
            {errors.passcode && <p className="text-center text-sm text-rose-500">{errors.passcode}</p>}
          </div>

          <Button onClick={handleCreate} className="w-full" size="lg">
            Continue
          </Button>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Confirm Passcode</h3>
            <p className="text-sm text-neutral-500">Re-enter your 6-digit code.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-center">
              <PasscodeInput
                value={confirmPasscode}
                onChange={setConfirmPasscode}
                error={!!errors.confirmPasscode}
              />
            </div>
            {errors.confirmPasscode && <p className="text-center text-sm text-rose-500">{errors.confirmPasscode}</p>}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep("create")} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Setting..." : "Set Passcode"}
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
