import { Metadata } from "next";

export const metadata: Metadata = {
  title: "In-Store & In-House Radios | Media Mafias",
  description: "Create your own personalized branded in-store radio station. Control the vibe, run real-time AI announcements, and broadcast professional promos to your retail customers.",
};

export default function InStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
