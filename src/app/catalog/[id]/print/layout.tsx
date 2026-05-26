export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; background: #e8e8e8; }
          @page { size: A4; margin: 15mm 14mm; }
          @media print {
            body { background: #fff; }
            #print-sheet { box-shadow: none !important; padding: 0 !important; }
            .no-print { display: none !important; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          @media screen {
            #print-sheet {
              max-width: 794px; margin: 20px auto; background: #fff;
              padding: 28px 32px;
              box-shadow: 0 4px 32px rgba(0,0,0,.18);
            }
          }
        `}</style>
      </head>
      <body>
        <div id="print-sheet">
          {children}
        </div>
      </body>
    </html>
  );
}
