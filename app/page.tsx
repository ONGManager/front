'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import LoginPadrao from './components/Login';
import { loginApi } from './lib/api';
import { toast } from 'sonner';

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await loginApi(email, password);
      toast.success('Login realizado com sucesso!');
      window.location.href = '/OngSelector';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'E-mail ou senha inválidos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen align-middle flex flex-col justify-center items-center">
      <div className='flex flex-col items-center justify-center'>
        <LoginPadrao Titulo="Bem-vindo de volta!" Subtitulo="Entre na sua conta para gerenciar sua ONG" />
        <form
          className='flex flex-col items-center justify-center mt-4 mb-4 mx-auto w-98 h-78 bg-white border border-gray-300 rounded-2xl shadow-2xl p-8'
          onSubmit={handleSubmit}
        >
          <div className='w-80'>
            <span className='block text-start'>E-mail</span>
            <div className='flex flex-col my-2 mb-6'>
              <input
                type="email"
                placeholder='Digite seu e-mail'
                className='w-80 h-10 border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:border-purple-600 '
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>
          <div className='w-80'>
            <span className='block text-start'>Senha</span>
            <div className='flex flex-col my-2 mb-8'>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Digite sua senha'
                  className='w-80 h-10 border-2 border-gray-300 rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:border-purple-600'
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 text-sm"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-0.72 1.62-1.83 3.06-3.2 4.2" />
                      <path d="M6.1 6.1C4.05 7.44 2.48 9.5 1 12c1.73 3.89 6 7 11 7 1.14 0 2.25-0.16 3.3-0.45" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <a href='/forgot-password' className='text-purple-600 font-bold hover:text-purple-800 cursor-pointer block text-right'>Esqueceu a senha?</a>
            </div>
          </div>
          <div className=''>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className='w-80 h-10 bg-purple-600! hover:bg-purple-700! text-white'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
        <div className='flex'>
          <p className='SubTitulo'>Ainda não tem uma conta?</p>
          <a href="/register" className='text-xl text-purple-600 font-bold hover:text-purple-800 ml-2'>Criar minha ONG</a>
        </div>
      </div>
    </main>
  );
}
