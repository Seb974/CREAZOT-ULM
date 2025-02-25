"use client";

import React from "react";
import "../../../css/satoshi.css";
import "../../../css/style.css";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
