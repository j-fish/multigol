/**
 * Sanitize util using npm install sanitizer.
 */
var sanitizer = require('sanitizer');
exports.perform = function(data) {

	data = sanitizer.escape(data);
	data = sanitizer.normalizeRCData(data);
	data = sanitizer.sanitize(data);
	data = sanitizer.sanitize(data);

	return data;
}