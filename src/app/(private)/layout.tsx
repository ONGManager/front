"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/src/components/header";
import Sidebar from "@/src/components/sidebar";
import { getOngApi } from "@/src/services/ongService";
import "@/src/app/globals.css";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("colaborador");
  const [loading, setLoading] = useState(true);
  const [hasOngSelected, setHasOngSelected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Páginas que não precisam de ONG selecionada
  const noOngRequiredPaths = ["/OngSelector"];
  const isOngSelectorPage = noOngRequiredPaths.includes(pathname);

  useEffect(() => {
    const ongId = localStorage.getItem("selectedOngId");

    if (!ongId) {
      setHasOngSelected(false);
      setLoading(false);

      // Se não está no OngSelector e não tem ONG, redireciona
      if (!isOngSelectorPage) {
        router.push("/OngSelector");
      }
      return;
    }

    setHasOngSelected(true);

    async function loadOngRole() {
      try {
        const ongData = await getOngApi(ongId!);
        setUserRole(ongData.userRole);
      } catch (err) {
        localStorage.removeItem("selectedOngId");
        router.push("/OngSelector");
      } finally {
        setLoading(false);
      }
    }
    loadOngRole();
  }, [router, pathname, isOngSelectorPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se está no OngSelector OU não tem ONG selecionada, mostra sem sidebar
  if (isOngSelectorPage || !hasOngSelected) {
    return <>{children}</>;
  }

  // Com ONG selecionada, mostra com sidebar
  return (
    <div className="min-h-screen flex bg-[var(--bg)] overflow-x-hidden">
      <Sidebar userRole={userRole} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="p-4 md:p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
