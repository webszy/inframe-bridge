const Inframe = class  {
    constructor({target,whiteList,libName}){
        this.setTargetIframe(target)
        this.setLibName(libName)
        if(typeof whiteList !== 'undefined' && !Array.isArray(whiteList)){
            console.warn('whiteList must be a Array')
            return false
        }
        this.whiteList = whiteList
        this.handlersMap = new Map()
        window.getInframeInstace = ()=>this
        window.addEventListener('message',this.handleEvent)
        return this
    }
    setTargetIframe(target){
        if(typeof target === 'string'){
            this.targetIframe = document.querySelector(target);
        } else if(typeof target!=='undefined'){
            this.targetIframe = target
        } else {
            this.targetIframe = null
        }
    }
    setLibName(name){
        this.libName=name || 'inframe'
    }
    on(eventName,handler){
        if(this.handlersMap.has(eventName)){
            const handlers = this.handlersMap.get(eventName)
            handlers.push(handler)
            this.handlersMap.set(eventName,handlers)
        } else {
            this.handlersMap.set(eventName,[handler])
        }
    }
    off(eventName){
        if(this.handlersMap.has(eventName)){
            this.handlersMap.delete(eventName)
        }
    }
    emit(eventName,data){
        if(this.targetIframe){
            this.targetIframe.postMessage({
                event:eventName,
                params:data,
                lib:'inframe'
            })
        }
    }
    handleEvent(e){
        // 验证data是由inframe发出的
        if(!e || typeof e.data!=='object' || !(e.data.lib&&e.data.lib === 'inframe')){
            return
        }
        // 验证域名
        if(this.whiteList.length){
            const checked = this.whiteList.some(domain=>~domain.indexOf(e.origin))
            if(!checked){
                console.warn('you are not access to inframe')
                return
            }
        }
        const {data} = e
        console.log('handleEvent',e)
        if(this.handlersMap.has(data.event)){
            const handlers = this.handlersMap.get(data.event)
            handlers.forEach(handler=>handler(data))
        }

    }
    destroy(){
        this.handlersMap.clear()
        window.getInframeInstace = null
        window.removeEventListener('message',this.handleEvent)
    }
}
const bridge = new Inframe({
    target:'#iframe'
})
bridge.on('msg',e=>console.log(e))
export default Inframe
