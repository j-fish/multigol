exports.build = function(data, sanitizer) {

	let fs = require('fs');
	eval(fs.readFileSync(__dirname + '/../dto/multigol.client.js').toString());
	eval(fs.readFileSync(__dirname + '/../dto/multigol.hashstring.js').toString());
	let client = JSON.parse(data);

	return new User(
		sanitizer.perform(client.userName), 
        sanitizer.perform(hashString(client.userName)), 
        sanitizer.perform(client.hexc), 
    	sanitizer.perform(client.cellImg), 
		sanitizer.perform(client.b64img), 
        sanitizer.perform(client.address), 
    	sanitizer.perform(client.port),
    	0);
}