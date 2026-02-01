"use client";
import React from 'react';
import "./globals.css"; // Asegúrate de que este archivo exista

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}