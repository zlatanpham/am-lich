import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/";
    const callbackUrl = encodeURIComponent(pathname);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return <>{children}</>;
}
