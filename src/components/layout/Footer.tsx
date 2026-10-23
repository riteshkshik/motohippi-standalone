import React from "react";
import { Link } from "wouter";

// ─── Social Icons ─────────────────────────────────────────────────────────────
const InstagramIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YouTubeIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="5" width="20" height="14" rx="4" ry="4" />
    <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
  </svg>
);

export const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/motohippi?utm_source=qr",
    icon: InstagramIcon,
    hoverClass:
      "hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10",
    textHoverClass: "group-hover:text-pink-400",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/groups/1746306876591034",
    icon: FacebookIcon,
    hoverClass:
      "hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10",
    textHoverClass: "group-hover:text-blue-400",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@Motohippi_Official",
    icon: YouTubeIcon,
    hoverClass:
      "hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10",
    textHoverClass: "group-hover:text-red-400",
  },
];

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`bg-[#0d1017] text-white border-t border-white/10 py-12 relative z-20 ${className}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <img
                src="/logo.png"
                alt="MotoHippi"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <h2 className="text-2xl font-bold tracking-tighter text-white">
                MotoHippi
              </h2>
            </div>
            <p className="text-white/60 text-sm max-w-sm">
              The ultimate ecosystem for road travelers. Connect, discover,
              and ride into the unknown.
            </p>
          </div>

          {/* Social Links Section */}
          <div className="flex flex-col items-start sm:items-center lg:items-start gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Follow Us
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 transition-all text-white/70 ${item.hoverClass}`}
                >
                  <item.icon
                    size={18}
                    className="transition-transform group-hover:scale-110"
                  />
                  <span
                    className={`text-xs font-medium transition-colors ${item.textHoverClass}`}
                  >
                    {item.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-start lg:items-end gap-2 text-sm text-white/60">
            <p>
              Contact:{" "}
              <a
                href="mailto:MotoHippi@yahoo.com"
                className="text-white hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                MotoHippi@yahoo.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            &copy; {new Date().getFullYear()} MotoHippi. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/refund-policy"
              className="hover:text-primary transition-colors"
            >
              Refund &amp; Return Policy
            </Link>
            <Link
              href="/shipping-policy"
              className="hover:text-primary transition-colors"
            >
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
