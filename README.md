
# Email Sync System

Este é um sistema de sincronização de emails com interface web que permite gerenciar múltiplas contas de email.

## URL do Projeto

**URL**: https://lovable.dev/projects/1460e44b-593c-40c9-bc59-c07ed0c0795b

## Requisitos do Sistema

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (apenas para instalação direta, não necessário para Docker)
- Supabase (para autenticação e armazenamento de dados)

## Instalação em Ubuntu Server (VPS)

### 1. Atualizar o Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Dependências

```bash
# Instalar Node.js e npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node -v
npm -v

# Instalar o Git
sudo apt install git -y

# Instalar o Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 3. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_DIRETORIO>
```

### 4. Instalar Dependências do Projeto

```bash
npm install
```

### 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 6. Compilar o Projeto

```bash
npm run build
```

### 7. Configurar o Nginx

Crie um arquivo de configuração para o Nginx:

```bash
sudo nano /etc/nginx/sites-available/emailsync
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name seu_dominio.com;
    root /caminho/para/seu/projeto/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

Ative a configuração e reinicie o Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/emailsync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Configurar o Processo como Serviço (Opcional)

Para manter a aplicação rodando, você pode usar o PM2:

```bash
# Instalar o PM2 globalmente
sudo npm install -g pm2

# Iniciar a aplicação
pm2 start npm --name "emailsync" -- run preview

# Configurar para iniciar automaticamente
pm2 startup
pm2 save
```

## Instalação com Docker

### 1. Instalar Docker e Docker Compose

```bash
# Instalar dependências
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório do Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Atualizar e instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalações
docker --version
docker-compose --version

# Adicionar seu usuário ao grupo docker (para executar comandos sem sudo)
sudo usermod -aG docker ${USER}
```

### 2. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_DIRETORIO>
```

### 3. Configurar Supabase

Antes de continuar, certifique-se de ter criado um projeto no Supabase e obter as credenciais necessárias (URL e ANON KEY).

### 4. Configurar Variáveis de Ambiente para Docker

Caso necessário, modifique o arquivo `docker-compose.yml` para incluir suas variáveis de ambiente do Supabase:

```yaml
environment:
  - SUPABASE_URL=sua_url_do_supabase
  - SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 5. Construir e Executar o Container

```bash
# Construir a imagem
docker-compose build

# Iniciar os containers
docker-compose up -d
```

### 6. Acessar a Aplicação

A aplicação estará disponível em `http://localhost` ou no IP do seu servidor.

## Verificação da Instalação

Para verificar se a instalação está funcionando corretamente:

1. Acesse a aplicação através do navegador
2. Faça login com suas credenciais
3. Verifique se pode adicionar uma conta de email e sincronizá-la

## Solução de Problemas

### Logs do Docker

Para verificar os logs do container Docker:

```bash
docker-compose logs -f
```

### Nginx

Para verificar os logs do Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Firewall

Certifique-se de que as portas necessárias estão abertas:

```bash
# Para instalação direta, abrir porta 80 (e 443 para HTTPS)
sudo ufw allow 80
sudo ufw allow 443

# Verificar status do firewall
sudo ufw status
```

## Atualização do Sistema

### Usando Git/NPM

```bash
git pull
npm install
npm run build
# Reiniciar o serviço se estiver usando PM2
pm2 restart emailsync
```

### Usando Docker

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

## Backups

É recomendado realizar backups regulares do banco de dados Supabase. Consulte a documentação do Supabase para mais informações sobre backups.

## Suporte

Para obter suporte, entre em contato através de [inserir contato de suporte aqui].
