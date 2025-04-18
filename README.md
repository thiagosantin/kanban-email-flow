
# Email Sync System

Sistema de sincronização de emails com interface web para gerenciar múltiplas contas de email.

## Ambiente de Desenvolvimento

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (apenas para instalação direta)
- Supabase (autenticação e dados)

## Instalação

Escolha um dos métodos de instalação abaixo:

### Método 1: Docker com Traefik (Recomendado)

1. **Pré-requisitos**
   ```bash
   # Instalar Docker e Docker Compose
   curl -fsSL https://get.docker.com | sudo sh
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Configuração**
   ```bash
   # Criar rede do Traefik
   docker network create traefik-public

   # Clonar repositório
   git clone <URL_DO_REPOSITORIO>
   cd <NOME_DO_DIRETORIO>

   # Criar pasta para certificados
   mkdir -p letsencrypt
   ```

3. **Configurar Variáveis**
   - Edite `docker-compose.yml`:
     - Substitua `your-email@example.com` pelo seu email
     - Substitua `your-domain.com` pelo seu domínio
     - Configure as variáveis do Supabase

4. **Iniciar Aplicação**
   ```bash
   docker-compose up -d
   ```

### Método 2: Instalação Direta (Ubuntu Server)

1. **Preparar Ambiente**
   ```bash
   # Atualizar sistema
   sudo apt update && sudo apt upgrade -y

   # Instalar Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs nginx git

   # Verificar instalação
   node -v
   npm -v
   ```

2. **Configurar Aplicação**
   ```bash
   # Clonar e instalar
   git clone <URL_DO_REPOSITORIO>
   cd <NOME_DO_DIRETORIO>
   npm install

   # Configurar variáveis
   echo "SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase" > .env

   # Compilar
   npm run build
   ```

3. **Configurar Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/emailsync
   ```
   
   Adicionar configuração:
   ```nginx
   server {
       listen 80;
       server_name seu_dominio.com;
       root /caminho/para/seu/projeto/dist;
       
       location / {
           try_files $uri $uri/ /index.html;
       }

       location /assets {
           expires 1y;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/emailsync /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Manutenção

### Atualizações

Com Docker:
```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

Instalação direta:
```bash
git pull
npm install
npm run build
sudo systemctl restart nginx
```

### Monitoramento

```bash
# Logs Docker
docker-compose logs -f [serviço]

# Status Nginx
sudo systemctl status nginx

# Verificar portas
sudo netstat -tulpn | grep '80\|443'
```

### Backup

Realize backups regulares do banco de dados Supabase através do painel de controle.

## Suporte

Para suporte técnico, entre em contato através de [inserir contato].

