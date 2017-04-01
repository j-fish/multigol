exports.build = function() {
	var fs = require('fs');
	eval(fs.readFileSync(__dirname + '/../dto/multigol.hashtable.js').toString());
	return new HashTable();
}