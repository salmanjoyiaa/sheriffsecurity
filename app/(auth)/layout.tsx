import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Sheriff Security",
  description: "Login to Sheriff Security Management Dashboard",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {children}
    </div>
  );
}
