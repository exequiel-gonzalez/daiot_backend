import mqtt from 'mqtt';

const options = {
  retain: true,
  qos: 0,
};

const mqttUrl = 'mqtt://' + process.env.MQTT_URL + ':' + process.env.MQTT_PORT || 'mqtt://localhost:1883';

const topics = [`${process.env.TOPIC_DATA}/#`, `${process.env.TOPIC_HELLO}/#`, `${process.env.TOPIC_ALARM}/#`];


class MqttClient {
  #clientId;
  #connectionConfig;
  handleMessages = null
  constructor() {
    this.#clientId = 'mqtt_microservice' + Math.random().toString(16).substring(2, 8);
    this.#connectionConfig = {
      clientId: this.#clientId,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    };

    this.tryConnect();
    //!handle errors
    this.client.on('error', (error) => {
      this.handleError(error)
    });
    //!handle connection
    this.client.on('connect', () => {
      this.handleConnection();
    });

    //!handle incoming messages
    this.client.on('message', async (incomingTopic, message, packet) => {
      if(this.handleMessages)
        await this.handleMessages(incomingTopic, message);
    });
  }

  tryConnect() {
    console.log('trying to reconnect to: ', mqttUrl, ' with clientId: ', this.#clientId, );
    this.client = mqtt.connect(mqttUrl, this.#connectionConfig);
  }

  handleConnection(){
    console.log('mqtt connected');
    this.client.subscribe(topics, { qos: 1 }, (error) => {
      if (!error) {
        console.log('subscribed to topics: ', topics.toString());
      }
    });
  }

  handleError(error){
    console.log("Can't connect" + error);
    setTimeout(() => {
      this.tryConnect();
    }, 1000);
  }

  sendMqttMessage(topic, id, message) {
    this.publish(topic, id, message, options);
  }

  publish(topic, id, msg, options) {
    topic = topic + '/' + id;
    console.log('publishing ', msg, 'on ', topic);
    if (this.client.connected === true) {
      this.client.publish(topic, msg, options);
    }
  }
}

export default new MqttClient;