import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowUpRight,
} from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Find Tutors", href: "/tuitions" },
  { label: "Pricing Plans", href: "/pricing" },
];

const accountLinks = [
  { label: "Student Account", href: "/sign-up?role=student" },
  { label: "Tutor Account", href: "/sign-up?role=tutor" },
  { label: "Login", href: "/sign-in" },
];

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-brand-primary sm:text-sm"
    >
      {children}
      <ArrowUpRight
        size={13}
        className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
      />
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="footer-gradient mt-auto border-t border-border text-foreground">
      <div className="container py-5 sm:py-8 lg:py-10">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 md:col-span-1 md:block">
            <div>
              <Link href="/" className="mb-2 flex items-center gap-2 md:mb-3">
                <div className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-white sm:h-9 sm:w-9 sm:rounded-xl">
                  <GraduationCap size={19} />
                </div>

                <span className="text-base font-extrabold sm:text-lg">
                  Mentor<span className="brand-text-gradient">Lagbe</span>
                </span>
              </Link>

              <p className="max-w-xs text-xs leading-5 text-muted-foreground sm:leading-6 sm:text-sm">
                Connect with the right tutor for smarter learning.
              </p>
            </div>

            {/* Social links */}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/HridoyAhmedNoor1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:-translate-y-1 hover:border-blue-500 hover:text-blue-500"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.2H7.5V13h2.8v8h3.2Z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/hridoycoders"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:-translate-y-1 hover:border-foreground hover:text-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.51 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.28-2.6 5.22-5.08 5.5.4.35.75 1.02.75 2.06v3.1c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/hridoy-ahmed1/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:-translate-y-1 hover:border-blue-600 hover:text-blue-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.46H4.95V9.04h2.98v9.42ZM6.44 7.75a1.73 1.73 0 1 1 0-3.46 1.73 1.73 0 0 1 0 3.46Zm12.02 10.71h-2.97v-4.58c0-1.09-.02-2.49-1.52-2.49-1.52 0-1.75 1.18-1.75 2.41v4.66H9.25V9.04h2.85v1.29h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v5.11h-.07Z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/hridoy_ahmed_noor/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:-translate-y-1 hover:border-pink-500 hover:text-pink-500"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="0.8"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              {/* Portfolio */}
              <a
                href="https://hridoy-portfolio-web.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Portfolio"
                title="Portfolio"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:-translate-y-1 hover:border-brand-primary hover:text-brand-primary"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-2 text-xs font-bold sm:mb-3 sm:text-sm">
              Quick Links
            </h3>

            <div className="flex flex-col gap-1.5 sm:gap-2.5">
              {quickLinks.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-2 text-xs font-bold sm:mb-3 sm:text-sm">
              Get Started
            </h3>

            <div className="flex flex-col gap-1.5 sm:gap-2.5">
              {accountLinks.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-2 text-xs font-bold sm:mb-3 sm:text-sm">
              Contact Us
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 md:flex-col md:items-start md:space-y-2.5">
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-brand-primary" />
                <span className="break-all text-xs text-muted-foreground sm:text-sm">
                  hridoyahmed.dev@gmail.com
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-brand-primary" />
                <span className="text-xs text-muted-foreground sm:text-sm">
                  +880 1989305130
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-brand-primary" />
                <span className="text-xs text-muted-foreground sm:text-sm">
                  Bogura,Bangladesh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 flex flex-col items-center justify-between gap-1.5 border-t border-border pt-3.5 text-center sm:mt-6 sm:flex-row sm:pt-5 sm:text-left">
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            © 2026 MentorLagbe. All rights reserved.
          </p>

          <p className="flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs">
            Made with
            <Heart size={12} className="fill-red-500 text-red-500" />
            for better learning
          </p>
        </div>
      </div>
    </footer>
  );
}
