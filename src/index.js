/**
 * 唯一入口：开发、打包、合并配置项
 */
'use strict';
const fs = require('fs');
const util = require('util');
const rm = require('rimraf');
const connect = require('connect');
const serveStatic = require('serve-static');
const rmAsync = util.promisify(rm);
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const addDevServerEntrypoints = require('webpack-dev-server/lib/utils/addEntries');
const createDomain = require('webpack-dev-server/lib/utils/createDomain');
const portfinder = require('portfinder');

// webpack-dev-server --host 0.0.0.0 --inline --progress --config build/webpack.dev.conf.js
/**
 * 开发服务器启动入口
 */
class Serve {
    constructor() {
        const webpackConfig = require('./webpack.dev.config');
        this.webpackConfig = webpackConfig;
        let options = webpackConfig.devServer;
        this.options = options;
        this.suffix = (options.inline !== false || options.lazy === true ? '/' : '/webpack-dev-server/');
        this.startDevServer();
    }

    kill() {
        this.server && this.server.close()
    }

    startDevServer() {
        let webpackConfig = this.webpackConfig;
        let options = this.options;
        addDevServerEntrypoints(webpackConfig, options,null);
        this.createCompiler();
        this.createServer();
        this.process();
        this.createPort();
    }

    createCompiler() {
        try {
            this.compiler = webpack(this.webpackConfig)
        } catch (e) {
            if (e instanceof webpack.WebpackOptionsValidationError) {
                console.error(e.message);
                process.exit(1)
            }
            throw e
        }
    }

    createServer() {
        try {
            this.server = new WebpackDevServer(this.compiler, this.options)
        } catch (e) {
            const OptionsValidationError = require('webpack-dev-server/lib/OptionsValidationError')
            if (e instanceof OptionsValidationError) {
                console.error(e.message);
                process.exit(1)
            }
            throw e
        }
    }

    process() {
        ['SIGINT', 'SIGTERM'].forEach((sig) => {
            process.on(sig, () => {
                this.server.close(() => {
                    process.exit()
                })
            })
        })
    }

    createPort() {
        let server = this.server
        let options = this.options
        // 当前端口被占用检测
        this.checkPort(options.port).then(port=>{

            server.listen(port, options.host, (err) => {
                if (err) throw err;
                if (options.bonjour) this.broadcastZeroconf(options);
                const uri = createDomain(options, server.listeningApp) + this.suffix;
                console.log('create http server:',uri);
                this.reportReadiness(uri, options);
            })

        }).catch(e=>{
            console.warn('checkPort error:',e)
        });
    }

    checkPort(port){
        return new Promise((resolve, reject) => {
            portfinder.basePort = port
            portfinder.getPort((err, port) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(port)
                }
            })
        })
    }

    reportReadiness(uri, options) {
        const useColor = options.color
        const contentBase = Array.isArray(options.contentBase) ? options.contentBase.join(', ') : options.contentBase
        if (!options.quiet) {
            let startSentence = `Project is running at ${uri}`
            if (options.socket) {
                startSentence = `Listening to socket at ${options.socket}`
            }
            console.log((options.progress ? '\n' : '') + startSentence)

            console.log(`webpack output is served from ${options.publicPath}`)

            if (contentBase) { console.log(`Content not from webpack is served from ${contentBase}`) }

            if (options.historyApiFallback) { console.log(`404s will fallback to ${options.historyApiFallback.index || '/index.html'}`) }

            if (options.bonjour) { console.log('Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)') }
        }
    }

    broadcastZeroconf(options) {
        const bonjour = require('bonjour')()
        bonjour.publish({
            name: 'Webpack Dev Server',
            port: options.port,
            type: 'http',
            subtypes: ['webpack']
        })
        process.on('exit', () => {
            bonjour.unpublishAll(() => {
                bonjour.destroy()
            })
        })
    }
}

/**
 * 构建服务
 */
async function WebpackBuild() {
    const buildConfig = require('./config');
    const webpackConfig = require('./webpack.prod.config');
    const _distPath = buildConfig.dist;
    const isDist = fs.existsSync(_distPath);
    if (isDist) {
        await rmAsync(_distPath);
    }
    webpack(webpackConfig, (err, stats) => {
        if (err) throw err
        process.stdout.write(
            stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n\n'
        )

        if (stats.hasErrors()) {
            console.warn(' Build failed with errors.\n')
            process.exit(1)
        }
        console.log(' Build complete.\n')
        console.log(' Tip: built files are meant to be served over an HTTP server.\n'
            + " Opening index.html over file:// won't work.\n")

        if (process.env.npm_config_preview) {
            // 配合 webpack-bundle-analyzer 模块分析
            const port = 9526;
            const host = 'http://localhost:' + port;
            // 优先取build配置中的publicPath，否则取base中的默认配置
            const basePath = buildConfig.build.output && buildConfig.build.output.publicPath? buildConfig.build.output.publicPath : buildConfig.base.output.publicPath;
            const app = connect();

            app.use(
                basePath,
                serveStatic('./dist', {
                    index: ['index.html', '/']
                })
            );

            app.listen(port, function () {
                console.log(`> Listening at  http://localhost:${port}${basePath}`)
            });
        }

    })
}

module.exports = {
  Serve,
  WebpackBuild
};
