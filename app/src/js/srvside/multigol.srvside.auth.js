/**
 * HTTP Athentification.
 */
exports.auth = function(req, res, next) {

	let basicAuth = require('basic-auth');

	function unauthorized(res) {
    	res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    	return res.sendStatus(401);
	};

	let user = basicAuth(req);
	if (!user || !user.name || !user.pass) return unauthorized(res);

	if (user.name === '' && user.pass === '') return next();
	else return unauthorized(res);

}