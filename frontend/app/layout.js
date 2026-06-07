import { cookies } from "next/headers";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AuthProvider } from "../components/auth-provider";
import { ToastProvider } from "../components/toast-provider";

export const metadata = {
  title: {
    default: "Atlas CRM",
    template: "%s | Atlas CRM",
  },
  description: "Atlas Tekstil savdo va ombor boshqaruv tizimi",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("atlas_theme")?.value;

  return (
    <html
      lang="uz"
      className={`${GeistSans.variable} ${theme === "dark" ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
