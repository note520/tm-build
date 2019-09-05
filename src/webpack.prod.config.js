/**
 * 打包构建配置
 */
'use strict';
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
// 第三方插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');// 到处css 到一个文件
const CopyWebpackPlugin = require('copy-webpack-plugin');// 复制文件插件
const TerserPlugin = require('terser-webpack-plugin');// 混淆压缩js
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');// 压缩提取的CSS。消除来自不同组件的重复CSS。
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 复制html模板注入
// 自定义配置
const { resolveDir, versionForTime, assetsPath, styleLoaders, resolveApp } = require('./common/utils');
const baseWebpackConfig = require('./webpack.base.config');
const config = require('./config');
const BUILD = config.build;
const BASE = config.base;

// 场景切换对应的配置
const AppScene = BUILD.appScene;
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
    },
    // 压缩
    minimizer: [
        new TerserPlugin({
            terserOptions: {
                mangle: true,
                output: { comments: false },
                compress: { warnings: false }
            },
            sourceMap: config.build.sourceMap,
            cache: true,
            parallel: true
        }),
        new OptimizeCSSAssetsPlugin()
    ]
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
if(config.static && fs.existsSync(config.static)){
    _plugins.push(
        // 复制静态资源
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, resolveApp(config.static)),
                to: BUILD.assetsSubDirectory,
                ignore: ['.*']
            }
        ])
    );
}

const webpackConfig = merge.strategy({
    "optimization":"replace",
    "entry":"replace",
})(
    baseWebpackConfig,
    {
        mode: 'production',
        devtool: false,
        entry: BASE.entry,
        output: BASE.output,
        module: {
            rules: styleLoaders({
                sourceMap: config.build.sourceMap,
                extract: true,
                usePostCSS: true,
                px2remConfig: config.extendConfig.px2remConfig,
            })
        },
        // 第三方插件
        plugins: [
            new webpack.DefinePlugin({
                'process.env': Object.assign({},
                    // 应用内部区分联调 测试环境
                    config.ENV,
                    {
                        // 构建时间标记
                        'BUILD_TAG':`"${config.appName}_${config.appVersion}_${versionForTime()}"`,// 构建时间标记
                    }),
            }),
            new MiniCssExtractPlugin({
                filename: assetsPath('[name].css?='+versionForTime()),
            }),
            ..._plugins
        ],
        // 优化
        optimization: _optimization
    },
    BUILD.original
);
module.exports = webpackConfig;
