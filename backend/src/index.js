const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database');
const tasksRouter = require('./routes/tasks');
const { metricsMiddleware, metricsEndpoint } = require('./metrics');
const { connectRabbitMQ, startConsumer } = require('./services/notificationService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.use('/api/tasks', tasksRouter);
app.get('/metrics', metricsEndpoint);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await initDatabase();
    console.log('MySQL conectado e tabelas sincronizadas');

    await connectRabbitMQ();
    console.log('RabbitMQ conectado');

    await startConsumer();
    console.log('Consumidor RabbitMQ iniciado');

    app.listen(PORT, () => {
      console.log(`Backend rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar:', err);
    process.exit(1);
  }
}

start();
