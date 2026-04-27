"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Link as LinkIcon, Clipboard, Loader2, Sparkles, Youtube, Instagram, Twitter, Facebook } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const platforms = [
  { icon: Youtube, label: "TikTok", color: "text-red-400" },
  { icon: Instagram, label: "Instagram", color: "text-pink-400" },
  { icon: Twitter, label: "Twitter", color: "text-blue-400" },
  { icon: Facebook, label: "Facebook", color: "text-blue-600" },
];

interface ExtractionResult {
  title: string;
  thumbnail: string | null;
  downloadUrl: string;
  source: string;
  note?: string;
}

export default function LandingView() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  useEffect(() => {
    const sharedUrl = sessionStorage.getItem("shared_url");
    if (sharedUrl) {
      setUrl(sharedUrl);
      sessionStorage.removeItem("shared_url");
      // Trigger extraction automatically
      const timer = setTimeout(() => {
        handleExtractFromUrl(sharedUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleExtractFromUrl = async (targetUrl: string) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al extraer el video");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      setError("No se pudo acceder al portapapeles");
    }
  };

  const handleExtract = async () => {
    if (!url) return;
    await handleExtractFromUrl(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center p-3 bg-violet-500/10 rounded-2xl mb-4"
          >
            <Download className="w-8 h-8 text-violet-400" />
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Social<span className="premium-text-gradient">Down</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Descarga videos y fotos de tus redes favoritas en segundos.
          </p>
        </div>

        {/* Platforms */}
        <div className="flex justify-center gap-6 py-4">
          {platforms.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn("flex flex-col items-center gap-2", p.color)}
            >
              <p.icon className="w-6 h-6 opacity-80" />
            </motion.div>
          ))}
        </div>

        {/* Input Group */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative flex items-center bg-zinc-900 rounded-2xl p-2 gap-2">
            <div className="pl-4">
              <LinkIcon className="w-5 h-5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Pega el enlace aquí..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-600 h-12 text-lg"
            />
            <button
              onClick={handlePaste}
              className="p-3 text-zinc-400 hover:text-zinc-100 transition-colors"
              title="Pegar"
            >
              <Clipboard className="w-5 h-5" />
            </button>
            <button
              onClick={handleExtract}
              disabled={!url || isProcessing}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 h-12 rounded-xl font-semibold transition-all flex items-center gap-2 active:scale-95"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Descargar</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback / Results */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center"
            >
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 space-y-4"
            >
              <div className="aspect-video bg-zinc-800 rounded-xl overflow-hidden relative group">
                {result.thumbnail && (
                  <Image 
                    src={result.thumbnail} 
                    alt="Vista previa" 
                    fill 
                    unoptimized 
                    className="w-full h-full object-cover" 
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                      <Download className="w-6 h-6 text-white" />
                   </div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg truncate">{result.title || "Video detectado"}</h3>
                <p className="text-sm text-zinc-500">{result.source}</p>
              </div>
              <a
                href={result.downloadUrl}
                download
                className="w-full premium-gradient text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-transform"
              >
                Confirmar Descarga
                <Download className="w-5 h-5" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-12 text-zinc-600 text-sm font-medium"
      >
        Desarrollado con ✨ por Antigravity
      </motion.footer>
    </div>
  );
}
