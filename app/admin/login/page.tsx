"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Bike, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    try { if (sessionStorage.getItem("mtbiq_admin_auth") === "1") router.replace("/admin"); } catch { /* login remains available when storage is restricted */ }
  }, [router]);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (username.trim() === "admin" && password === "1234568") {
      try {
        sessionStorage.setItem("mtbiq_admin_auth", "1");
        router.push("/admin");
      } catch {
        setError("Session storage is unavailable in this browser. Enable it to sign in.");
      }
      return;
    }
    setError("That username and password do not match.");
  }
  return <main className="shell grid min-h-[calc(100vh-72px)] place-items-center py-12">
    <Card className="surface w-full max-w-[440px] p-6 sm:p-8">
      <CardHeader className="p-0">
        <Link href="/" className="mb-7 inline-flex items-center gap-2 text-xs font-bold text-[#98a39b] hover:text-white"><ArrowLeft size={14} /> Back to MTB IQ</Link>
        <div className="mb-2 grid size-12 place-items-center rounded-2xl border border-[#546943] bg-[#1d2919] text-[var(--lime)]"><Bike size={24} /></div>
        <p className="kicker">Staff access</p>
        <CardTitle className="mt-2 text-3xl font-black tracking-[-.05em]"><h1>ADMIN SIGN IN</h1></CardTitle>
        <CardDescription className="mt-2 text-sm leading-6">Manage questions, review ride history, and keep the quiz running smoothly.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={submit} className="mt-7 grid gap-4">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="admin-username" className="text-xs font-bold text-[#d9e0db]">Username</FieldLabel>
              <Input id="admin-username" autoComplete="username" className="field" value={username} onChange={(event) => setUsername(event.target.value)} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-password" className="text-xs font-bold text-[#d9e0db]">Password</FieldLabel>
              <Input id="admin-password" autoComplete="current-password" type="password" className="field" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </Field>
          </FieldGroup>
          {error && <p className="rounded-lg border border-[#723e48] bg-[#28171b] px-3 py-2.5 text-sm text-[#ffadb7]" role="alert">{error}</p>}
          <Button type="submit" size="lg" className="btn-primary mt-1 w-full">SIGN IN <LockKeyhole data-icon="inline-end" /></Button>
        </form>
        <div className="mt-6 flex items-start gap-2 border-t border-[var(--border)] pt-5 text-[11px] leading-5 text-[#78857b]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#a0b784]" /><p>Demo-only, tab-session access for this educational app. It is not production security.</p></div>
      </CardContent>
    </Card>
  </main>;
}
