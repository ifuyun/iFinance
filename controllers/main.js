/**
 *
 * @author fuyun
 * @since 2017/08/14
 */
const util = require('../helper/util');
const config = require('../config/core');

module.exports = {
    welcome: function (req, res) {
        res.redirect('/finance/list');
    },
    checkAuth: function (req, res, next) {
        res.locals.isLogin = util.isLogin(req);
        if (util.isAdminUser(req)) {
            return next();
        }
        if (res.locals.isLogin) {
            util.catchError({
                status: 403,
                code: 403,
                message: 'Page Forbidden'
            }, next);
        } else {
            res.redirect(`http://${config.ssoDomain}/user/login`);
        }
    }
};
