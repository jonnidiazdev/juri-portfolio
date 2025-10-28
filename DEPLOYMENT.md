# 🚀 Deployment Guide - El Juri-Portfolio

## Preparación General

### 1. Build de Producción
```bash
npm run build:full
```

### 2. Variables de Entorno Requeridas
```bash
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://tu-dominio.com
IOL_USER=tu_usuario_iol          # Opcional
IOL_PASS=tu_contraseña_iol       # Opcional
```

---

## 🌐 Vercel (Recomendado para este proyecto)

### Configuración

1. **Instalar Vercel CLI**:
```bash
npm i -g vercel
```

2. **Crear `vercel.json`**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/production.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/production.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **Deploy**:
```bash
vercel --prod
```

### Variables de Entorno en Vercel
```bash
vercel env add NODE_ENV production
vercel env add IOL_USER tu_usuario
vercel env add IOL_PASS tu_contraseña
```

---

## 🐳 Docker (VPS/Cloud)

### Build y Run
```bash
# Build image
docker build -t juri-portfolio .

# Run container
docker run -d \
  --name juri-portfolio \
  -p 4000:4000 \
  -e NODE_ENV=production \
  -e IOL_USER=tu_usuario \
  -e IOL_PASS=tu_contraseña \
  juri-portfolio
```

### Con Docker Compose
```bash
# Configurar .env.production
cp .env.example .env.production

# Deploy
docker-compose up -d
```

---

## ☁️ Railway

### Configuración

1. **Conectar repositorio** en Railway dashboard

2. **Variables de entorno**:
```
NODE_ENV=production
PORT=$PORT
IOL_USER=tu_usuario
IOL_PASS=tu_contraseña
```

3. **Build command**: `npm run build:full`
4. **Start command**: `npm start`

---

## 🌊 DigitalOcean App Platform

### Configuración `app.yaml`

```yaml
name: juri-portfolio
services:
- name: web
  source_dir: /
  github:
    repo: tu-usuario/juri-portfolio
    branch: main
  run_command: npm start
  build_command: npm run build:full
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: IOL_USER
    value: tu_usuario
    type: SECRET
  - key: IOL_PASS
    value: tu_contraseña
    type: SECRET
  http_port: 4000
```

---

## 🚀 Heroku

### Configuración

1. **Crear `Procfile`**:
```
web: npm start
```

2. **Deploy**:
```bash
# Install Heroku CLI
heroku create juri-portfolio

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set IOL_USER=tu_usuario
heroku config:set IOL_PASS=tu_contraseña

# Deploy
git push heroku main
```

---

## 🖥️ VPS Manual (Ubuntu/CentOS)

### 1. Preparar Servidor
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

### 2. Deploy Aplicación
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/juri-portfolio.git
cd juri-portfolio

# Instalar dependencias
npm install

# Build para producción
npm run build:full

# Configurar variables de entorno
cp .env.example .env.production
nano .env.production

# Iniciar con PM2
pm2 start dist/server/production.js --name "juri-portfolio"
pm2 save
pm2 startup
```

### 3. Configurar Nginx (Opcional)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Comandos de Producción

### Build
```bash
npm run build:full    # Build completo (frontend + copia backend)
```

### Start
```bash
npm start            # Iniciar en modo producción
```

### Health Check
```bash
curl http://localhost:4000/api/health
```

### Logs
```bash
# Con PM2
pm2 logs juri-portfolio

# Con Docker
docker logs juri-portfolio

# Con systemd (VPS)
journalctl -u juri-portfolio -f
```

---

## ⚠️ Consideraciones Importantes

### Seguridad
- ✅ Variables de entorno configuradas correctamente
- ✅ CORS configurado para dominio específico
- ✅ HTTPS habilitado (depende del hosting)
- ✅ Credenciales IOL opcionales (usuarios pueden configurar desde UI)

### Performance
- ✅ Archivos estáticos servidos eficientemente
- ✅ Code splitting implementado
- ✅ Compresión gzip habilitada (hosting)

### Monitoreo
- ✅ Health check endpoint disponible
- ✅ Logging de errores
- ✅ Graceful shutdown implementado

---

## 🐛 Troubleshooting

### Error: "EADDRINUSE"
```bash
# Verificar puerto ocupado
lsof -i :4000
```

### Error: SSL Certificate
```bash
# Verificar variables de entorno
echo $REJECT_UNAUTHORIZED
```

### Error: Static files not found
```bash
# Verificar build
ls -la dist/
```

### Logs de debugging
```bash
# Activar debug en producción (temporal)
export DEBUG_IOL=true
```