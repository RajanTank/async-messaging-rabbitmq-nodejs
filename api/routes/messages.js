const router = require("express").Router();
const Message = require("../models/Message");
const amqplib = require('amqplib');
const { getUser } = require('../index')
const eventBus = require('../eventBus');
const stateManager = require('../channelManagement');


//add

const createConnectionAndSend = async (data, receiverId, messageId) => {
  try {
    let channel;
    const connection = await amqplib.connect(process.env.RABBIT_URI);
    channel = await connection.createChannel();
    await channel.assertExchange(`${receiverId}-exchange`, 'direct', { durable: true });
    await channel.assertQueue(receiverId, { durable: true });
    await channel.bindQueue(receiverId, `${receiverId}-exchange`, `${receiverId}-log`);
    channel.publish(`${receiverId}-exchange`, `${receiverId}-log`, Buffer.from(JSON.stringify({ ...data, messageId: messageId })));
  } catch (err) {
    console.error('Could not configure RabbitMQ ');
    throw err;
  }
}

const checkForNewMessageForUser = async (data) => {
  try {
    let channel;
    const connection = await amqplib.connect(process.env.RABBIT_URI);
    channel = await connection.createChannel();
    await channel.assertExchange('my-exchange', 'direct', { durable: true });
    await channel.assertQueue(data.currentUser, { durable: true },);
    await channel.bindQueue(data.currentUser, 'my-exchange', 'log');
    const dataQueue = await channel.checkQueue(data.currentUser);
    return dataQueue
  } catch (err) {
    console.error('Could not configure RabbitMQ ');
    throw err;
  }
}


const consumeMessage = async (req) => {
  const data = req.body;
  try {
    const connection = await amqplib.connect(process.env.RABBIT_URI);
    const channel = await connection.createChannel();
    stateManager.addClient(req.io.customerSocketId, channel);
    await channel.assertExchange(`${data.currentUser}-exchange`, 'direct', { durable: true });
    await channel.assertQueue(data.currentUser, { durable: true },);
    await channel.bindQueue(data.currentUser, `${data.currentUser}-exchange`, `${data.currentUser}-log`);
    channel.consume(data.currentUser, async (msg) => {
      const messageContent = JSON.parse(msg.content.toString()); // Assuming msg.content is a JSON string
      const messageId = messageContent.messageId; // Assuming you get the messageId from msg
      const messageData = await Message.findById(messageId);
      if (messageData) {
        let UpdatedMessageFor = messageData.messageFor
        UpdatedMessageFor.push(data.currentUser)
        await Message.updateOne({ _id: messageId }, { $set: { messageFor: UpdatedMessageFor } });
        const updateMsgFromDB = await Message.findById(messageId);
        broadcastMessage(updateMsgFromDB, data.currentUser, req)
      } else {
        console.log('Message not found for id:', messageId);
      }
    }, { noAck: true });
  } catch (err) {
    console.error('Could not configure RabbitMQ ');
    throw err;
  }
}

function closeChannel(clientId) {
  const channel = stateManager.getChannel(clientId);
  if (channel) {
    channel.close();
    console.log('RabbitMQ channel closed');
    stateManager.removeClient(clientId);
  }
}

eventBus.on('socketClosed', (id) => closeChannel(id));


const broadcastMessage = (data, current, req) => {
  const user = getUser(current);
  if (user) {
    req.io.to(user.socketId).emit("getMessage", data);
  }
}

router.post("/", async (req, res) => {
  let receiverId = req.body.receiverId
  delete req.body.receiverId
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();
    await createConnectionAndSend(req.body, receiverId, savedMessage._id)
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/new-message', async (req, res) => {
  const data = await checkForNewMessageForUser(req.body)
  try {
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/check-for-new-message', async (req, res) => {
  await consumeMessage(req)
  try {
    res.status(200).json({ message: 'success' });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:userId/:conversionId", async (req, res) => {
  try {
    const messages = await Message.find({
      messageFor: { $in: req.params.userId },
      conversationId: req.params.conversionId,
    })
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
