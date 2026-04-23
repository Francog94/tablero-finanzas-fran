export const metadata = {
  title: "Tablero financiero Fran",
  description: "Control de gastos e inversiones",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
