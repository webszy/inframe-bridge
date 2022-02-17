# inframeJS
使用纯JS链接iframe或其他页面  
use pure Javascript to connect the iframe pages
## 特点
* 原生js,无依赖 es6
* 一个事件可以有多个监听
* 由子页面触发connected事件，所有事件会从该事件之后开始触发，保证完整性
* 可适用于简单微前端中使用
* 已上线
## 参数 parameters
* target:any  必需 required
 window对象，或iframe,或class名，id名  
 your target,not only window Object, or iframe element,iframe className, iframe id
* whiteList:array 非必需 whatever
 域名白名单
 domain white list,allow this domain to access data
* libName:string 非必需 whatever
  通信时校验名,通信双方需要统一
  this string used to verify the connection by this lib
* debug:boolean 非必需 whatever
 是否打印日志
 will print some log
* isSubPage:boolean 
 是否子页面  
 is sub page or be opened page
* isNewWindow:boolean 
是否是新窗口打开  
does it opened by window.open()
## 方法 methods
* on(eventName:string,handler:function)    
新增事件监听  
watch some event
* off(eventName:string)
解除事件监听  
remove some event watcher
* destroy()  
销毁全部事件  
  destroy all event watchers
* window.getInframeInstace  
  获取实列
  get Instace
## 注意事项 notice
+ All cross-domain storage access is disabled by default with Safari 7+，except you open it by yourself.
所有跨站存储在iOS 7+,Safari 7+都是被默认禁止的，除非你手动打开他。
+ recommend https on production
为了保证正常使用，线上环境请使用https
