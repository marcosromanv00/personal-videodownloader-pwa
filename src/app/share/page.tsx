"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function ShareHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const title = searchParams.get("title");
    const text = searchParams.get("text");
    const urlParam = searchParams.get("url");

    // Extract URL from text or url param
    const sharedText = `${title || ""} ${text || ""} ${urlParam || ""}`;
    const urlMatch = sharedText.match(/https?:\/\/[^\s]+/);
    const finalUrl = urlMatch ? urlMatch[0] : null;

    if (finalUrl) {
      // Store in session storage and redirect to home
      sessionStorage.setItem("shared_url", finalUrl);
      router.push(`/?shared=true`);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-white p-6 text-center space-y-4">
      <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
      <h2 className="text-xl font-bold">Procesando enlace compartido...</h2>
      <p className="text-zinc-500">Estamos analizando el contenido para ti.</p>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ShareHandler />
    </Suspense>
  );
}
