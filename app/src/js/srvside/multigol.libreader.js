/*************************************************
* GOL Library.
**************************************************/
/**
 * Hash string to integer.
 */ 
function HashString(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/*
* Build library data.
*/
exports.BuildLibrary = function(libArray, filePath) {
    
    var file = filePath;
    var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(file);

    var pattern = '';
    var description = '';
    var patternCode = '';
    var c = 0;
    var check = 0;

    lr.on('error', function(err) {
        console.log('|_' + err);
    });

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
            var hId = HashString(pattern) + c.toString();
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