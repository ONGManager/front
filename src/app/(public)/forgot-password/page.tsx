import LoginPadrao from "../../../components/Login";
import Button from "@mui/material/Button";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen align-middle flex flex-col justify-center items-center">
      <LoginPadrao
        Titulo="Esqueceu sua senha?"
        Subtitulo="Sem problemas. Informe o e-mail cadastrado e enviaremos as instruções para redefinir sua senha."
      />
      <div className="flex flex-col items-center justify-center mt-8 mb-4 mx-auto w-98 h-50 bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6">
        <span className="block text-start self-start ml-7 text-[var(--text)]">
          E-mail
        </span>
        <form className="flex flex-col my-2 mb-6 ">
          <input
            type="email"
            placeholder="Digite seu e-mail"
            className="w-80 h-10 bg-[var(--input)] border-2 border-[var(--input-border)] text-[var(--text)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)]"
          />
        </form>
        <Button
          variant="contained"
          color="primary"
          className="w-80 h-10 bg-purple-600! hover:bg-purple-700! text-white"
        >
          Enviar link de Recuperação
        </Button>
      </div>
      <div className="flex">
        <p className="SubTitulo">Lembrou sua senha?</p>
        <a
          href="/."
          className="text-xl text-[var(--accent)] font-bold hover:opacity-80 ml-2"
        >
          Entrar na conta
        </a>
      </div>
    </div>
  );
}
