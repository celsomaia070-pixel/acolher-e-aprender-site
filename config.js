// CONFIGURAÇÃO DA LOJA: altere os campos abaixo antes de publicar.
// A chave Pix é pública para permitir que compradores façam pagamentos.
// NUNCA coloque senhas, tokens secretos ou credenciais bancárias neste arquivo.
window.STORE_CONFIG = {
  nome: "Acolher & Aprender",
  vendasHabilitadas: false,  // mantenha false enquanto os materiais digitais não estiverem prontos e licenciados
  pixKey: "",                // EXEMPLO: email@dominio.com, celular +5514999999999, CPF, CNPJ ou chave aleatória
  pixRecebedor: "NOME DO TITULAR", // Nome real da conta Pix (máximo 25 caracteres no QR)
  pixCidade: "MARILIA",    // Cidade real do recebedor (máximo 15 caracteres no QR)
  whatsapp: "",             // Apenas números com DDI e DDD. Exemplo: 5514999999999
  email: ""                 // Exemplo: contato@sualoja.com
};
// IMPORTANTE: site estático gera QR Pix, mas NÃO consulta o banco nem confirma pagamentos.
// Para entrega automática: backend + provedor Pix com API, webhook verificado e armazenamento seguro.