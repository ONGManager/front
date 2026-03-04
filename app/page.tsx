import Image from 'next/image';
import Logo from './assets/Logo.png';
import { Button } from '@mui/material';

export default function Home() {
  return (
    <main className="h-screen align-middle flex flex-col justify-center items-center">
      
      <Image src={Logo} alt="Logo ONG Manager" width={300} height={50}/>
      
      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-6xl font-bold text-center text-purple-800'>Bem-vindo de volta!</h1>
        <br />
        <p className='text-gray-700 text-xl'>Entre na sua conta para gerenciar sua ONG</p>
        <div className='flex flex-col items-center justify-center my-8 mx-auto w-125 h-75 bg-white rounded-lg shadow-md p-6'>
          <Button variant="contained" className='bg-purple-600! hover:bg-purple-700! w-90 '>Entrar</Button>
        </div>
        <div className='flex'>
          <p className='text-gray-700 text-xl align-middle'>Ainda não tem um conta?</p>
          <a href="/register" className='text-xl text-purple-600 font-bold hover:text-purple-800 ml-2'>Criar minha ONG</a>
        </div>
      </div>
    </main>
  );
}
