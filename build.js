import * as path from 'path'
import { defineConfig } from 'vite'
import Banner from 'vite-plugin-banner'
import {version,name} from './package.json'
const getBannerContent = () => `
   name: iframeBridge
   version: ${version}
   file: ${name}.min.js
   author: web.szy
   buildTime: ${new Date().toLocaleString()}
`
export default defineConfig({
    cacheDir:path.resolve(__dirname,'./','.cache'),
    plugins:[
        Banner(getBannerContent())
    ],
    build: {
        target:"es2016",
        sourcemap:false,
        minify:true,
        cssCodeSplit:true,
        assetsInlineLimit:0,
        manifest:false,
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            formats:["es","umd"],
            name: name,
            fileName: (format) => `${name}.${format}.min.js`
        }
    }
})