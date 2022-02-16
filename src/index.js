import {version} from '../package.json'
/*
* @params
* target:any window对象，或iframe,或class名，id名
* whiteList:array 域名白名单
* libName:string 通信时校验名
* debug:boolean 是否打印日志
* isSubPage:boolean 是否子页面
* isNewWindow:boolean 是否是新窗口打开
* */
/*
* 缓冲池
* 子页面报告connected之后再发送事件，之前将所有发送的缓存
* */
const Inframe = class {
    constructor({target, whiteList, libName,debug,isSubPage,isNewWindow} = {}) {
        this.setTarget(target)
        this.setLibName(libName)
        if (typeof whiteList !== 'undefined' && !Array.isArray(whiteList)) {
            console.warn('whiteList must be a domain Array')
            return false
        }

        this.isNewWindow = isNewWindow
        this.whiteList = (whiteList || []).filter(e=>typeof e === 'string').map(e=>e.toLowerCase())
        this.debug = !!debug
        this.isSubPage = typeof isSubPage === 'undefined'? true : isSubPage
        this.isConneted = this.isSubPage
        this.version = version
        this.handlersMap = new Map()
        this.emitCache = []
        if (!window) {
            console.warn(`inframe bridge must init on the browser`)
            return false
        }
        window.getInframeInstace = () => this
        window.addEventListener('message', this.handleEvent.bind(this))
        if (this.isSubPage) {
            this.emit('connected','sub Page connected')
            console.log('sub instance',this)
        } else {
            this.on('connected',()=>{
                this.isConneted = true
                this.emitCache.forEach(({eventName,data})=>this.emit(eventName,data))
                this.emitCache = []
            })
        }
        return this
    }

    setTarget(target) {
        if (typeof target === 'string') {
            this.target = document.querySelector(target);
        } else if (typeof target !== 'undefined') {
            this.target = target
        } else {
            this.target = null
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
            lib: this.libName,
            isSubPage:this.isSubPage
        }
        this.logger(`${eventName} has been emit::${JSON.stringify(msg)}`)
        if(this.isConneted){
            if(this.isSubPage){
                // 子页面
                if(this.isNewWindow){
                    window.opener.postMessage(msg,'*')
                } else {
                    window.parent.postMessage(msg,'*')
                }
            } else {
                // 主页面通过window.open打开了
                if(this.isNewWindow){
                    this.target.postMessage(msg,'*')
                } else {
                    this.target.contentWindow.postMessage(msg,'*')
                }
            }
        } else {
            this.emitCache.push({eventName, data})
        }
    }

    handleEvent(e) {
        // 验证data是由inframe发出的
        if (!e ||
            typeof e.data !== 'object' ||
            !(e.data.lib && e.data.lib === this.libName) ||
            this.isSubPage === e.data.isSubPage
        ) {
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
        if (this.handlersMap.has(data.event)) {
            this.logger(`received data: ${JSON.stringify(data)}`)
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
        const pageName = this.isSubPage ? '子页面' : '主页面'
        console.log(`${time}-${pageName}::${message}`)
    }
}
export default Inframe
