const amqp = require('amqplib');
const { rabbitmqMessagesSent } = require('../metrics');

let channel;
const QUEUE = 'task_notifications';

async function connectRabbitMQ() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  return channel;
}

async function publishTaskNotification(event, task) {
  if (!channel) {
    console.warn('RabbitMQ não conectado, pulando notificação');
    return;
  }

  const message = JSON.stringify({
    event,
    task,
    timestamp: new Date().toISOString(),
  });

  channel.sendToQueue(QUEUE, Buffer.from(message), { persistent: true });
  rabbitmqMessagesSent.inc();
  console.log(`Notificação enviada: ${event} - Tarefa #${task.id}`);
}

async function startConsumer() {
  if (!channel) {
    console.warn('RabbitMQ não conectado, pulando consumidor');
    return;
  }

  await channel.consume(QUEUE, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      console.log(`[Consumer] Evento recebido: ${content.event} - Tarefa: ${content.task.title}`);
      channel.ack(msg);
    }
  });

  console.log('Consumidor de notificações iniciado');
}

module.exports = { connectRabbitMQ, publishTaskNotification, startConsumer };
