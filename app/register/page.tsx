import LoginPadrao from "../components/Login";
import  Button from "@mui/material/Button";

export default function Register() {
  return (
    <div className="min-h-screen align-middle flex flex-col justify-center items-center">
      <LoginPadrao Titulo="Crie sua Conta!" Subtitulo="Cadastre sua ONG e comece a gerenciar em minutos" />
        <div className='flex flex-col items-center justify-center my-4 mx-auto w-98 bg-white rounded-2xl shadow-2xl p-6'>
          <div className='w-80'>
            <span className="spanLogin">Nome da ONG</span>
            <form className="flex flex-col mb-4">
              <input type="text" placeholder='Digite o nome da sua ONG' className='w-80 h-10 border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:border-purple-600' />
            </form>
          </div>
          <div className='w-80'>
            <span className="spanLogin">CNPJ</span>
            <form className="flex flex-col mb-4">
              <input type="text" placeholder='Digite o CNPJ da sua ONG' className='w-80 h-10 border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:border-purple-600' />
            </form>
          </div>
          <div className='w-80'>
            <span className="spanLogin">Nome do responsável</span>
            <form className="flex flex-col mb-4">
              <input type="text" placeholder='Digite o nome do responsável' className='w-80 h-10 border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:border-purple-600' />
            </form>
          </div>
          <div className='w-80'>
            <span className="spanLogin">E-mail</span>
            <form className="flex flex-col mb-4">
              <input type="email" placeholder='Digite seu e-mail' className='w-80 h-10 border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:border-purple-600' />
            </form>
          </div>
          <div className='w-80'>
            <span className="spanLogin">Senha</span>
            <form className="flex flex-col mb-4">
              <input type="password" placeholder='Digite sua senha' className='w-80 h-10 border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:border-purple-600' />
            </form>
          </div>
          <Button variant="contained" color="primary" className='w-80 h-10 bg-purple-600! hover:bg-purple-700! text-white font-bold'>
            Criar Conta
          </Button>
        </div>
        <div className="flex">
          <p className="SubTitulo">Já tem alguma ONG cadastrada?</p>
          <a href="/." className="text-purple-600 font-bold hover:text-purple-800 text-xl ml-2">
            Entrar na conta
          </a>
        </div>
    </div>
  );
}