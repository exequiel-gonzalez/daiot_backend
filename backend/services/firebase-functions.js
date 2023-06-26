import firebase from 'firebase';
class FirebaseFunctions {
  #firebaseConfig = {};
  #database = null;
  constructor() {
    this.#firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID  
    }
    
    firebase.initializeApp(this.#firebaseConfig);
    this.#database = firebase.database();  
  }



  async createDeviceDatabase(id, device) {
    try {
      await this.#database.ref('devices/' + id).set(device);
      await this.#database.ref('devicesList/' + id).set(true);     
    } catch (error) {
      console.log(error);
    }
  }

  saveMessageDatabase(id, data) {
    try {      
      data['serverTimestamp'] = Date.now();      
      this.#database.ref('/data/' + id).push(data, function (error) {
        if (error) console.log('Failed with error: ' + error);
      });      
	    this.#database.ref('/devices/' + id + '/data').update(data);
    } catch (error) {
	  	console.log(error);
	}
  }

  saveStateDatabase(id, data) {
    this.#database.ref(`/devices/${id}/data/outputs`).set(data, function (error) {
      if (error) console.log('Failed with error: ' + error);
    });
  }

  saveAlarmDatabase(id, data) {
    data['serverTimestamp'] = Date.now();    
    this.#database.ref(`/alarm/${id}`).push(data, function (error) {
        if (error) console.log('Failed with error: ' + error);    
    });
  }

  setListenerDeviceDatabase(id, callback) {
    this.#database.ref(`/devices/${id}`).on('value', function (snapshot) {
      callback(snapshot.val());
    });
  }

  async updateStateDatabase(id, device) {
    await this.#database.ref(`/devices/${id}/state`).set(device.state);
    await this.#database.ref(`/devices/${id}/lastSeen`).set(device.lastSeen);
  }

  async getDevicesList() {
    const response = await this.#database.ref('/devices').once('value');
    if (response.exists()) {
      return response.val();
    }
    return {};
  }
  async deleteDeviceDatabase(id) {
    try {
      await this.#database.ref('devices/' + id).remove();
      await this.#database.ref('devicesList/' + id).remove();
      await this.#database.ref('data/' + id).remove();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getParameters() {
    const response = await this.#database.ref(`/parameters`).once('value');
    if (response.exists()) {
      return response.val();
    }
    return {};
  }

  async getDeviceData(id) {
    const response = await this.#database.ref(`/devices/${id}/data`).once('value');
    if (response.exists()) {
      return response.val();
    }
    return {};
  }

  async deleteDeviceData(id) {
    try {
      await this.#database.ref('data/' + id).remove();
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default new FirebaseFunctions();