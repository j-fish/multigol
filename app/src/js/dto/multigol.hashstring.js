/**
 * Hash string to integer.
 */ 
function hashString(str) {

    let hash = 0;
    let char;
    if (str.length == 0) return hash;

    for (var i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
}