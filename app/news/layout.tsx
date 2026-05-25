import React from "react";

export default function NewsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {children}
      {modal}
    </div>
  );
}
