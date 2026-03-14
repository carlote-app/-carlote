#!/usr/bin/env node
const Groq = require("groq-sdk");
const fs = require("fs");
require("dotenv").config({ path: ".env" });
const { gerarPDF } = require("./gerador");
const { abrirPR } = require("./pr");

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

async function gerarCorrecoes(relatorio, codigo, arquivo) {
  console.log("🔧 Carlote gerando correções...\n");

  const resposta = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Você é a Carlote, IA especialista em QA para projetos React e JavaScript brasileiros.
Com base nos bugs encontrados no relatório, gere correções de código em português.
Para cada bug crítico ou alto, mostre:
- O código ANTES (com o problema)
- O código DEPOIS (corrigido)
- Uma explicação simples do que foi corrigido

Seja direto e mostre apenas os trechos relevantes, não o arquivo inteiro.`,
      },
      {
        role: "user",
        content: `Relatório de bugs encontrados:\n${relatorio}\n\nCódigo original:\n${codigo.slice(0, 3000)}`,
      },
    ],
  });

  const correcoes = resposta.choices[0].message.content;
  
  const nomeArquivo = `correcoes-${Date.now()}.html`;
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Carlote — Correções</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #F1EFE8; color: #2C2C2A; }
  .capa { background: linear-gradient(135deg, #0F6E56, #085041); color: white; padding: 48px; margin-bottom: 32px; }
  .capa h1 { font-size: 36px; font-weight: 700; margin-bottom: 8px; }
  .capa h2 { font-size: 16px; opacity: 0.85; }
  .conteudo { padding: 0 32px 48px; }
  .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; line-height: 1.6; margin: 12px 0; white-space: pre-wrap; }
  p { font-size: 14px; line-height: 1.7; color: #444441; margin-bottom: 8px; }
  code { background: #EEEDFE; color: #534AB7; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
  .rodape { text-align: center; padding: 24px; color: #888780; font-size: 12px; border-top: 1px solid #D3D1C7; }
</style>
</head>
<body>
<div class="capa">
  <h1>Carlote — Correções</h1>
  <h2>Arquivo: ${arquivo} | ${new Date().toLocaleString("pt-BR")}</h2>
</div>
<div class="conteudo">
  <div class="card">
    ${correcoes
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre>$2</pre>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
    }
  </div>
</div>
<div class="rodape">Carlote — IA de QA para desenvolvedores brasileiros</div>
</body>
</html>`;

  fs.writeFileSync(nomeArquivo, html);
  console.log(`\n🔧 Correções salvas em: ${nomeArquivo}`);
  console.log("💡 Abra o arquivo no navegador para ver as correções!\n");
}

async function main() {
  const arquivo = process.argv[2];
  const modo = process.argv[3];
  const fix = modo === "--fix";
  const pr = modo === "--pr";

  if (!arquivo) {
    console.log("Uso: node src/carlote.js <arquivo> [--fix] [--pr]");
    return;
  }

  if (!fs.existsSync(arquivo)) {
    console.log(`Arquivo não encontrado: ${arquivo}`);
    return;
  }

  const codigo = fs.readFileSync(arquivo, "utf8");
  let relatorio = "";

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🤖 CARLOTE — Relatório de QA por Funcionalidade");
  console.log(`📁 Arquivo: ${arquivo}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

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

  const nomeRelatorio = `relatorio-qa-${Date.now()}`;
  fs.writeFileSync(`${nomeRelatorio}.txt`, `CARLOTE — RELATÓRIO DE QA\nArquivo: ${arquivo}\nData: ${new Date().toLocaleString("pt-BR")}\n${relatorio}`);
  await gerarPDF(relatorio, arquivo);

  if (fix) {
    console.log("\n🔧 Modo --fix ativado! Gerando correções...\n");
    await gerarCorrecoes(relatorio, codigo, arquivo);
  }

  if (pr) {
    console.log("\n🔀 Modo --pr ativado! Abrindo PR com correções...\n");
    const owner = process.argv[4] || "somos-civico";
    const repo = process.argv[5] || "civico-web";
    await abrirPR(owner, repo, codigo, arquivo);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Análise concluída!`);
  console.log(`📄 Relatório salvo em: ${nomeRelatorio}.txt`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main();