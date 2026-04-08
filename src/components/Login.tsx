import Logo from "../assets/Logo.png";
import Image from "next/image";

interface LoginProps {
  Titulo: string;
  Subtitulo: string;
}

export default function LoginPadrao({ Titulo, Subtitulo }: LoginProps) {
  return (
    <div className="align-middle flex flex-col justify-center items-center">
        <Image src={Logo} alt="Logo ONG Manager" className="ImagemLogo" width={300} height={50}/>
        <h1 className="Titulo">{Titulo}</h1>
        <p className="SubTitulo">{Subtitulo}</p>
    </div>
  );
}