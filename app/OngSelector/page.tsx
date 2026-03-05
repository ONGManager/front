import LoginPadrao from "../components/Login"
import Button from "@mui/material/Button";

export default function OngSelector() {
    return (
        <div className="min-h-screen align-middle flex flex-col justify-center items-center">
            <LoginPadrao Titulo="Escolha a sua ONG" Subtitulo="Selecione qual você quer trabalhar!"></LoginPadrao>
            <div className='flex flex-col items-center justify-center mt-4 mb-4 mx-auto w-98 h-50 bg-white border border-gray-300 rounded-2xl shadow-2xl p-8'>
                <div className='w-80'>
                    <span className='block text-start'>ONG</span>
                    <form className='flex flex-col my-2 mb-6'>
                        <input type="email" placeholder='Sua ONG' className='w-80 h-10 border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:border-purple-600 ' />
                    </form>
                </div>
                <Button variant="contained" color="primary" href="/OngSelector" className='w-80 h-10 bg-purple-600! hover:bg-purple-700! text-white font-bold'>Entrar</Button>
            </div>
            <div className='flex'>
                <p className='SubTitulo'>Ainda não tem um conta?</p>
                <a href="/register" className='text-xl text-purple-600 font-bold hover:text-purple-800 ml-2'>Criar minha ONG</a>
            </div>
        </div>
    )
}