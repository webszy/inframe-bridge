const Inframe = class {
    constructor({target, whiteList, libName,debug} = {}) {
        this.setTargetIframe(target)
        this.setLibName(libName)
        if (typeof whiteList !== 'undefined' && !Array.isArray(whiteList)) {
            console.warn('whiteList must be a Array')
            return false
        }
        this.whiteList = whiteList || []
        this.debug = !!debug
        this.handlersMap = new Map()
        if (!window) {
            console.warn(`inframe bridge must init on the browser`)
            return false
        }
        window.getInframeInstace = () => this
        window.addEventListener('message', this.handleEvent.bind(this))
        if (this.targetIframe) {
            this.on('connected', (e) => console.log(e))
        } else {
            console.log('sub instance',this)
            this.emit('connected','sub Page connected')
        }
        return this
    }

    setTargetIframe(target) {
        if (typeof target === 'string') {
            this.targetIframe = document.querySelector(target);
            this.pageName='main'
        } else if (typeof target !== 'undefined') {
            this.targetIframe = target
            this.pageName='main'
        } else {
            this.targetIframe = null
            this.pageName='sub'
        }
    }

    setLibName(name) {
        this.libName = name || 'inframe'
    }

    on(eventName, handler) {
        this.logger(`${eventName} has been watched`)
        if (this.handlersMap.has(eventName)) {
            const handlers = this.handlersMap.get(eventName)
            handlers.push(handler)
            this.handlersMap.set(eventName, handlers)
        } else {
            this.handlersMap.set(eventName, [handler])
        }
    }

    off(eventName) {
        if (this.handlersMap.has(eventName)) {
            this.handlersMap.delete(eventName)
        }
    }

    emit(eventName, data) {
        const msg = {
            event: eventName,
            params: data,
            lib: this.libName
        }
        this.logger(`${eventName} has been emitted::${JSON.stringify(msg)}`)
        if (this.targetIframe) {
            this.targetIframe.contentWindow.postMessage(msg, '*')
        } else {
            window.parent.postMessage(msg, '*')
        }
    }

    handleEvent(e) {
        // 验证data是由inframe发出的
        if (!e || typeof e.data !== 'object' || !(e.data.lib && e.data.lib === this.libName)) {
            return
        }
        // 验证域名
        if (this.whiteList.length) {
            const checked = this.whiteList.some(domain => ~domain.indexOf(e.origin))
            if (!checked) {
                console.warn('you are not access to inframe')
                return
            }
        }
        const {data} = e
        this.logger(`received data: ${JSON.stringify(data)}`)
        if (this.handlersMap.has(data.event)) {
            const handlers = this.handlersMap.get(data.event)
            handlers.forEach(handler => handler(data))
        } else{
            this.logger(`handlers not find: ${JSON.stringify(data)}`)
        }

    }

    destroy() {
        this.handlersMap.clear()
        window.getInframeInstace = null
        window.removeEventListener('message', this.handleEvent)
    }
    logger(message){
        if(!this.debug){
            return
        }
        const d = new Date()
        const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
        console.log(`${time}-${this.pageName}::${message}`)
    }
}
export default Inframe
