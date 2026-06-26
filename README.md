<h1 align="center">
  📋 ProjetoIMP — Sistema de Gerenciamento de Tarefas
</h1>

<p align="center">
  Aplicação fullstack para criação, acompanhamento e gerenciamento de tarefas, com mensageria assíncrona e monitoramento em tempo real.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/RabbitMQ-3-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prometheus-scraping-E6522C?style=for-the-badge&logo=prometheus&logoColor=white"/>
  <img src="https://img.shields.io/badge/Grafana-dashboard-F46800?style=for-the-badge&logo=grafana&logoColor=white"/>
</p>

---

## 📁 Estrutura do Projeto

```
ProjetoIMP/
├── backend/
│   ├── src/
│   │   ├── index.js                  # Entrypoint da aplicação
│   │   ├── database.js               # Conexão com MySQL
│   │   ├── metrics.js                # Métricas Prometheus
│   │   ├── routes/
│   │   │   └── tasks.js              # Rotas CRUD de tarefas
│   │   └── services/
│   │       └── notificationService.js # Integração com RabbitMQ
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── css/style.css
│   │   └── js/app.js
│   ├── nginx/nginx.conf
│   └── Dockerfile
├── database/
│   └── init.sql                      # Script de inicialização do banco
├── monitoring/
│   ├── prometheus/prometheus.yml
│   └── grafana/
│       ├── dashboards/
│       └── provisioning/
└── docker-compose.yml
```

---

## 🚀 Tecnologias Utilizadas

| Camada | Tecnologia | Finalidade |
|---|---|---|
| **Backend** | Node.js + Express | API REST |
| **Banco de Dados** | MySQL 8.0 | Persistência de tarefas |
| **Mensageria** | RabbitMQ 3 | Notificações assíncronas |
| **Frontend** | HTML + CSS + JavaScript | Interface do usuário (via Nginx) |
| **Monitoramento** | Prometheus | Coleta de métricas |
| **Dashboards** | Grafana | Visualização de métricas |
| **Infraestrutura** | Docker + Docker Compose | Orquestração de contêineres |

---

## ✅ Funcionalidades

- **Criação de tarefas** com título e descrição
- **Listagem de tarefas** ordenadas por data de criação
- **Atualização de tarefas** — título, descrição e status (`pendente`, `em_andamento`, `concluida`)
- **Exclusão de tarefas**
- **Notificações assíncronas** via RabbitMQ a cada criação ou atualização de tarefa
- **Métricas de observabilidade** expostas em `/metrics` (Prometheus):
  - Total de requisições HTTP por método, rota e status
  - Duração das requisições HTTP
  - Total de tarefas criadas e concluídas
  - Total de mensagens enviadas ao RabbitMQ
- **Dashboard Grafana** pré-configurado com provisioning automático
- **Health check** disponível em `/health`

---

## ⚙️ Pré-requisitos

- [Docker](https://www.docker.com/) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado

> Não é necessário ter Node.js, MySQL ou qualquer outra dependência instalada localmente — tudo roda em contêineres.

---

## ▶️ Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/ProjetoIMP.git
cd ProjetoIMP
```

### 2. Suba todos os serviços com Docker Compose

```bash
docker compose up --build
```

> Na primeira execução, o Docker irá baixar as imagens e construir os contêineres. Aguarde até todos os serviços estarem saudáveis.

### 3. Acesse a aplicação

| Serviço | URL |
|---|---|
| **Frontend** | http://localhost:8081 |
| **API Backend** | http://localhost:3002/api/tasks |
| **Health Check** | http://localhost:3002/health |
| **Métricas (Prometheus)** | http://localhost:3002/metrics |
| **Prometheus** | http://localhost:9091 |
| **Grafana** | http://localhost:3001 |
| **RabbitMQ Management** | http://localhost:15672 |

### 4. Credenciais padrão

| Serviço | Usuário | Senha |
|---|---|---|
| **Grafana** | `admin` | `admin` |
| **RabbitMQ** | `guest` | `guest` |
| **MySQL** | `taskuser` | `taskpass` |

---

## 🛑 Encerrando os Serviços

```bash
docker compose down
```

Para remover também os volumes (banco de dados e dados do Grafana/Prometheus):

```bash
docker compose down -v
```

---

## 📡 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/tasks` | Lista todas as tarefas |
| `POST` | `/api/tasks` | Cria uma nova tarefa |
| `PUT` | `/api/tasks/:id` | Atualiza uma tarefa existente |
| `DELETE` | `/api/tasks/:id` | Remove uma tarefa |
| `GET` | `/health` | Verifica o status da API |
| `GET` | `/metrics` | Expõe métricas para o Prometheus |

### Exemplo de body para criação de tarefa

```json
{
  "title": "Minha tarefa",
  "description": "Descrição opcional da tarefa"
}
```

### Status disponíveis para atualização

```json
{
  "status": "pendente" | "em_andamento" | "concluida"
}
```
