import { z } from "zod";

// ============================================
// VALIDADORES REUTILIZÁVEIS
// ============================================

// Validação de CNPJ (formato: XX.XXX.XXX/XXXX-XX)
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const validarCNPJ = (cnpj: string) => {
  return cnpjRegex.test(cnpj);
};

// Aplica máscara visual de CNPJ (12345678901234 -> 12.345.678/9012-34)
export const aplicarMascaraCNPJ = (valor: string): string => {
  const numeros = valor.replace(/\D/g, ""); // Remove tudo que não é número
  return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

// Validação de senha forte
const validarSenhaForte = (senha: string) => {
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /\d/.test(senha);
  const temEspecial = /[!@#$%^&*()_+=\[\]{};:'",.<>?/\\|-]/.test(senha);
  
  return temMaiuscula && temMinuscula && temNumero && temEspecial;
};

// ============================================
// SCHEMA: REGISTRO DE ONG
// ============================================
export const RegisterOngSchema = z.object({
  nomeOng: z.string()
    .min(3, "Nome da ONG deve ter no mínimo 3 caracteres")
    .max(100, "Nome da ONG não pode exceder 100 caracteres")
    .trim(),
  
  cnpj: z.string()
    .refine(validarCNPJ, "CNPJ deve estar no formato: XX.XXX.XXX/XXXX-XX")
    .transform(val => val.replace(/\D/g, "")), // Armazena apenas números
  
  nomeResponsavel: z.string()
    .min(3, "Nome do responsável deve ter no mínimo 3 caracteres")
    .max(100, "Nome do responsável não pode exceder 100 caracteres")
    .regex(/^[a-záàâãéèêíïóôõöúçñ\s'-]+$/i, "Nome contém caracteres inválidos")
    .trim(),
  
  email: z.string()
    .email("Endereço de email inválido")
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(40, "A senha não pode exceder 40 caracteres")
    .refine(validarSenhaForte, 
      "Senha deve conter: maiúsculas, minúsculas, números e caracteres especiais (!@#$%^&*)"
    ),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

export type RegisterOngFormData = z.infer<typeof RegisterOngSchema>;

// ============================================
// SCHEMA: LOGIN (VALIDAR COM BANCO)
// ============================================
export const LoginSchema = z.object({
  email: z.string()
    .email("Endereço de email inválido")
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(1, "Senha é obrigatória"),
}).superRefine(async (data, ctx) => {
  // ⚠️ IMPORTANTE: Esta validação é assíncrona (chama o banco)
  // Será executada APENAS ao submeter o formulário
  
  try {
    const response = await fetch('/api/auth/validate-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      // Email não encontrado OU senha incorreta
      if (result.error === 'email_not_found') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'Email não cadastrado no sistema',
        });
      } else if (result.error === 'password_mismatch') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Senha incorreta',
        });
      }
    }
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['email'],
      message: 'Erro ao validar login. Tente novamente.',
    });
  }
});

export type LoginFormData = z.infer<typeof LoginSchema>;

// ============================================
// SCHEMA: CRIAR USUÁRIO (compatibilidade)
// ============================================
export const CreateUserSchema = z.object({
  name: z.string().min(1, "Nome de usuário muito curto"),
  email: z.string().email("Endereço de email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

// Tipo TypeScript extraído do schema (para usar no componente)
//export type RegisterOngFormData = z.infer<typeof RegisterOngSchema>;