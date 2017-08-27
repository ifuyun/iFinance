/**
 * 基本配置信息
 * @module cfg_core
 * @author Fuyun
 * @version 1.0.0
 * @since 1.0.0
 */
const pkgCfg = require('../package.json');
const credentials = require('./credentials');
module.exports = {
    name: '爱记账',
    version: pkgCfg.version,
    author: 'Fuyun',
    sessionSecret: credentials.sessionSecret,
    cookieSecret: credentials.cookieSecret,
    cookieExpires: 1000 * 60 * 60 * 24 * 7,
    host: '127.0.0.1',
    port: 2017,
    domain: 'f.ifuyun.com',
    ssoDomain: process.env.ENV && process.env.ENV.trim() === 'production' ? 'www.ifuyun.com' : 'i.ifuyun.com',
    pathViews: process.env.ENV && process.env.ENV.trim() === 'production' ? 'dist' : 'src',
    logLevel: process.env.ENV && process.env.ENV.trim() === 'production' ? 'INFO' : 'TRACE'
};
