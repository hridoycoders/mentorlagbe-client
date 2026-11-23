"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  UserRound,
  Camera,
  Mail,
  Phone,
  FileText,
  Save,
  Loader2,
  Crown,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

interface Profile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  bio?: string;
  role: string;
  plan?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: Profile;
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load profile
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const auth = await authClient.token();
        const token = auth.data?.token;

        if (!token) {
          throw new Error("Please login again.");
        }

        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load profile.");
        }

        if (!active) return;

        setProfile(result.data);
        setName(result.data.name || "");
        setPhone(result.data.phone || "");
        setBio(result.data.bio || "");
        setImage(result.data.image || "");
        setPreview(result.data.image || "");
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void Promise.resolve().then(loadProfile);

    return () => {
      active = false;
    };
  }, []);

  // Upload profile photo
  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    if (!IMGBB_KEY) {
      setError("ImgBB API key is missing.");
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);

    setPreview(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success || !result.data?.url) {
        throw new Error(result.error?.message || "Image upload failed.");
      }

      setImage(result.data.url);
      setPreview(result.data.url);
      setSuccess("Profile photo uploaded. Save your changes.");
    } catch (err) {
      setPreview(image);

      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
      event.target.value = "";
    }
  };

  // Update profile
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const auth = await authClient.token();
      const token = auth.data?.token;

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          image,
          phone: phone.trim(),
          bio: bio.trim(),
        }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Profile update failed.");
      }

      const updatedProfile = result.data || {
        ...profile!,
        name: name.trim(),
        image,
        phone: phone.trim(),
        bio: bio.trim(),
      };

      setProfile(updatedProfile);
      setSuccess(result.message || "Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[45vh] flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />

        <h2 className="mt-3 text-lg font-bold text-foreground">
          Profile unavailable
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Page heading */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-primary">
          <ShieldCheck size={15} />
          Account Settings
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle size={17} className="shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={17} className="shrink-0" />
          {success}
        </div>
      )}

      {/* Profile banner */}
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Gradient background */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 sm:h-36">
          <div className="absolute -right-10 -top-28 h-72 w-72 rounded-full border-[35px] border-white/10" />

          <div className="absolute right-32 top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl" />
        </div>

        {/* Profile information */}
        <div className="relative px-5 pb-5 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Avatar */}
            <div className="-mt-14 relative h-28 w-28 shrink-0 sm:-mt-16 sm:h-32 sm:w-32">
              <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-lg">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound size={46} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Camera upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Upload profile photo"
                title="Upload profile photo"
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-card bg-primary text-primary-foreground shadow-md transition hover:scale-110 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Name and email */}
            <div className="min-w-0 flex-1 pb-1 pt-1 sm:pb-2 sm:pt-0">
              <h2 className="break-words text-xl font-bold text-foreground sm:text-2xl">
                {profile.name}
              </h2>

              <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                <Mail size={15} className="shrink-0" />
                <span className="break-all">{profile.email}</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                  {profile.role}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold capitalize text-amber-600 dark:text-amber-400">
                  <Crown size={12} />
                  {profile.plan || "free"} Plan
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal information form */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Form heading */}
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h3 className="text-base font-bold text-foreground">
            Personal Information
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Update your details. Email and role cannot be changed here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Full name */}
            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Full Name <span className="text-destructive">*</span>
              </label>

              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={60}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="profile-email"
                  value={profile.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-3 text-sm text-muted-foreground outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="sm:col-span-2">
              <label
                htmlFor="profile-phone"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="profile-bio"
                  className="text-sm font-semibold text-foreground"
                >
                  About Me
                </label>

                <span className="text-xs text-muted-foreground">
                  {bio.length}/500
                </span>
              </div>

              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />

                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Write a short introduction about yourself..."
                  className="w-full resize-y rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          </div>

          {/* Form actions */}
          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={saving || uploading || !name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
