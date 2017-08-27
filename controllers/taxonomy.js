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
const {Taxonomy} = models;

module.exports = {
    list: function (req, res, next) {
        const action = (req.query.action || 'create').toLowerCase();
        if (!['create', 'edit'].includes(action)) {
            logger.error(formatOpLog({
                fn: 'taxonomy.list',
                msg: `Operate: ${action} is not allowed.`,
                req
            }));
            return util.catchError({
                status: 200,
                code: 400,
                message: '不支持该操作'
            }, next);
        }
        const resData = {
            meta: {
                title: util.getTitle(['分类列表', '管理后台', '爱记账'])
            },
            token: req.csrfToken(),
            page: 'taxonomy',
            title: '分类目录'
        };
        res.render(`${appConfig.pathViews}/admin/pages/taxonomy`, resData);
    },
    listJson: function (req, res, next) {
        common.getCategoryTree((err, data) => {
            if (err) {
                logger.error(formatOpLog({
                    fn: 'taxonomy.listJson',
                    msg: err,
                    req
                }));
                return next(err);
            }
            res.type('application/json');
            res.send({
                code: 0,
                message: null,
                data: common.getCategoryTreeView(data.catTree, [])
            });
        });
    },
    save: function (req, res, next) {
        const param = req.body;
        let taxonomyId = xss.sanitize(param.taxonomyId) || '';
        let data = {};
        const name = util.trim(xss.sanitize(param.name));
        data.parent = util.trim(xss.sanitize(param.parent));
        data.orderNo = xss.sanitize(param.orderNo) || 0;

        if (name) {
            data.name = name;
        }
        if (!idReg.test(taxonomyId)) {
            taxonomyId = '';
        }
        let rules = [{
            rule: !taxonomyId && !data.name,
            message: '名称不能为空'
        }, {
            rule: !/^\d+$/i.test(data.orderNo),
            message: '排序只能为数字'
        }];
        if (Array.isArray(param.siblings) && taxonomyId) {
            data.orderNo = param.siblings.indexOf(param.taxonomyId);
        }
        for (let i = 0; i < rules.length; i += 1) {
            if (rules[i].rule) {
                return util.catchError({
                    status: 200,
                    code: 400,
                    message: rules[i].message
                }, next);
            }
        }
        models.sequelize.transaction(function (t) {
            let tasks = {};
            tasks.taxonomy = function (cb) {
                const nowTime = new Date();
                if (taxonomyId) {
                    data.modified = nowTime;
                    Taxonomy.update(data, {
                        where: {
                            taxonomyId
                        },
                        transaction: t
                    }).then((taxonomy) => cb(null, data));
                } else {
                    data.taxonomyId = util.getUuid();
                    data.created = nowTime;
                    data.modified = nowTime;
                    Taxonomy.create(data, {
                        transaction: t
                    }).then((taxonomy) => cb(null, data));
                }
            };
            if (param.siblings.length > 1) {
                tasks.orders = (cb) => {
                    async.times(param.siblings.length, (i, nextFn) => {
                        const curId = param.siblings[i].trim();
                        if (curId !== taxonomyId) {
                            const data = {
                                orderNo: i,
                                modified: new Date()
                            };
                            Taxonomy.update(data, {
                                where: {
                                    taxonomyId: curId
                                },
                                transaction: t
                            }).then((taxonomy) => nextFn(null, data));
                        } else {
                            nextFn(null);
                        }
                    }, (err, result) => {
                        cb(err, result);
                    });
                };
            }
            // 需要返回promise实例
            return new Promise((resolve, reject) => {
                async.auto(tasks, function (err, result) {
                    if (err) {
                        logger.error(formatOpLog({
                            fn: 'taxonomy.save',
                            msg: err,
                            data,
                            req
                        }));
                        reject(new Error(err));
                    } else {
                        logger.info(formatOpLog({
                            fn: 'taxonomy.save',
                            msg: `Taxonomy: ${result.taxonomy.taxonomyId}:${result.taxonomy.name} is saved.`,
                            data,
                            req
                        }));
                        resolve(result);
                    }
                });
            });
        }).then((result) => {
            res.type('application/json');
            res.send({
                code: 0,
                message: null,
                token: req.csrfToken(),
                data: {
                    taxonomyId: result.taxonomy.taxonomyId,
                    name: result.taxonomy.name,
                    parent: result.taxonomy.parent
                }
            });
        }, (err) => {
            next({
                status: 200,
                code: 500,
                message: err.message || err
            });
        });
    },
    remove: function (req, res, next) {
        res.send();
    }
};