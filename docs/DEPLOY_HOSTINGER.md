# Deploy na Hostinger (Apache)

Para que **URLs diretas** funcionem no navegador (ex.: `https://seusite.com/sistema/login`, `https://seusite.com/sistema/ficha-venda/123`, `https://seusite.com/sistema/ficha-proposta`), é preciso configurar dois arquivos `.htaccess`.

## 1. Raiz do domínio (public_html)

No **Gerenciador de Arquivos** da Hostinger, na **raiz** do site (geralmente `public_html`):

- Se já existir um `.htaccess`, **adicione** as regras do arquivo **`.htaccess.root`** do projeto (principalmente o bloco que trata `/sistema` e `/sistema/*`).
- Se não existir, **renomeie/copie** o conteúdo do `.htaccess.root` para um arquivo chamado **`.htaccess`** na raiz.

Assim, quando alguém acessar `https://seusite.com/sistema/ficha-venda` ou qualquer rota em `/sistema/`, o servidor vai servir o `index.html` do sistema em vez de devolver 404.

## 2. Pasta do sistema (/sistema/)

Depois do build (`npm run build` ou `yarn build`), envie a pasta **dist** (ou **build**) para o servidor **dentro de uma pasta chamada `sistema`**:

```
public_html/
  .htaccess          ← conteúdo de .htaccess.root (raiz)
  index.html         ← site da raiz (se houver)
  sistema/           ← build do front (imobx-front)
    .htaccess        ← cópia do arquivo .htaccess do projeto (não o .htaccess.root)
    index.html
    logo-url.svg     ← favicon (vem de public/ no build; precisa estar na pasta)
    site.webmanifest
    assets/
      ...
```

O arquivo **`.htaccess`** que fica **dentro de `sistema/`** é o que está na raiz do projeto **imobx-front** (o arquivo chamado `.htaccess`, **não** o `.htaccess.root`). Ele garante que todas as rotas como `/sistema/login`, `/sistema/ficha-venda`, `/sistema/ficha-proposta` caiam no mesmo `index.html` (SPA).

## Resumo

| Onde no servidor | Qual arquivo usar |
|------------------|-------------------|
| Raiz (public_html) | Conteúdo de **`.htaccess.root`** → salvar como `.htaccess` |
| Dentro de `sistema/` | Arquivo **`.htaccess`** do projeto (o que está em imobx-front/.htaccess) |

Com isso, ao colar no navegador `https://intellisysbr.com/sistema/login` ou `https://intellisysbr.com/sistema/ficha-venda/123`, a página abre corretamente em vez de “não existe”.
