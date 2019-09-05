#!/usr/bin/env node
/**
 * 构建快捷入口
 */
'use strict';
const tmBuild = require('./index');
const { WebpackBuild } = tmBuild;

process.env.APP_ENV =  'production';
process.env.NODE_ENV = 'production';

WebpackBuild();
