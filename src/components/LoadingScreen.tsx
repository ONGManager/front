export default function LoadingScreen({
  text = "Carregando...",
}: {
  text?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-4">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] px-8 py-10 shadow-xl shadow-black/10">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-[var(--accent)] border-t-transparent" />
        <p className="text-lg font-semibold text-[var(--text)]">{text}</p>
      </div>
    </div>
  );
}
