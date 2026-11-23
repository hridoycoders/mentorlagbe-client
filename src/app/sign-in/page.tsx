"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardPath } from "@/lib/dashboard";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  LogIn,
  BookOpen,
} from "lucide-react";

import { signIn, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid email or password.");
        return;
      }

      const userRole = (result.data?.user as { role?: string } | undefined)
        ?.role;

      router.push(getDashboardPath(userRole));
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-6 text-center">
            <BookOpen className="mx-auto text-primary" size={36} />
            <h2 className="text-xl font-bold text-foreground">
              You are already signed in.
            </h2>
            <Button
              className="w-full"
              onClick={() => {
                const userRole = (session.user as { role?: string }).role;
                router.push(getDashboardPath(userRole));
              }}
            >
              Go to Dashboard
              <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="hero-gradient flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-10">
      <Card className="grid w-full max-w-5xl overflow-hidden rounded-3xl border-border p-0 shadow-xl lg:grid-cols-2">
        {/* Information Panel */}
        <div className="brand-gradient relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[35px] border-white/10" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <GraduationCap size={28} />
              </div>
              <span className="text-2xl font-extrabold">MentorLagbe</span>
            </Link>

            <div className="mt-20">
              <h1 className="text-4xl font-extrabold leading-tight">
                Welcome Back to MentorLagbe.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/85">
                Continue your learning journey, connect with tutors, and manage
                your opportunities in one place.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            {[
              "Access your personalized dashboard",
              "Manage your learning opportunities",
              "Connect with the right people",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <LogIn size={19} />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <CardContent className="flex items-center p-5 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="brand-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white lg:mx-0">
                <GraduationCap size={27} />
              </div>

              <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to continue to your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl px-4"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl px-4 pr-12"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="brand-gradient h-12 w-full rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-bold text-primary hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
