import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-8">
      <Link href="/" className="font-display text-xl">
        店职通
      </Link>
      <AuthForm mode="register" />
    </main>
  );
}
