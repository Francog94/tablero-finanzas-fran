export const metadata = {
  title: "Tablero financiero Fran",
  description: "Control de gastos e inversiones",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
