"use client";

import { useTokenomics } from "@/app/TokenomicsContext";
import { Button } from "@/components/ui/button";
import { domToPng } from "modern-screenshot";
import { Download } from "lucide-react";
import { useState } from "react";

export function ExportCard() {
  const { state } = useTokenomics();
  const [isExporting, setIsExporting] = useState(false);

  if (state.inputTokens === 0) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("metrics-export-capture");
      if (!element) return;

      // modern-screenshot handles modern CSS (OKLCH, LAB, etc) much better than html2canvas
      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        quality: 1
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `LLM-Juice-Analysis-${state.selectedModel}.png`;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex justify-center mt-8 pb-16">
      <Button 
        onClick={handleExport} 
        disabled={isExporting || state.reportLoading}
        size="lg"
        className="gap-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        <Download className="w-5 h-5" />
        {isExporting ? "Generating High-Res Image..." : "Export Shareable Analysis"}
      </Button>
    </div>
  );
}

