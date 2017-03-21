/*
* Build library data.
*/
exports.buildLibrary = function(libArray, filePath) {

    var file = filePath;
    var LineByLineReader = require('line-by-line');
    var fs = require('fs');
    eval(fs.readFileSync(__dirname + '/../dto/multigol.hashstring.js').toString());
    lr = new LineByLineReader(file);

    var pattern = '';
    var description = '';
    var patternCode = '';
    var c = 0;
    var check = 0;

    lr.on('error', function(err) { console.log('|_' + err); });

    lr.on('line', function(line) {

        if (line.indexOf('%pattern-name%') > -1) {
            pattern = line.replace('%pattern-name%', '');
            pattern = pattern.replace('\\n', '');
            ++check;
        } else if (line.indexOf('%pattern-description%') > -1) {
            description = line.replace('%pattern-description%', '');
            description = description.replace('\\n', '');
            ++check;
        } else if (line.indexOf('%pattern-code%') > -1) {
            patternCode = line.replace('%pattern-code%', '');
            patternCode = patternCode.replace(' ', '');
            patternCode = patternCode.replace('\\n', '');
            ++check;
        }

        if (check === 3) {
            var hId = hashString(pattern) + c.toString();
            libArray.push({'name':pattern, 'desc':description, 'code':patternCode, 'id':c, 'hashid':hId});
            ++c;
            pattern = '';
            description = '';
            patternCode = '';
            check = 0;
        }
    });

    lr.on('end', function () {
        return;
    });
}