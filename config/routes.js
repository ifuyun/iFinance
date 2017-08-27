/* jslint nomen:true es5:true */
/* global console,process,__dirname */
/**
 * 路由定义，含错误路由
 * @module cfg_routes
 * @param {Object} app express实例
 * @param {Object} express express对象
 * @return {void}
 * @author Fuyun
 * @version 1.0.0
 * @since 1.0.0
 */
const path = require('path');
const base = require('./routes-base');
const admin = require('../controllers/main');
const finance = require('../controllers/finance');
const taxonomy = require('../controllers/taxonomy');

module.exports = function (app, express) {
    const {ENV: env} = process.env;

    app.use(admin.checkAuth);
    // 静态文件(若先路由后静态文件，将导致session丢失)
    app.use(express.static(path.join(__dirname, '..', 'public', 'static')));
    app.use(express.static(path.join(__dirname, '..', 'public', env && env.trim() === 'production' ? 'dist' : 'dev')));

    app.use(base.init);
    app.get('/', admin.welcome);
    app.get('/finance', finance.list);
    app.get('/finance/page-:page', finance.list);
    app.get('/finance/item', finance.edit);
    app.post('/finance/save', finance.save);
    app.post('/finance/remove', finance.remove);

    app.get('/taxonomy', taxonomy.list);
    app.get('/taxonomy/get', taxonomy.listJson);
    // app.get('/taxonomy/page-:page', taxonomy.list);
    // app.get('/taxonomy/item', taxonomy.edit);
    app.post('/taxonomy/save', taxonomy.save);
    app.post('/taxonomy/remove', taxonomy.remove);

    // 错误路由
    app.use(base.error);
};
