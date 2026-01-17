"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button, Input, Card, PasscodeInput, LoadingComponent } from "@/client/components/ui";
import { AuthLayout } from "@/client/components/layout/auth-layout";
import { useSignin, useLogout } from "@/client/hooks";
import { ArrowRight, Sparkles, Lock, Mail, User, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <LoadingComponent size="xl" message="Loading..." />
    </div>
  );
}

// Validation schemas
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number");
const emailSchema = z.string().email("Invalid email address");

function LoginForm() {
  // Use signin and logout hooks
  const { mutate: signin, loading: isLoading } = useSignin();
  const { mutate: logout } = useLogout();
  const searchParams = useSearchParams();

  // Check for errors from middleware
  const errorParam = searchParams.get("error");
  const reasonParam = searchParams.get("reason");

  // Form State
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passcode, setPasscode] = React.useState("");
  const [authMethod, setAuthMethod] = React.useState<"passcode" | "password">("password"); // Default to password for admins
  const [_isAutoDetected, setIsAutoDetected] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Handle unauthorized access from middleware
  React.useEffect(() => {
    if (errorParam === "access_denied" && reasonParam === "unauthorized_role") {
      // Automatically log out to clear any invalid session
      logout();
      toast.error("Access denied. Students are not allowed to access this portal.", {
        description: "Please use the Student Portal for your exams.",
        duration: 5000,
      });
    }
  }, [errorParam, reasonParam, logout]);

  // Auto-detect Auth Method based on input
  React.useEffect(() => {
    const isEmail = identifier.includes("@");
    const isPhone = /^[0-9]/.test(identifier) && identifier.replace(/\D/g, "").length > 5;

    // Default to Password for both Email and Phone as per user request
    if (isEmail) {
      setAuthMethod("password");
      setIsAutoDetected(true);
    } else if (isPhone) {
      setAuthMethod("password");
      setIsAutoDetected(true);
    }
  }, [identifier]);

  const validate = React.useCallback(() => {
    const newErrors: Record<string, string> = {};

    const isEmail = identifier.includes("@");

    if (isEmail) {
      const emailResult = emailSchema.safeParse(identifier);
      if (!emailResult.success) {
        newErrors.identifier = "Invalid email address";
      }
    } else {
      // Assume phone if not email
      const phoneClean = identifier.replace(/\D/g, "");
      const phoneResult = phoneSchema.safeParse(phoneClean);
      if (!phoneResult.success) {
        // If it doesn't look like a valid phone either
        if (identifier.length > 0) {
          newErrors.identifier = "Invalid phone number";
        } else {
          newErrors.identifier = "Email or Phone is required";
        }
      }
    }

    if (authMethod === "passcode") {
      if (passcode.length !== 6) {
        newErrors.passcode = "Passcode must be 6 digits";
      }
    } else {
      if (password.length < 1) {
        newErrors.password = "Password is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [identifier, passcode, password, authMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const isEmail = identifier.includes("@");

    // Construct payload
    let payload: any = {};

    if (isEmail) {
      payload = { email: identifier, password };
      if (authMethod === "passcode") {
        payload = { email: identifier, passcode };
      }
    } else {
      const phone = identifier.replace(/\D/g, "");
      if (authMethod === "password") {
        payload = { phone, password };
      } else {
        payload = { phone, passcode };
      }
    }

    const result = await signin(payload);

    if (result) {
      // Use full page navigation to ensure cookies are properly processed
      window.location.href = "/dashboard";
    }
  };

  return (
    <AuthLayout variant="login">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center lg:text-left mb-8"
      >
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400">
          Enter your details to access the admin portal
        </p>

        {errorParam === "access_denied" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-warning-50 border border-warning-200 text-warning-800 dark:bg-warning-950/30 dark:border-warning-800 dark:text-warning-400"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-sm font-medium text-left">
              Students are not allowed to access this portal. Please use the Student Portal.
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card
          variant="elevated"
          padding="lg"
          className="border border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-glow-card hover:shadow-glow-card-hover transition-all duration-300 transform"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identifier Input */}
            <div className="space-y-1">
              <Input
                label="Email or Mobile Number"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.identifier;
                      return next;
                    });
                  }
                }}
                placeholder="Enter email or mobile number"
                required
                leftIcon={<Mail className="h-4 w-4" />}
                autoComplete="username"
                error={errors.identifier}
                className="transition-all duration-300"
              />
            </div>

            {/* Dynamic Second Factor */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {authMethod === "passcode" ? "Passcode" : "Password"}
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMethod(authMethod === "passcode" ? "password" : "passcode")}
                  className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors"
                >
                  {authMethod === "passcode" ? "Use Password" : "Use Passcode"}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {authMethod === "passcode" ? (
                  <motion.div
                    key="passcode"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PasscodeInput
                      value={passcode}
                      onChange={(value) => {
                        setPasscode(value);
                        if (errors.passcode) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.passcode;
                            return next;
                          });
                        }
                      }}
                      error={!!errors.passcode}
                    />
                    {errors.passcode && (
                      <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                        {errors.passcode}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.password;
                            return next;
                          });
                        }
                      }}
                      placeholder="Enter your password"
                      leftIcon={<Lock className="h-4 w-4" />}
                      error={errors.password}
                      autoComplete="current-password"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Forgot Passcode / Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast.info(authMethod === "passcode" ? "Passcode reset not available." : "Please contact support to reset password.")}
                className="text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                {authMethod === "passcode" ? "Forgot Passcode?" : "Forgot Password?"}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-primary-600 to-insight-600 hover:from-primary-700 hover:to-insight-700 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] transition-all duration-300"
              size="lg"
              isLoading={isLoading}
              rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />
            <span className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
              OR
            </span>
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />
          </div>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600 dark:text-neutral-400 mb-3">
              Don't have an account?
            </p>
            <Link href="/signup" className="inline-block w-full">
              <Button variant="secondary" className="w-full border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/10 text-neutral-700 dark:text-neutral-300" size="md">
                <Sparkles className="h-4 w-4 mr-2 text-warning-500" />
                Create Account
              </Button>
            </Link>
          </div>

          {/* Secure badge */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              <Lock className="h-3 w-3" />
              SECURE & PRIVATE
            </div>
          </div>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
