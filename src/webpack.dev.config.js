'use strict';
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
// 第三方插件
const CopyWebpackPlugin = require('copy-webpack-plugin');// 复制文件插件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 复制html模板注入
// 自定义配置
const {resolveDir, versionForTime, assetsPath, styleLoaders, resolveApp} = require('./common/utils');
const baseWebpackConfig = require('./webpack.base.config');
const config = require('./config');
const DEV = config.dev;

// 场景切换对应的配置
const AppScene = DEV.appScene;
let _optimization = !AppScene? {}:{
    // 提取公共代码
    splitChunks: {
        chunks: 'all',
        cacheGroups: {
            libs: {
                name: 'common',
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
                chunks: 'initial' // 只打包初始时依赖的第三方
            },
        }
    }
};
let _plugins = !AppScene? []:[
    // 配置化模板注入替换
    new HtmlWebpackPlugin(Object.assign({
        filename: 'index.html',
        template: 'index.html',
        inject: true,
        favicon: fs.existsSync(config.favicon)?resolveApp(config.favicon):"",
        title: config.appName
    },config.extendConfig.htmlWebpackPluginConfig)),
];

const devWebpackConfig = merge.strategy({
    "optimization":"replace",
    "entry":"replace",
})(
    baseWebpackConfig,
    {
        mode: 'development',
        output: {
            path: resolveApp(config.dist),// 文件输出目录相对于build目录
            filename: '[name].bundle.js?='+versionForTime(),
            publicPath: '/', // CDN 静态公共路径
        },
        devServer: {
            proxy: {},
            clientLogLevel: 'warning',
            historyApiFallback: true,
            hot: true,
            compress: true,
            host: '127.0.0.1',// ip 访问 0.0.0.0
            port: 9090,
            open: true,
            overlay: {warnings: false, errors: true},
            quiet: true, // necessary for FriendlyErrorsPlugin
            watchOptions: {
                poll: false
            }
        },
        devtool: 'cheap-source-map',
        module: {
            rules: styleLoaders({
                sourceMap: false,
                usePostCSS: true,
                px2remConfig: null,
            })
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': Object.assign({},
                    config.ENV,
                    {
                        'BUILD_TAG': `"${config.appName}_${config.appVersion}_${versionForTime()}"`,// 构建时间标记
                        'MOCK_ENV': `"${process.env.MOCK_ENV}"`
                    }),
            }),
            new webpack.HotModuleReplacementPlugin(),
            // 复制静态资源
            new CopyWebpackPlugin([
                {
                    from: path.resolve(__dirname, resolveApp(config.static)),
                    to: DEV.assetsSubDirectory,
                    ignore: ['.*']
                }
            ]),
            ..._plugins
        ],
        // 自定义此参数会重置内容
        optimization: _optimization,
    },
    DEV.original
);
module.exports = devWebpackConfig;
