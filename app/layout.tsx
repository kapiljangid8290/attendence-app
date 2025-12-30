import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header
          style={{
            padding: "15px",
            background: "#111",
            color: "#fff",
          }}
        >
          Attendance App
        </header>

        {children}
      </body>
    </html>
  );
}
