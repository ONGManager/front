// OngSelector não precisa de layout próprio - usa apenas o conteúdo
// O sidebar só aparece após selecionar uma ONG
export default function OngSelectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
