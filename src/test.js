import Inframe from "./index";
const bridge = new Inframe({
    target:'#__iframe',
    debug:true
})
bridge.on('test',e=>console.log(e))
console.log('mainPage bridge',bridge)