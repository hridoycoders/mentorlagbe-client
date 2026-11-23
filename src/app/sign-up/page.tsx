"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardPath } from "@/lib/dashboard";
import {
  GraduationCap,
  UserRound,
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type UserRole = "student" | "tutor";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (result.error) {
        setError(result.error.message || "Registration failed.");
        return;
      }

      toast.success("Account created successfully!");

     router.push(getDashboardPath(role));
     router.refresh();

    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hero-gradient flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-8 sm:py-12">
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
                Start Your Learning Journey Today.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/85">
                Connect with experienced tutors, discover opportunities, and
                achieve your educational goals with MentorLagbe.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            {[
              "Find the right learning opportunities",
              "Connect with qualified tutors",
              "Manage your learning journey easily",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <CardContent className="p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-7 text-center lg:text-left">
              <div className="brand-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white lg:mx-0">
                <GraduationCap size={27} />
              </div>

              <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Join MentorLagbe and get started today.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 rounded-xl px-4"
                />
              </div>

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

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>I want to join as</Label>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={role === "student" ? "default" : "outline"}
                    onClick={() => setRole("student")}
                    aria-pressed={role === "student"}
                    className="h-auto justify-start gap-3 rounded-xl p-3"
                  >
                    <UserRound size={21} />
                    <span className="text-left">
                      <span className="block font-bold">Student</span>
                      <span className="block text-xs font-normal opacity-80">
                        Find tutors
                      </span>
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant={role === "tutor" ? "default" : "outline"}
                    onClick={() => setRole("tutor")}
                    aria-pressed={role === "tutor"}
                    className="h-auto justify-start gap-3 rounded-xl p-3"
                  >
                    <BookOpen size={21} />
                    <span className="text-left">
                      <span className="block font-bold">Tutor</span>
                      <span className="block text-xs font-normal opacity-80">
                        Teach students
                      </span>
                    </span>
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl px-4 pr-12"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
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
                    <Loader2 size={18} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
              By creating an account, you agree to use MentorLagbe responsibly.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
