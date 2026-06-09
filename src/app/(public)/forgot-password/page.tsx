import LoginPadrao from "../../../components/Login";
import Button from "@mui/material/Button";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen align-middle flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[400px]">
        <LoginPadrao
          Titulo="Esqueceu sua senha?"
          Subtitulo="Sem problemas. Informe o e-mail cadastrado e enviaremos as instruções para redefinir sua senha."
        />
        <div className="flex flex-col items-center justify-center mt-6 mb-4 mx-auto w-full h-auto bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="w-full">
            <span className="block text-start text-[var(--text)] mb-2">
              E-mail
            </span>
            <form className="flex flex-col my-2 mb-6 w-full">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                className="w-full h-10 bg-[var(--input)] border-2 border-[var(--input-border)] text-[var(--text)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)]"
              />
            </form>
          </div>
          <Button
            variant="contained"
            color="primary"
            className="w-full h-10 bg-purple-600! hover:bg-purple-700! text-white cursor-pointer"
          >
            Enviar link de Recuperação
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1 mt-4">
          <p className="SubTitulo mb-0!">Lembrou sua senha?</p>
          <a
            href="/"
            className="text-base md:text-xl text-[var(--accent)] font-bold hover:opacity-80"
          >
            Entrar na conta
          </a>
        </div>
      </div>
    </div>
  );
}
