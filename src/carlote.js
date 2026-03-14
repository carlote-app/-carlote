const Groq = require("groq-sdk");
const fs = require("fs");
require("dotenv").config({ path: ".env" });
const { gerarPDF } = require("./gerador");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const FUNCIONALIDADES = [
  { nome: "Autenticação", palavras: ["login", "senha", "auth", "usuario", "cadastro", "signIn", "signUp"] },
  { nome: "Chamados", palavras: ["chamado", "reporte", "ocorrencia", "status", "aberto", "resolvido"] },
  { nome: "Upload de Foto", palavras: ["foto", "upload", "imagem", "cloudinary", "arquivo"] },
  { nome: "GPS e Localização", palavras: ["gps", "location", "latitude", "longitude", "mapa", "leaflet"] },
  { nome: "Dashboard Admin", palavras: ["dashboard", "admin", "prefeitura", "kpi", "grafico", "recharts"] },
];

function extrairTrecho(codigo, palavras) {
  const linhas = codigo.split("\n");
  const linhasRelevantes = [];
  
  linhas.forEach((linha, i) => {
    const relevante = palavras.some(p => linha.toLowerCase().includes(p.toLowerCase()));
    if (relevante) {
      const inicio = Math.max(0, i - 3);
      const fim = Math.min(linhas.length, i + 10);
      linhasRelevantes.push(...linhas.slice(inicio, fim));
    }
  });

  const unicas = [...new Set(linhasRelevantes)];
  return unicas.slice(0, 80).join("\n");
}

async function analisar(trecho, funcionalidade) {
  if (!trecho || trecho.trim().length < 50) {
    return `Nenhum código relacionado a "${funcionalidade}" encontrado neste arquivo.`;
  }

  console.log(`\n🔍 Analisando: ${funcionalidade}...`);

  const resposta = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Você é a Carlote, IA especialista em QA para projetos React e JavaScript brasileiros.
Analise o código da funcionalidade "${funcionalidade}" e responda em português com:

1. BUGS ENCONTRADOS — severidade (Crítico/Alto/Médio/Baixo)
2. AVISOS — pontos de atenção
3. CASOS DE TESTE — formato CT-001, CT-002...
4. QUALIDADE — resumo em uma linha

Seja direto e técnico.`,
      },
      {
        role: "user",
        content: `Funcionalidade: ${funcionalidade}\n\nCódigo:\n${trecho}`,
      },
    ],
  });

  return resposta.choices[0].message.content;
}

async function main() {
  const arquivo = process.argv[2];

  if (!arquivo) {
    console.log("Uso: node src/carlote.js <arquivo>");
    return;
  }

  if (!fs.existsSync(arquivo)) {
    console.log(`Arquivo não encontrado: ${arquivo}`);
    return;
  }

  const codigo = fs.readFileSync(arquivo, "utf8");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🤖 CARLOTE — Relatório de QA por Funcionalidade");
  console.log(`📁 Arquivo: ${arquivo}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  let relatorio = "";

  for (let i = 0; i < FUNCIONALIDADES.length; i++) {
    const { nome, palavras } = FUNCIONALIDADES[i];
    const trecho = extrairTrecho(codigo, palavras);
    const resultado = await analisar(trecho, nome);

    const secao = `\n${"━".repeat(40)}\n📌 ${nome.toUpperCase()}\n${"━".repeat(40)}\n${resultado}\n`;
    console.log(secao);
    relatorio += secao;

    if (i < FUNCIONALIDADES.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  // Salva o relatório em arquivo
  const nomeRelatorio = `relatorio-qa-${Date.now()}.txt`;
  fs.writeFileSync(nomeRelatorio, `CARLOTE — RELATÓRIO DE QA\nArquivo: ${arquivo}\nData: ${new Date().toLocaleString("pt-BR")}\n${relatorio}`);
  await gerarPDF(relatorio, arquivo);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Análise concluída!`);
  console.log(`📄 Relatório salvo em: ${nomeRelatorio}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}
    
main();