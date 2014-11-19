(function(){ 'use strict';

function noop(){}

/**
 * Return a buffered 'write' function.
 * @param  {Function} printProxy Writes new lines to some output display.
 * @return {Function}
 */
function newStreamWriteShim(printProxy){
    var buffer = [],
        npos = 0; // next position

    /**
     * Use 'printProxy' to print 'str'.
     * Use 'printProxy' when a new line is detected. Until then, store strings
     * in 'buffer'.
     * @param  {String} str The string to print
     * @param  {Sting} enc **ignored**
     * @param  {Function} cb Called asyncly
     * @return {Boolean} Always returns 'true'
     */
    function _writeShim(str, enc, cb){
        cb = cb || enc || noop;
        if ('function' !== typeof cb) cb = noop;

        var c, i = 0;
        while ( (c = str[i++]) ){
            if ('\n' === c){
                printProxy(buffer.join(''));
                buffer.length = npos = 0;
            } else if ('\b' === c){
                npos--;
            } else if ('\r' === c){
                npos = 0;
            } else {
                buffer[npos++] = c;
            }
        }

        process.nextTick(cb);

        return true;
    }

    return _writeShim;
}

module.exports = newStreamWriteShim;

})();
