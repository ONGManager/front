import Image from "next/image";
import editProfileIcon from "../../../assets/editprofile.svg";

export default function Profile() {
  return (
    <div className="p-1 md:p-4">
        {/* Título e Botões de Ação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text)]">Perfil do Usuário</h1>
            </div>
            <div className="flex gap-3">
                <button className="bg-[var(--accent-soft)] px-4 py-2 rounded-lg text-[var(--accent)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] cursor-pointer text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button className="bg-[var(--accent)] px-4 py-2 rounded-lg text-white hover:opacity-90 cursor-pointer text-sm font-medium transition-opacity">
                  Salvar Alterações
                </button>
            </div>
        </div>

        {/* Formulários */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
            {/* Dados Pessoais */}
            <div className="flex-1 bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-lg p-6">
                <div className="flex items-center gap-3 pb-6 border-b border-[var(--surface-border)] mb-6">
                    <Image src={editProfileIcon} alt="Editar Perfil" width={28} height={28} />
                    <h2 className="text-[var(--text)] font-bold text-xl md:text-2xl">Dados Pessoais</h2>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Placeholder para foto de perfil */}
                    <div className="hidden md:flex bg-[var(--bg)] border-2 border-[var(--surface-border)] rounded-md w-36 h-36 shrink-0 items-center justify-center text-[var(--muted)]">
                        <svg className="w-12 h-12 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex flex-col gap-4">
                            <div>
                                <span className="text-sm font-medium text-[var(--text)] block mb-1">Nome Completo</span>
                                <input 
                                  type="text"  
                                  className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                                />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-[var(--text)] block mb-1">Email</span>
                                <input 
                                  type="email"  
                                  className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                                />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-[var(--text)] block mb-1">Telefone</span>
                                <input 
                                  type="text"  
                                  className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                                />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-[var(--text)] block mb-1">Cargo</span>
                                <input 
                                  type="text"  
                                  className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                                />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-[var(--text)] block mb-1">Link de Convite</span>
                                <input 
                                  type="url"  
                                  className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instituição */}
            <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-lg p-6 lg:w-[400px] shrink-0 h-fit">
                <div className="pb-6 border-b border-[var(--surface-border)] mb-6">
                    <h2 className="text-[var(--text)] font-bold text-xl md:text-2xl">Instituição</h2>
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <span className="text-sm font-medium text-[var(--text)] block mb-1">Nome da ONG</span>
                        <input 
                          type="text"  
                          className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                        />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-[var(--text)] block mb-1">CNPJ</span>
                        <input 
                          type="text"  
                          className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}