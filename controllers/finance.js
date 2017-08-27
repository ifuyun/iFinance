/**
 *
 * @author fuyun
 * @since 2017/08/14
 */
const fs = require('fs');
const path = require('path');
const async = require('async');
const moment = require('moment');
const url = require('url');
const xss = require('sanitizer');
const models = require('../models/index');
const common = require('./common');
const appConfig = require('../config/core');
const util = require('../helper/util');
const credentials = require('../config/credentials');
const {sysLog: logger, formatOpLog} = require('../helper/logger');
const idReg = /^[0-9a-fA-F]{16}$/i;
const pagesOut = 9;
const {Finance} = models;

module.exports = {
    list: function (req, res, next) {
        res.send();
    },
    edit: function (req, res, next) {
        res.send();
    },
    save: function (req, res, next) {
        res.send();
    },
    remove: function (req, res, next) {
        res.send();
    }
};