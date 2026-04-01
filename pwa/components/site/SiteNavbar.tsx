"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";

const navLinks = [
  { label: "Fonctionnalités", href: "/#features" },
  { label: "Modules", href: "/#modules" },
  { label: "Tarifs", href: "/pricing" },
  { label: "Guide", href: "/guide" },
];

function AirplaneLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
  );
}

type SiteNavbarProps = {
  siteName?: string;
};

export default function SiteNavbar({ siteName = "C6L" }: SiteNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="group flex items-center gap-1.5 no-underline hover:opacity-80 transition-opacity">
          <span className={`text-2xl font-bold ${scrolled ? "text-gray-900" : "text-white"}`}>{siteName}</span>
          <AirplaneLogo
            className={`w-[18px] h-[18px] rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
              scrolled ? "text-cyan-700" : "text-cyan-400"
            }`}
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium no-underline transition-colors ${
                scrolled
                  ? "text-gray-700 hover:text-cyan-700"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin"
            className={`px-5 py-2 text-sm font-medium rounded-lg no-underline transition-colors ${
              scrolled
                ? "border border-cyan-700 text-cyan-700 hover:bg-cyan-700 hover:text-white"
                : "border border-white/60 text-white hover:bg-white hover:text-gray-900"
            }`}
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-medium text-white bg-cyan-700 rounded-lg no-underline hover:bg-cyan-500 transition-colors"
          >
            Essai gratuit
          </Link>
        </div>

        <div className="md:hidden">
          <IconButton
            onClick={() => setDrawerOpen(true)}
            aria-label="Menu"
            sx={{ color: scrolled ? "inherit" : "white" }}
          >
            <MenuIcon />
          </IconButton>
        </div>
      </nav>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, pt: 2, px: 2 } }}
      >
        <div className="flex justify-end mb-4">
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Fermer">
            <CloseIcon />
          </IconButton>
        </div>

        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-3 text-base font-medium text-gray-700 no-underline hover:bg-gray-100 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <hr className="my-4 border-gray-200" />

          <Link
            href="/admin"
            onClick={() => setDrawerOpen(false)}
            className="mx-4 px-4 py-3 text-sm font-medium text-center text-cyan-700 border border-cyan-700 rounded-lg no-underline hover:bg-cyan-700 hover:text-white transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            onClick={() => setDrawerOpen(false)}
            className="mx-4 px-4 py-3 text-sm font-medium text-center text-white bg-cyan-700 rounded-lg no-underline hover:bg-cyan-500 transition-colors"
          >
            Essai gratuit
          </Link>
        </nav>
      </Drawer>
    </header>
  );
}
