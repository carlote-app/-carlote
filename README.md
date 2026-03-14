# 🤖 Carlote

> IA de QA para desenvolvedores brasileiros

A Carlote analisa seu código automaticamente, detecta bugs, gera casos de teste e abre Pull Requests com correções — em português, sem complicação.

---

## 🚀 Instalação
```bash
npm install -g carlote-ia
```

---

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do seu projeto:
```
GROQ_API_KEY=sua_chave_aqui
GITHUB_TOKEN=seu_token_aqui
```

**Onde conseguir as chaves:**
- Groq API Key (grátis): [console.groq.com](https://console.groq.com)
- GitHub Token: [github.com/settings/tokens](https://github.com/settings/tokens) — marque `public_repo`

---

## 📋 Como usar

### Analisar um arquivo
```bash
carlote-ia src/App.js
```

### Analisar e sugerir correções
```bash
carlote-ia src/App.js --fix
```

### Analisar e abrir PR automático no GitHub
```bash
carlote-ia src/App.js --pr somos-civico civico-web
```

---

## 📄 O que a Carlote gera

- `relatorio-qa-[timestamp].html` — relatório visual com bugs e casos de teste
- `relatorio-qa-[timestamp].txt` — relatório em texto puro
- `correcoes-[timestamp].html` — sugestões de correção (com --fix)
- Pull Request automático no GitHub (com --pr)

---

## 🔍 O que ela analisa

| Funcionalidade | O que verifica |
|---|---|
| Autenticação | Login, cadastro, validação |
| Chamados | CRUD, status, histórico |
| Upload de Foto | Validação, erros, tamanho |
| GPS e Localização | Permissões, tratamento de erro |
| Dashboard Admin | KPIs, gráficos, filtros |

---

## 📊 Exemplo de saída
```
🤖 CARLOTE — Relatório de QA por Funcionalidade
📁 Arquivo: App.js

📌 AUTENTICAÇÃO
BUGS ENCONTRADOS:
- Crítico: função entrar não valida municipioSel
- Alto: cadastrar não verifica email duplicado

CASOS DE TESTE:
- CT-001: Login com email e senha válidos
- CT-002: Login com email inválido
```

---

## 🛠️ Stack

- Node.js
- Groq API — Llama 3.3 (grátis)
- Octokit — integração GitHub

---

## 🗺️ Roadmap

- [x] Análise por funcionalidade
- [x] Relatório HTML profissional
- [x] Comando --fix
- [x] Abertura automática de PR
- [x] GitHub Actions
- [ ] Dashboard web
- [ ] Sistema de planos
- [ ] Migração para Claude Sonnet

---

## 📬 Contato

Site: [carlote-app.github.io/-carlote](https://carlote-app.github.io/-carlote)
npm: [npmjs.com/package/carlote-ia](https://npmjs.com/package/carlote-ia)

---

*Carlote — QA com IA para desenvolvedores brasileiros* 🤖