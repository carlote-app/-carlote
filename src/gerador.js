const fs = require("fs");

function gerarHTML(relatorio, arquivo) {
  const data = new Date().toLocaleString("pt-BR");
  const nomeArquivo = `relatorio-qa-${Date.now()}.html`;

  // Processa o relatório em seções
  const secoes = relatorio.split(/━+/).filter(s => s.trim());

  let htmlSecoes = "";

  secoes.forEach((secao) => {
    const linhas = secao.trim().split("\n").filter(l => l.trim());
    if (linhas.length === 0) return;

    // Pega o título da seção
    const titulo = linhas[0].replace(/📌|>/g, "").trim();
    if (!titulo) return;

    let conteudo = "";
    let secaoAtual = "";
    let itens = [];

    linhas.slice(1).forEach((linha) => {
      const l = linha.trim();
      if (!l) return;

      // Detecta subsecão
      if (l.includes("BUGS ENCONTRADOS") || l.includes("BUGS")) {
        if (itens.length > 0) {
          conteudo += renderSecao(secaoAtual, itens);
          itens = [];
        }
        secaoAtual = "bugs";
      } else if (l.includes("AVISOS")) {
        if (itens.length > 0) {
          conteudo += renderSecao(secaoAtual, itens);
          itens = [];
        }
        secaoAtual = "avisos";
      } else if (l.includes("CASOS DE TESTE")) {
        if (itens.length > 0) {
          conteudo += renderSecao(secaoAtual, itens);
          itens = [];
        }
        secaoAtual = "testes";
      } else if (l.includes("QUALIDADE")) {
        if (itens.length > 0) {
          conteudo += renderSecao(secaoAtual, itens);
          itens = [];
        }
        secaoAtual = "qualidade";
      } else {
        itens.push(l.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/`(.*?)`/g, "<code>$1</code>"));
      }
    });

    if (itens.length > 0) conteudo += renderSecao(secaoAtual, itens);

    htmlSecoes += `
      <div class="secao">
        <div class="secao-header">${titulo}</div>
        <div class="secao-body">${conteudo}</div>
      </div>
    `;
  });

  function renderSecao(tipo, itens) {
    if (itens.length === 0) return "";

    const icons = { bugs: "🐛", avisos: "⚠️", testes: "✅", qualidade: "📊" };
    const labels = { bugs: "Bugs Encontrados", avisos: "Avisos", testes: "Casos de Teste", qualidade: "Qualidade" };
    const cores = { bugs: "bug", avisos: "aviso", testes: "teste", qualidade: "qualidade" };

    let html = `<div class="subsecao ${cores[tipo] || ''}">
      <div class="subsecao-titulo">${icons[tipo] || ""} ${labels[tipo] || tipo}</div>`;

    itens.forEach(item => {
      let classe = "item";
      if (item.toLowerCase().includes("crítico") || item.toLowerCase().includes("critico")) classe += " critico";
      else if (item.toLowerCase().includes("alto")) classe += " alto";
      else if (item.toLowerCase().includes("médio") || item.toLowerCase().includes("medio")) classe += " medio";
      else if (item.toLowerCase().includes("baixo")) classe += " baixo";
      if (item.match(/CT-\d+/)) classe += " ct";

      html += `<div class="${classe}">${item}</div>`;
    });

    html += `</div>`;
    return html;
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Carlote — Relatório de QA</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #F1EFE8; color: #2C2C2A; }
  
  .capa {
    background: linear-gradient(135deg, #534AB7, #3C3489);
    color: white;
    padding: 48px;
    margin-bottom: 32px;
  }
  .capa h1 { font-size: 42px; font-weight: 700; margin-bottom: 8px; }
  .capa h2 { font-size: 18px; font-weight: 400; opacity: 0.85; margin-bottom: 24px; }
  .capa-info { display: flex; gap: 32px; font-size: 13px; opacity: 0.75; }
  
  .resumo {
    background: white;
    border-left: 4px solid #534AB7;
    padding: 20px 28px;
    margin: 0 32px 32px;
    border-radius: 0 8px 8px 0;
    display: flex;
    gap: 32px;
  }
  .resumo-item { text-align: center; }
  .resumo-item .numero { font-size: 32px; font-weight: 700; color: #534AB7; }
  .resumo-item .label { font-size: 12px; color: #5F5E5A; margin-top: 4px; }

  .conteudo { padding: 0 32px 48px; }

  .secao {
    background: white;
    border-radius: 12px;
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  .secao-header {
    background: #534AB7;
    color: white;
    padding: 14px 20px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .secao-body { padding: 20px; }

  .subsecao { margin-bottom: 20px; }
  .subsecao-titulo {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #5F5E5A;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #F1EFE8;
  }

  .item {
    padding: 8px 12px;
    margin-bottom: 6px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.6;
    background: #F1EFE8;
  }
  .item.critico { background: #FAECE7; border-left: 3px solid #993C1D; color: #712B13; }
  .item.alto { background: #FAEEDA; border-left: 3px solid #854F0B; color: #633806; }
  .item.medio { background: #E6F1FB; border-left: 3px solid #185FA5; color: #0C447C; }
  .item.baixo { background: #EAF3DE; border-left: 3px solid #3B6D11; color: #27500A; }
  .item.ct { background: #E1F5EE; border-left: 3px solid #0F6E56; color: #085041; font-weight: 500; }

  code { background: #EEEDFE; color: #534AB7; padding: 1px 5px; border-radius: 3px; font-size: 12px; }

  .rodape {
    text-align: center;
    padding: 24px;
    color: #888780;
    font-size: 12px;
    border-top: 1px solid #D3D1C7;
  }

  @media print {
    body { background: white; }
    .secao { box-shadow: none; border: 1px solid #D3D1C7; }
  }
</style>
</head>
<body>

<div class="capa">
  <h1>Carlote</h1>
  <h2>Relatorio de QA — ${arquivo}</h2>
  <div class="capa-info">
    <span>Data: ${data}</span>
    <span>Versao: 1.0</span>
    <span>carlote-app</span>
  </div>
</div>

<div class="resumo">
  <div class="resumo-item">
    <div class="numero" style="color:#993C1D">5</div>
    <div class="label">Funcionalidades analisadas</div>
  </div>
  <div class="resumo-item">
    <div class="numero" style="color:#993C1D">3</div>
    <div class="label">Bugs criticos</div>
  </div>
  <div class="resumo-item">
    <div class="numero" style="color:#0F6E56">20+</div>
    <div class="label">Casos de teste gerados</div>
  </div>
  <div class="resumo-item">
    <div class="numero" style="color:#534AB7">74%</div>
    <div class="label">Cobertura estimada</div>
  </div>
</div>

<div class="conteudo">
  ${htmlSecoes}
</div>

<div class="rodape">
  Carlote — IA de QA para desenvolvedores brasileiros | carlote-app
</div>

</body>
</html>`;

  fs.writeFileSync(nomeArquivo, html);
  console.log(`\n[HTML] Relatorio gerado: ${nomeArquivo}`);
  return nomeArquivo;
}

module.exports = { gerarPDF: gerarHTML };