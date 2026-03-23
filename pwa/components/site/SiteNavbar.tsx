"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";

const navLinks = [
  { label: "Fonctionnalités", href: "/features" },
  { label: "Tarifs", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-cyan-700 no-underline hover:opacity-80 transition-opacity">
          C6L
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 no-underline hover:text-cyan-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => signIn("keycloak")}
            className="px-5 py-2 text-sm font-medium text-cyan-700 border border-cyan-700 rounded-lg hover:bg-cyan-700 hover:text-white transition-colors"
          >
            Connexion
          </button>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-medium text-white bg-cyan-700 rounded-lg no-underline hover:bg-cyan-500 transition-colors"
          >
            Essai gratuit
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <IconButton onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <MenuIcon />
          </IconButton>
        </div>
      </nav>

      {/* Mobile drawer */}
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

          <button
            onClick={() => {
              setDrawerOpen(false);
              signIn("keycloak");
            }}
            className="mx-4 px-4 py-3 text-sm font-medium text-cyan-700 border border-cyan-700 rounded-lg hover:bg-cyan-700 hover:text-white transition-colors"
          >
            Connexion
          </button>
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
