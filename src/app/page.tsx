import { redirect } from "next/navigation";

export default function HomePage() {
  // This page should not be reached due to middleware redirect
  // But as a fallback, redirect to login
  redirect("/login");
}
