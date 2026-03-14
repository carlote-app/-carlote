const { Octokit } = require("@octokit/rest");
const fs = require("fs");
require("dotenv").config({ path: ".env" });

async function abrirPR(owner, repo, correcoes, arquivo) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const branch = `carlote-fix-${Date.now()}`;

  console.log(`\n🔀 Carlote abrindo PR no ${owner}/${repo}...`);

  try {
    // Pega o SHA do branch main
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: "heads/main",
    });
    const sha = ref.object.sha;

    // Cria novo branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha,
    });

    console.log(`✅ Branch criado: ${branch}`);

    // Pega o conteúdo atual do arquivo
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path: `src/${arquivo}`,
    });

    // Atualiza o arquivo com as correções
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: arquivo,
      message: `fix: correções automáticas da Carlote`,
      content: Buffer.from(correcoes).toString("base64"),
      sha: fileData.sha,
      branch,
    });

    console.log(`✅ Arquivo atualizado no branch`);

    // Abre o PR
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: "🤖 Carlote — Correções automáticas de QA",
      body: `## Correções automáticas geradas pela Carlote\n\nEste PR foi gerado automaticamente pela [Carlote](https://carlote-app.github.io/-carlote), IA de QA para desenvolvedores brasileiros.\n\n### O que foi corrigido:\n- Bugs críticos e altos identificados na análise\n- Melhorias de segurança\n- Tratamento de erros\n\n> Revise as mudanças antes de aprovar. A Carlote sugere, você decide.`,
      head: branch,
      base: "main",
    });

    console.log(`\n🎉 PR aberto com sucesso!`);
    console.log(`🔗 Link: ${pr.html_url}`);
    
    return pr.html_url;

  } catch (error) {
    console.error(`\n❌ Erro ao abrir PR: ${error.message}`);
    throw error;
  }
}

module.exports = { abrirPR };