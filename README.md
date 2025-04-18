
# Email Sync System

Sistema de sincronização de emails com interface web para gerenciar múltiplas contas de email.

## Requisitos

- Docker e Docker Compose
- Conta Supabase (para autenticação e armazenamento de dados)

## Instalação Rápida

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_DIRETORIO>
```

### 2. Configure o arquivo .env

Crie um arquivo `.env` com as seguintes variáveis:

```
# Supabase (Obrigatório)
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Traefik (Recomendado alterar)
TRAEFIK_EMAIL=seu-email@example.com
APP_DOMAIN=seudominio.com
TRAEFIK_DASHBOARD_DOMAIN=traefik.seudominio.com
TRAEFIK_DASHBOARD_USER=admin
TRAEFIK_DASHBOARD_PASSWORD=sua_senha_criptografada  # Use htpasswd para gerar
```

Para gerar uma senha criptografada para o dashboard do Traefik:

```bash
docker run --rm httpd:alpine htpasswd -nbB admin "senha_segura" | sed -e s/\\$/\\$\\$/g
```

### 3. Inicie os serviços

```bash
mkdir -p letsencrypt
docker compose up -d
```

O sistema estará disponível em `https://seudominio.com` e o dashboard do Traefik em `https://traefik.seudominio.com`.

## Manutenção

### Visualizar logs

```bash
docker compose logs -f email-sync
```

### Atualizar para nova versão

```bash
git pull
docker compose down
docker compose up -d --build
```

## Solução de Problemas

1. **Certificados HTTPS não funcionam**: Verifique se seu domínio está apontando corretamente para o servidor.

2. **Problemas de conexão com Supabase**: Verifique as credenciais no arquivo `.env`.

3. **Erro ao sincronizar emails**: Verifique os logs com `docker compose logs -f email-sync`.

## Segurança

- O dashboard do Traefik é protegido por autenticação básica.
- HTTPS é configurado automaticamente com Let's Encrypt.
- As credenciais do Supabase são injetadas no ambiente em tempo de execução.

## Suporte

Para suporte técnico, entre em contato através de [inserir contato].
