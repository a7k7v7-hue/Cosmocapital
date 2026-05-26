export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', Arial, sans-serif;
            background: #d8d8d8;
            color: #1a1f2e;
            -webkit-font-smoothing: antialiased;
          }
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            body { background: #fff; }
            #sheet { box-shadow: none; margin: 0; border-radius: 0; }
            .no-print { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
          header, footer { display: none !important; }
          @media screen {
            body { padding: 32px 0 48px; }
            #sheet {
              width: 794px;
              min-height: 1123px;
              margin: 0 auto;
              background: #fff;
              box-shadow: 0 8px 48px rgba(0,0,0,.22);
              border-radius: 4px;
              overflow: hidden;
            }
          }
        `}</style>
      </head>
      <body>
        <div id="sheet">
          {children}
        </div>
      </body>
    </html>
  );
}
