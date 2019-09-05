/**
 * 默认配置项
 */
'use strict';
const fs = require('fs');
const merge = require('webpack-merge');
// 第三方插件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 复制html模板注入
const { versionForTime, assetsPath, resolveApp,styleLoaders} = require('./common/utils');
const {TM_CONFIG} = require('./common/constant');
// 应用pkg
const pkgPath = resolveApp('./package.json');
const isPkg = fs.existsSync(resolveApp(pkgPath));
const pkg = isPkg ? require(pkgPath) : '../package.json';
// 当前应用是否含有配置文件
const userConfigPath = resolveApp(TM_CONFIG);
const isUserConfig = fs.existsSync(userConfigPath);
/**
 * 读取用户自定义配置
 */
let userConfig = {};
function readUserConfig(configPath) {
    try {
        const fileData = require(configPath);
        return fileData['tmBuildConfig']
    } catch (e) {
        console.warn('readUserConfig error:', e)
    }
}
isUserConfig ? userConfig = readUserConfig(userConfigPath) : "";
const HOST = process.env.HOST;
const PORT = process.env.PORT && Number(process.env.PORT);
/**
 *  默认应用环境标识
 */
function checkSetEnv() {
    // 应用环境判断
    let defaultENV;
    switch (process.env.APP_ENV) {
        // 正式部署
        case 'production':
            defaultENV = {
                NODE_ENV: '"production"',
                APP_ENV: '"production"'
            };
            break;
        // 联调开发
        case 'union':
            defaultENV = {
                NODE_ENV: '"production"',
                APP_ENV: '"union"'
            };
            break;
        case 'test':
            // 测试uat环境
            defaultENV = {
                NODE_ENV: '"production"',
                APP_ENV: '"test"'
            };
            break;
        // 开发环境
        case 'development':
            defaultENV = {
                NODE_ENV: '"development"',
                APP_ENV: '"development"'
            };
            break;
        default:
            // 自定义APP_ENV
            defaultENV = {
                NODE_ENV: '"production"',
                APP_ENV: `'"${process.env.APP_ENV}"'`
            }
    }
    return defaultENV;
}
let envTag = checkSetEnv();
/**
 * 默认内置配置。dev build (基本以webpack配置api定义)
 */
const build_dist ='./dist';
let defaultConfig = {
    appName: pkg.name,
    appVersion: pkg.version,
    static: './static', // 本地静态资源目录
    dist: build_dist,
    ENV: envTag,
    favicon:'',
    // 扩展配置
    extendConfig: {
        htmlWebpackPluginConfig:{}
        // px2remConfig: null,// 是否开启px转换rem
    },
    // webpack api 基础配置（不能包含）
    base: {
        // 模块加载器和规则
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules|\/build|\/mock|\/dist/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            presets: [
                                [
                                    require('babel-preset-env'),
                                    {
                                        'modules': false,
                                        'targets': {
                                            'browsers': [
                                                'last 2 versions',
                                                'Android >=4',
                                                'Chrome >=35',
                                                'iOS>=8',
                                                'not ie <= 8'
                                            ]
                                        }
                                    }
                                ],
                                require('babel-preset-stage-0'),
                            ],
                            plugins: [
                                require('babel-plugin-transform-vue-jsx'),
                                require('babel-plugin-transform-runtime')
                            ],
                            env: {
                                'development': {
                                    'plugins': [
                                        require('babel-plugin-dynamic-import-node')
                                    ]
                                }
                            }
                        }
                    }
                },
            ]
        },
        // 自定义解析
        resolve: {},
        // 外部扩展
        externals: {},
    },
    // 开发环境
    dev: {
        appScene: "WMS", // 适用场景: WMS（中后台项目）、H5、""(空则为普通开发插件打包)
        assetsSubDirectory: '',// 最终dist中的静态资源子目录 static
        sourceMap: true,
        // 必须 和webpack 原始 api 配置参数要求一致否则会报错
        original:{
            devServer: {
                publicPath: '/',
                host: HOST || '127.0.0.1',// ip 访问 0.0.0.0
                port: PORT || 9090,
                // 代理配置
                proxy: {
                    // '/api': {
                    //     target: 'http://xxx.xxx.cn',
                    //     pathRewrite: {
                    //         '^/api': ''
                    //     },
                    //     changeOrigin: true // target是域名的话，需要这个参数，
                    //     // secure: false,          // 使用的是https，会有安全校验，所以设置secure为false
                    // }
                },
                // 自定义process.env全局变量
            },
            plugins:[]
        },
    },
    // 打包构建部署
    build: {
        appScene: "WMS", // 适用场景: WMS（中后台项目）、H5、""(空则为普通开发插件打包)
        // 联调 测试 process.env全局变量
        assetsSubDirectory: '',// 最终dist中的静态资源子目录 static
        sourceMap: false,
        // gzip
        productionGzip: false,
        productionGzipExtensions: ['js', 'css'],
        // 构建优化分析
        bundleAnalyzerReport: process['env']['npm_config_report'] || false,
        generateAnalyzerReport: process['env']['npm_config_generate_report'] || false,// `npm run build:prod --generate_report`
        // 必须 和webpack 原始 api 配置参数要求一致否则会报错
        original:{
            devtool: false,
        },
    }
};
// 最终合并配置
let config = merge.strategy({
    'base.module.rules': 'replace',
    'dev.original.module.rules': 'replace',
    'dev.original.plugins': 'replace'
})(defaultConfig, userConfig);
module.exports = config;
