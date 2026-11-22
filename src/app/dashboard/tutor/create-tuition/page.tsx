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
  data?: {
    _id: string;
  };
}

interface ImgBBResponse {
  success: boolean;
  data?: {
    display_url: string;
    url: string;
  };
  error?: {
    message?: string;
  };
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
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
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
      {
        method: "POST",
        body: imageData,
      },
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
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const labelClass = "mb-2 block text-sm font-medium text-foreground";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <Link
          href="/dashboard/tutor"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <BookOpen size={20} />
              <span className="text-sm font-semibold">Tutor Workspace</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create a Tuition
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Share your tuition requirements and connect with the right
              students.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GraduationCap size={25} />
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8"
      >
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Basic Information
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
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

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="subject" className={labelClass}>
                Subject *
              </label>
              <input
                id="subject"
                required
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                placeholder="e.g. Mathematics"
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
              rows={5}
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

        <div className="border-t border-border" />

        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Tuition Mode & Location
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how and where the tuition will take place.
            </p>
          </div>

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
              <option value="">Select tuition mode</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className={labelClass}>
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} />
                Location *
              </span>
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

          <div>
            <label htmlFor="daysPerWeek" className={labelClass}>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} />
                Days Per Week *
              </span>
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
                  {day} {day === 1 ? "day" : "days"} per week
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="border-t border-border" />

        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Monthly Fee
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set the expected monthly budget in Bangladeshi Taka.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="salaryMin" className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <Wallet size={16} />
                  Minimum Fee (৳) *
                </span>
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
            <div className="rounded-xl bg-primary/5 px-4 py-3 text-sm text-foreground">
              <span className="font-medium">Monthly budget: </span>৳
              {Number(form.salaryMin).toLocaleString("en-BD")} – ৳
              {Number(form.salaryMax).toLocaleString("en-BD")}
            </div>
          )}
        </section>

        <div className="border-t border-border" />

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Tuition Banner Image
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload an image to make your tuition post more attractive. This is
              optional.
            </p>
          </div>

          {imagePreview ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img
                src={imagePreview}
                alt="Tuition banner preview"
                className="h-56 w-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-black/70 px-3 py-2 text-sm text-white transition hover:bg-black"
              >
                <X size={15} />
                Remove
              </button>
            </div>
          ) : (
            <label
              htmlFor="bannerImage"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background px-5 py-10 text-center transition hover:border-primary hover:bg-primary/5"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ImagePlus size={24} />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Choose a banner image
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                JPG, PNG or WEBP · Maximum 5 MB
              </span>
              <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                <Upload size={15} />
                Browse Image
              </span>
            </label>
          )}

          <input
            id="bannerImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          {imageFile && (
            <p className="text-xs text-muted-foreground">
              Selected: {imageFile.name} (
              {(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-600"
          >
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/tutor"
            className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadingImage
              ? "Uploading image..."
              : loading
                ? "Creating..."
                : "Create Tuition"}
            {!loading && !uploadingImage && <BookOpen size={17} />}
          </button>
        </div>
      </form>
    </div>
  );
}
