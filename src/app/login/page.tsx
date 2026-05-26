"use client";

import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/auth/login", {
      body: JSON.stringify({ password, username }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    setIsLoading(false);

    if (!response.ok) {
      setError("Nama pengguna atau kata sandi salah.");
      return;
    }

    const nextPath = new URLSearchParams(window.location.search).get("next");
    router.push(nextPath ?? "/");
    router.refresh();
  }

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-slate-950 p-4 text-slate-950">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_15%,rgba(14,165,233,0.45),transparent_26rem),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.35),transparent_22rem),radial-gradient(circle_at_50%_95%,rgba(59,130,246,0.35),transparent_28rem),linear-gradient(135deg,#020617_0%,#0f172a_45%,#075985_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[44px_44px] opacity-25" />
      <div className="-top-24 -left-24 absolute -z-10 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="-right-24 absolute bottom-8 -z-10 size-80 rounded-full bg-sky-400/20 blur-3xl" />

      <Card className="w-full max-w-md overflow-hidden border-white/30 bg-white/90 shadow-2xl shadow-sky-950/30 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto grid size-16 place-items-center overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-sky-100">
            <Image
              src="/logo.png"
              alt="Logo QSI"
              width={48}
              height={48}
              className="size-12 object-contain"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl">Masuk QSI CMS</CardTitle>
            <CardDescription className="mt-2">
              Masuk untuk mengelola dasbor dan data sertifikat.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2" htmlFor="username">
              <span className="font-medium text-slate-700 text-sm">
                Nama pengguna
              </span>
              <Input
                id="username"
                autoComplete="username"
                placeholder="admin"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="block space-y-2" htmlFor="password">
              <span className="font-medium text-slate-700 text-sm">
                Kata sandi
              </span>
              <Input
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            ) : null}

            <Button className="w-full" type="submit" disabled={isLoading}>
              <LockKeyhole className="size-4" />
              {isLoading ? "Sedang masuk..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
