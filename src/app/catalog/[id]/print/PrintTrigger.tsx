"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    // Give images time to load, then trigger print
    const timer = setTimeout(() => window.print(), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <style>{`
      @page {
        size: A4;
        margin: 18mm 15mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        button, .no-print { display: none !important; }
      }
      @media screen {
        body { background: #e0e0e0; padding: 20px 0; }
        #print-sheet {
          max-width: 794px;
          margin: 0 auto;
          background: #fff;
          padding: 28px 32px;
          box-shadow: 0 4px 32px rgba(0,0,0,.15);
        }
      }
    `}</style>
  );
}
