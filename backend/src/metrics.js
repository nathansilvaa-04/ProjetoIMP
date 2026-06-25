const prometheus = require('prom-client');

const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const tasksCreatedTotal = new prometheus.Counter({
  name: 'tasks_created_total',
  help: 'Total de tarefas criadas',
});

const tasksCompletedTotal = new prometheus.Counter({
  name: 'tasks_completed_total',
  help: 'Total de tarefas concluídas',
});

const rabbitmqMessagesSent = new prometheus.Counter({
  name: 'rabbitmq_messages_sent_total',
  help: 'Total de mensagens enviadas ao RabbitMQ',
});

function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode });
    end({ method: req.method, route, status: res.statusCode });
  });
  next();
}

async function metricsEndpoint(req, res) {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
}

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  tasksCreatedTotal,
  tasksCompletedTotal,
  rabbitmqMessagesSent,
};
