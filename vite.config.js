import { defineConfig } from 'vite'
import * as path from 'path'
export default defineConfig({
    cacheDir:path.resolve(__dirname,'./','.cache'),
    publicPath:'public',
    server:{
        host:'0.0.0.0',
        port:'1008'
    }

})