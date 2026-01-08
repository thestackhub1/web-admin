"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Card } from "@/client/components/ui/card";
import { useSignup } from "@/client/hooks";
import { UserPlus, Mail, Lock, User, Phone, CheckCircle2, Building2, ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { AuthLayout } from "@/client/components/layout/auth-layout";
import { SchoolSearchModal } from "@/client/components/features/schools";
import type { School } from "@/client/api/schools";
import Link from "next/link";
import { z } from "zod";

export default function SignupPage() {
  const router = useRouter();
  
  // Use signup hook
  const { mutate: signup, loading: isLoading } = useSignup();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.name.length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!selectedSchool) newErrors.school = "Please select your school";

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email address";
      }
    }

    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await signup({
      email: formData.email || undefined,
      password: formData.password,
      name: formData.name,
      phone: formData.phone.replace(/\D/g, ""),
      school_id: selectedSchool?.id,
    });

    if (result) {
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <AuthLayout variant="register">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center lg:text-left mb-6"
      >
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
          Create Admin Account
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400">
          Join the platform to manage your school and students
        </p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                clearError("name");
              }}
              placeholder="Enter your full name"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name}
              required
            />

            {/* School Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                School Name
              </label>
              <button
                type="button"
                onClick={() => setShowSchoolModal(true)}
                className={`w-full flex items-center justify-between gap-3 h-12 px-4 rounded-xl border text-left transition-all ${errors.school
                  ? "border-rose-500"
                  : "border-neutral-200 dark:border-neutral-700"
                  } bg-white dark:bg-neutral-900 hover:border-primary-400 dark:hover:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Building2 className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span
                    className={`truncate ${selectedSchool
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-400"
                      }`}
                  >
                    {selectedSchool
                      ? `${selectedSchool.name}${selectedSchool.location_city ? `, ${selectedSchool.location_city}` : ""}`
                      : "Select your school"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
              </button>
              {errors.school && (
                <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                  {errors.school}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                setFormData({ ...formData, phone: val });
                clearError("phone");
              }}
              placeholder="Enter your phone number"
              leftIcon={<Phone className="h-4 w-4" />}
              error={errors.phone}
              required
              maxLength={10}
            />

            {/* Email (Optional) */}
            <Input
              label="Email (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                clearError("email");
              }}
              placeholder="Enter your email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email}
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                clearError("password");
              }}
              placeholder="Create a password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password}
              required
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                clearError("confirmPassword");
              }}
              placeholder="Re-enter password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 mt-4"
              size="lg"
              isLoading={isLoading}
              rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-sm text-neutral-500">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>

      <SchoolSearchModal
        isOpen={showSchoolModal}
        selectedSchoolId={selectedSchool?.id || null}
        onSelect={(school) => {
          setSelectedSchool(school);
          clearError("school");
        }}
        onClose={() => setShowSchoolModal(false)}
      />
    </AuthLayout>
  );
}
