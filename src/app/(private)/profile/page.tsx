import Image from "next/image";
import editProfileIcon from "../../../assets/editprofile.svg";

export default function Profile() {
  return (
    <div className="p-4">
        <div className=" flex justify-between flex-row">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text)]">Perfil do Usuário</h1>
            </div>
            <div className="flex gap-4">
                <button className="bg-[var(--accent-soft)] p-2 rounded-lg text-[var(--accent)] hover:bg-[var(--danger-soft)] hover:text-[var(--text)]">Cancelar</button>
                <button className="bg-[var(--accent-soft)] p-2 rounded-lg text-[var(--accent)] hover:bg-[var(--accent-border)] hover:text-[var(--text)]">Salvar Alterações</button>
            </div>
        </div>
        <div className="flex flex-row gap-6 justify-between">
            <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-lg p-4 mt-4 pr-10 h-110">
                <div className="flex items-center justify-center gap-3 pb-4">
                    <Image src={editProfileIcon} alt="Editar Perfil" width={32} height={32} />
                    <h1 className="text-center text-[var(--text)] font-bold text-3xl">Dados Pessoais</h1>
                </div>
                <div className="flex flex-row gap-4">
                    <div className="bg-[var(--bg)] border-2 border-[var(--surface-border)] rounded-md w-80 mx-8">

                    </div>
                    <div>
                        <div className="flex flex-col">
                            <span className="text-start text-[var(--text)]">Nome Completo</span>
                            <input type="text"  
                            // placeholder="Nome"
                            className="w-80 h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)]"/>

                            <span className="text-start text-[var(--text)]">Email</span>
                            <input type="email"  
                            // placeholder="Email"
                            className="w-80 h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)]"/>

                            <span className="text-start text-[var(--text)]">Telefone</span>
                            <input type="numebr"  
                            // placeholder="Nome"
                            className="w-80 h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)]"/>

                            <span className="text-start text-[var(--text)]">Cargo</span>
                            <input type="text"  
                            className="w-80 h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)]"/>
                    
                        <span className="text-start text-[var(--text)]">Link de Convite</span>
                            <input type="url"  
                            // placeholder="Link de Convite"
                            className="w-80 h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)]"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-lg p-4 mt-4 w-110 h-60">
                <h2 className="text-center text-[var(--text)] font-bold text-3xl pb-4">Instituição</h2>
                <div className="flex flex-col mx-auto gap-2 ">
                    <span className="text-start text-[var(--text)]">Nome da ONG</span>
                    <input type="numebr"  
                    className="w-96 h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)]"/>

                    <span className="text-start text-[var(--text)]">CNPJ</span>
                    <input type="text"  
                    
                    className="w-96 h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)]"/>
                </div>
            </div>
        </div>
    </div>
  );
}