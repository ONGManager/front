import Header from "@/app/components/header";
import Sidebar from "@/app/components/sidebar";
import "@/app/globals.css";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
