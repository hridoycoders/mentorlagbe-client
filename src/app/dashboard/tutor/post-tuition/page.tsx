"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  ImagePlus,
  MapPin,
  Upload,
  Wallet,
  X,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

interface TuitionResponse {
  success: boolean;
  message: string;
  data?: { _id: string };
}

interface ImgBBResponse {
  success: boolean;
  data?: {
    display_url: string;
    url: string;
  };
  error?: { message?: string };
}

const initialForm = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  daysPerWeek: "5",
  description: "",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function CreateTuitionPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setImageFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(typeof reader.result === "string" ? reader.result : "");
    };

    reader.onerror = () => {
      setError("Could not preview the selected image.");
      setImageFile(null);
      setImagePreview("");
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");

    const input = document.getElementById(
      "bannerImage",
    ) as HTMLInputElement | null;

    if (input) input.value = "";
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      throw new Error(
        "ImgBB API key is missing. Please configure NEXT_PUBLIC_IMGBB_API_KEY.",
      );
    }

    const imageData = new FormData();
    imageData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: "POST", body: imageData },
    );

    const result = (await response.json()) as ImgBBResponse;

    if (!response.ok || !result.success) {
      throw new Error(
        result.error?.message || "Image upload failed. Please try again.",
      );
    }

    const imageUrl = result.data?.display_url || result.data?.url;

    if (!imageUrl) {
      throw new Error("ImgBB did not return a valid image URL.");
    }

    return imageUrl;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const minFee = Number(form.salaryMin);
    const maxFee = Number(form.salaryMax);

    if (minFee <= 0 || maxFee <= 0) {
      setError("Please enter a valid monthly fee range.");
      return;
    }

    if (maxFee < minFee) {
      setError("Maximum fee cannot be lower than minimum fee.");
      return;
    }

    if (!["online", "offline"].includes(form.mode)) {
      setError("Please select a valid tuition mode.");
      return;
    }

    try {
      setLoading(true);

      const { data: tokenData, error: tokenError } = await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error(
          "Your login session could not be verified. Please sign in again.",
        );
      }

      let bannerImage = "";

      if (imageFile) {
        setUploadingImage(true);

        try {
          bannerImage = await uploadImageToImgBB(imageFile);
        } finally {
          setUploadingImage(false);
        }
      }

      const response = await apiRequest<TuitionResponse>("/api/tuitions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          subject: form.subject.trim(),
          classLevel: form.classLevel.trim(),
          mode: form.mode,
          location: form.location.trim(),
          monthlyFee: {
            min: minFee,
            max: maxFee,
            currency: "BDT",
            period: "monthly",
          },
          daysPerWeek: Number(form.daysPerWeek),
          description: form.description.trim(),
          bannerImage,
        }),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create tuition.");
      }

      setSuccess(
        response.message ||
          "Tuition created successfully. Waiting for admin approval.",
      );

      setForm(initialForm);
      setImageFile(null);
      setImagePreview("");

      const input = document.getElementById(
        "bannerImage",
      ) as HTMLInputElement | null;

      if (input) input.value = "";

      window.setTimeout(() => {
        router.push("/dashboard/tutor");
      }, 1500);
    } catch (requestError) {
      console.error("Create Tuition Error:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const labelClass = "mb-1.5 block text-xs font-medium text-foreground";

  const sectionClass =
    "min-w-0 space-y-4 rounded-xl border border-border p-4 sm:p-5";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div>
        <Link
          href="/dashboard/tutor"
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-primary">
              <BookOpen size={17} />
              <span className="text-xs font-semibold">Tutor Workspace</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Post a Tuition
            </h1>

            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Share your tuition requirements and connect with students.
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-11 sm:w-11">
            <GraduationCap size={22} />
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-start gap-4 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-5 lg:grid-cols-2 lg:gap-5"
      >
        {/* Basic Information */}
        <section className={sectionClass}>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Basic Information
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tell students about the tuition opportunity.
            </p>
          </div>

          <div>
            <label htmlFor="title" className={labelClass}>
              Tuition Title *
            </label>
            <input
              id="title"
              required
              maxLength={120}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. Need a Mathematics tutor for Class 9"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="subject" className={labelClass}>
                Subject *
              </label>
              <input
                id="subject"
                required
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                placeholder="Mathematics"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="classLevel" className={labelClass}>
                Class Level *
              </label>
              <select
                id="classLevel"
                required
                value={form.classLevel}
                onChange={(event) =>
                  updateField("classLevel", event.target.value)
                }
                className={inputClass}
              >
                <option value="">Select class</option>
                {[
                  "Class 1",
                  "Class 2",
                  "Class 3",
                  "Class 4",
                  "Class 5",
                  "Class 6",
                  "Class 7",
                  "Class 8",
                  "Class 9",
                  "Class 10",
                  "HSC",
                  "Admission",
                  "University",
                ].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Tuition Description *
            </label>
            <textarea
              id="description"
              required
              minLength={20}
              maxLength={2000}
              rows={4}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Describe the student's requirements, topics and expectations..."
              className={`${inputClass} resize-y`}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {form.description.length}/2000 characters
            </p>
          </div>
        </section>

        {/* Tuition Details */}
        <section className={sectionClass}>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Tuition Details
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Set the mode, location and weekly schedule.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="mode" className={labelClass}>
                Tuition Mode *
              </label>
              <select
                id="mode"
                required
                value={form.mode}
                onChange={(event) => updateField("mode", event.target.value)}
                className={inputClass}
              >
                <option value="">Select mode</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label htmlFor="daysPerWeek" className={labelClass}>
                <CalendarDays size={13} className="mr-1 inline" />
                Days Per Week *
              </label>
              <select
                id="daysPerWeek"
                required
                value={form.daysPerWeek}
                onChange={(event) =>
                  updateField("daysPerWeek", event.target.value)
                }
                className={inputClass}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <option key={day} value={String(day)}>
                    {day} {day === 1 ? "day" : "days"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className={labelClass}>
              <MapPin size={13} className="mr-1 inline" />
              Location *
            </label>
            <input
              id="location"
              required
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="e.g. Bogura Sadar, Bangladesh"
              className={inputClass}
            />
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="text-base font-semibold text-foreground">
              Monthly Fee
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Expected monthly budget in Bangladeshi Taka.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="salaryMin" className={labelClass}>
                <Wallet size={13} className="mr-1 inline" />
                Minimum Fee (৳) *
              </label>
              <input
                id="salaryMin"
                type="number"
                required
                min="1"
                value={form.salaryMin}
                onChange={(event) =>
                  updateField("salaryMin", event.target.value)
                }
                placeholder="5000"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="salaryMax" className={labelClass}>
                Maximum Fee (৳) *
              </label>
              <input
                id="salaryMax"
                type="number"
                required
                min="1"
                value={form.salaryMax}
                onChange={(event) =>
                  updateField("salaryMax", event.target.value)
                }
                placeholder="8000"
                className={inputClass}
              />
            </div>
          </div>

          {form.salaryMin && form.salaryMax && (
            <div className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-foreground">
              <span className="font-medium">Monthly budget: </span>৳
              {Number(form.salaryMin).toLocaleString("en-BD")} – ৳
              {Number(form.salaryMax).toLocaleString("en-BD")}
            </div>
          )}
        </section>

        {/* Banner Image */}
        <section className={`${sectionClass} lg:col-span-2`}>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Tuition Banner Image
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Upload an optional image for your tuition post.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:items-center">
            <div>
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <img
                    src={imagePreview}
                    alt="Tuition banner preview"
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/70 px-2.5 py-1.5 text-xs text-white transition hover:bg-black"
                  >
                    <X size={14} />
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="bannerImage"
                  className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background px-4 py-5 text-center transition hover:border-primary hover:bg-primary/5"
                >
                  <ImagePlus size={24} className="mb-2 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Choose a banner image
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG or WEBP · Maximum 5 MB
                  </span>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground">
                    <Upload size={14} />
                    Browse Image
                  </span>
                </label>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Image is optional.</p>
              <p className="mt-1">
                Use a clear and relevant image to make your tuition post more
                attractive.
              </p>
              {imageFile && (
                <p className="mt-2 break-all font-medium text-foreground">
                  Selected: {imageFile.name} (
                  {(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <input
            id="bannerImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive lg:col-span-2"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-600 lg:col-span-2"
          >
            <CheckCircle2 size={17} />
            {success}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2.5 border-t border-border pt-4 sm:flex-row sm:justify-end lg:col-span-2">
          <Link
            href="/dashboard/tutor"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadingImage
              ? "Uploading image..."
              : loading
                ? "Creating..."
                : "Create Tuition"}
            {!loading && !uploadingImage && <BookOpen size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
