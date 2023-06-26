class Devices{
    #devices
    constructor() {
        this.#devices = {};
    }
    addDevice(device){
        this.#devices[device.id] = device;
    }
    getDevice(id){
        return this.#devices[id];
    }
    getDevices(){
        return this.#devices;
    }
    deleteDevice(id){
        if(this.#devices[id]){
            delete this.#devices[id];
            return true;
        }
        return false;
    
    }
    getDevicesList(){
        let list = {};
        for (const key in this.#devices) {
            list[key] = this.#devices[key]
        }
        return list;
    }
    setDevicesList(list){
        this.#devices = list;
    }    
}

export default new Devices();