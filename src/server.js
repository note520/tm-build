#!/usr/bin/env node
/**
 * 开发环境服务快捷入口
 */
'use strict';
const tmBuild = require('./index');
const { Serve } = tmBuild;

process.env.APP_ENV = 'development';
process.env.NODE_ENV = 'development';

new Serve();
// const merge = require('webpack-merge');

// const testA = {
//     module:{
//         rules:[
//             {
//                 test: /\.vue$/,
//                 loader: 'vue-loader'
//             },
//         ]
//     },
// };
//
// const testB = {
//     module:{
//         a:"A",
//         rules:[
//             {
//                 test: /\.tsx?$/,
//                 loader: 'ts-loader',
//                 exclude: /node_modules|\/build|\/mock|\/dist/,
//                 options: {
//                     appendTsSuffixTo: [/\.vue$/],
//                 }
//             }
//         ]
//     },
// };
//
// const last = merge.strategy({
//     // 'module.rules': 'replace'
// })(testA,testB);
// console.log('-----last------',last);
