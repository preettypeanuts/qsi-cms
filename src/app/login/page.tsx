"use client";

import { LockKeyhole, ShieldCheck } from "lucide-react";
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
      setError("Username atau password salah.");
      return;
    }

    const nextPath = new URLSearchParams(window.location.search).get("next");
    router.push(nextPath ?? "/");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_28rem),radial-gradient(circle_at_bottom_right,#e0f2fe,transparent_24rem),#f8fafc] p-4 text-slate-950">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-3xl bg-linear-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-200">
            <ShieldCheck className="size-7" />
          </div>
          <div>
            <CardTitle className="text-2xl">Login QSI CMS</CardTitle>
            <CardDescription className="mt-2">
              Masuk untuk mengelola dashboard dan data certificate.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2" htmlFor="username">
              <span className="font-medium text-slate-700 text-sm">
                Username
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
                Password
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
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
