import { AuthBoundary } from "@/components/auth-boundary";

export default function ProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
