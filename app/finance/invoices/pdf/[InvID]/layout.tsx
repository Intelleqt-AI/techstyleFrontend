export default function InvoiceOrderLayout({ children }: { children: React.ReactNode }) {
  // This completely breaks away from the parent layout
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
