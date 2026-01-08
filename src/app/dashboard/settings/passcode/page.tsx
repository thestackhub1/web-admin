import type { Metadata } from "next";
import { PasscodeSetupClient } from "@/client/components/features/settings";

export const metadata: Metadata = {
  title: "Setup Passcode - The Stack Hub Admin",
  description: "Secure your admin account with a 6-digit PIN",
};

export default function PasscodeSetupPage() {
  return <PasscodeSetupClient />;
}
