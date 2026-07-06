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
  - Total de erros HTTP (4xx/5xx) por rota
  - Duração das requisições HTTP (P50, P95, P99)
  - Duração das queries ao banco de dados por operação
  - Total de tarefas criadas, concluídas, atualizadas e deletadas
  - Número atual de tarefas ativas (não concluídas)
  - Número de tarefas por status em tempo real
  - Total de mensagens enviadas ao RabbitMQ e erros de envio
  - Métricas de processo Node.js: CPU, memória RAM/heap, event loop lag, GC, file descriptors
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

---

## 📊 Monitoramento — Prometheus

O Prometheus coleta métricas do backend a cada 15 segundos automaticamente.

**Acesso:**

```
http://localhost:9091
```

**Verificar se o backend está sendo monitorado:**

```promql
up
```

Resultado esperado:

```
up{job="backend"} = 1
up{job="prometheus"} = 1
```

Valor `1` = online. Valor `0` = offline ou inacessível.

**Principais consultas (PromQL):**

| Query | O que mostra |
|---|---|
| `up` | Status de todos os serviços monitorados |
| `up{job="backend"}` | Status específico do backend |
| `http_requests_total` | Total acumulado de requisições HTTP por rota/método/status |
| `rate(http_requests_total[1m])` | Requisições por segundo (último 1 minuto) |
| `rate(http_errors_total[1m])` | Erros HTTP 4xx/5xx por segundo |
| `tasks_created_total` | Total de tarefas criadas |
| `tasks_completed_total` | Total de tarefas concluídas |
| `tasks_updated_total` | Total de tarefas atualizadas |
| `tasks_deleted_total` | Total de tarefas deletadas |
| `tasks_active_total` | Número atual de tarefas não concluídas |
| `tasks_by_status{status="pendente"}` | Tarefas pendentes no momento |
| `rabbitmq_messages_sent_total` | Total de mensagens enviadas ao RabbitMQ |
| `rabbitmq_errors_total` | Total de erros ao publicar no RabbitMQ |
| `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[1m]))` | Latência no percentil 99 |
| `histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[1m]))` | Duração das queries ao banco (P95) |
| `process_resident_memory_bytes` | Memória RAM usada pelo backend |
| `nodejs_heap_size_used_bytes` | Heap JavaScript utilizado |
| `rate(process_cpu_seconds_total[1m])` | Uso de CPU do processo |
| `nodejs_eventloop_lag_seconds` | Lag do event loop Node.js |

**Como testar:**

1. Acesse `http://localhost:8081` e crie ou atualize tarefas
2. Abra `http://localhost:9091`
3. Digite uma query no campo de expressão e clique em **Execute**
4. Alterne entre as abas **Table** (valores instantâneos) e **Graph** (evolução no tempo)

---

## 📈 Dashboard — Grafana

O Grafana já sobe pré-configurado com o Prometheus como fonte de dados e com o dashboard **Task Manager - Monitoramento** provisionado automaticamente.

**Acesso:**

```
http://localhost:3001
```

**Credenciais:** `admin` / `admin`

**Como acessar o dashboard:**

1. Faça login com `admin` / `admin`
2. No menu lateral, clique em **Dashboards**
3. Abra **Task Manager - Monitoramento**

**O que o dashboard exibe (22 painéis):**

| Painel | Tipo | Métrica |
|---|---|---|
| Status do Backend | stat | `up{job="backend"}` → Online / Offline |
| Tarefas Criadas (total) | stat | `tasks_created_total` |
| Tarefas Concluídas (total) | stat | `tasks_completed_total` |
| Tarefas Deletadas (total) | stat | `tasks_deleted_total` |
| Tarefas Atualizadas (total) | stat | `tasks_updated_total` |
| Tarefas Ativas (não concluídas) | stat | `tasks_active_total` |
| Tarefas por Status atual | bargauge | `tasks_by_status{status=...}` |
| Taxa de criação/conclusão/deleção/atualização | graph | `rate(tasks_*_total[1m])` |
| Requisições HTTP por segundo | graph | `rate(http_requests_total[1m])` |
| Erros HTTP 4xx/5xx por segundo | graph | `rate(http_errors_total[1m])` |
| Latência P50 / P95 / P99 | graph | `histogram_quantile(0.50/0.95/0.99, ...)` |
| Duração das queries ao banco (P95) | graph | `histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[1m]))` |
| Mensagens RabbitMQ + erros por segundo | graph | `rate(rabbitmq_messages_sent_total[1m])` |
| Memória RAM do processo (RSS + heap) | graph | `process_resident_memory_bytes` |
| CPU do processo | graph | `rate(process_cpu_seconds_total[1m])` |
| Event Loop Lag | graph | `nodejs_eventloop_lag_seconds` |
| Handles e Requests ativos | graph | `nodejs_active_handles_total` |
| Garbage Collector — duração | graph | `rate(nodejs_gc_duration_seconds_sum[1m])` |
| File Descriptors abertos | stat | `process_open_fds` |
| Uptime do processo | stat | `process_start_time_seconds` |
| Total mensagens RabbitMQ | stat | `rabbitmq_messages_sent_total` |
| Total erros RabbitMQ | stat | `rabbitmq_errors_total` |

O dashboard atualiza automaticamente a cada **5 segundos**.

**Como testar:**

1. Deixe o dashboard aberto
2. Acesse `http://localhost:8081` e crie, atualize e conclua tarefas
3. Observe os gráficos sendo atualizados em tempo real

---

## 🐰 Mensageria — RabbitMQ

A cada criação ou atualização de tarefa, o backend publica uma mensagem na fila `task_notifications`. O próprio backend também consome essa fila como assinante.

**Acesso ao painel de gerenciamento:**

```
http://localhost:15672
```

**Credenciais:** `guest` / `guest`

**Como verificar o fluxo de mensagens:**

1. Faça login no painel com `guest` / `guest`
2. Clique na aba **Queues and Streams**
3. Clique na fila **task_notifications**
4. Observe as colunas:
   - **Ready** — mensagens aguardando consumo
   - **Unacked** — mensagens em processamento
   - **Message rates** — fluxo em tempo real

**Como testar:**

1. Acesse `http://localhost:8081` e crie uma tarefa
2. Volte ao painel do RabbitMQ
3. Na seção **Message rates** da fila `task_notifications`, será exibido um pico momentâneo indicando a mensagem publicada e consumida
4. No terminal onde o `docker compose` está rodando, você também verá os logs do consumidor:

```
task-manager-backend | Notificação enviada: task_created - Tarefa #1
task-manager-backend | [Consumer] Evento recebido: task_created - Tarefa: Minha tarefa
```

A aba **Connections** mostra a conexão ativa do backend com o RabbitMQ, e a aba **Overview** exibe o estado geral do broker.
