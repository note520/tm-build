/**
 * webpack 基础配置"基类"（默认以base字段配置为主）
 */
'use strict';
const path = require('path');
const merge = require('webpack-merge');
const { VueLoaderPlugin } = require('vue-loader');
const { resolveApp,ownDir,versionForTime,assetsPath } = require('./common/utils');
const config = require('./config');
const BASE = config.base;

const baseWebpackConfig = {
    mode: 'production',
    devtool: 'inline-source-map',
    devServer: {
        clientLogLevel: 'warning',
        historyApiFallback: true,
        compress: true,
        host: 'localhost',
        port: 9090,
        contentBase: path.join(__dirname, config.static), // 为开发本地静态资源提供服务目录
    },
    // 入口文件
    entry: {
        app: './src/main.js',
    },
    // 输出文件
    output: {
        path: resolveApp(config.dist),// 文件输出目录相对于build目录
        filename: '[name].js?=' + versionForTime(),
        publicPath: '/', // CDN 静态公共路径
        chunkFilename: "[id].bundle.js",
    },
    // loader 加载器 使用 tm-build 本身的loader 和 应用程序的
    resolveLoader:{
        modules: [
            resolveApp('node_modules'),
            ownDir('node_modules')
        ]
    },
    // 模块加载器和规则
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            // 图片加载
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 15000,
                    name: assetsPath('[name].[hash:7].[ext]')
                }
            },
            // 字体加载
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                loader: 'url-loader',
                options: {
                    limit: 15000,
                    name: assetsPath('[name].[hash:7].[ext]')
                }
            },
            // 多媒体
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac|avi)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 15000,
                    name: assetsPath('[name].[hash:7].[ext]')
                }
            },
            // ts
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules|\/build|\/mock|\/dist/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                }
            }
        ],
    },
    // 第三方插件
    plugins:[
         new VueLoaderPlugin(),// 请确保引入这个插件！
    ],
    // 自定义解析
    resolve: {
        extensions: ['.js','.ts', '.vue', '.json'],
        alias:{
            '@':resolveApp('src'),
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    // 外部扩展
    externals:{
        'QMap': 'window.qq.maps',
        'BMap': 'window.BMap',
        'wx':'window.wx'
    },
    node: {
        setImmediate: false, // 阻止Webpack注入无用的 setImmediate polyfill
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    },
    // 优化
    optimization: {}
};

module.exports = merge(baseWebpackConfig,BASE);
