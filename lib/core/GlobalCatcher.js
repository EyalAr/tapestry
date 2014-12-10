(function(){ 'use strict';

var hasProcess = process && process.on,
    hasWindow = typeof window !== 'undefined' && window.onerror !== void 0,
    subscribers = [],
    o_onerror;

function takeOver(){
    if (hasProcess){
        process.on('uncaughtException', globalCatch);
    }
    if (hasWindow){
        o_onerror = window.onerror;
        window.onerror = globalCatch;
    }
}

function release(){
    if (hasProcess){
        process.removeListener('uncaughtException', globalCatch);
    }
    if (hasWindow){
        window.onerror = o_onerror;
    }
}

function globalCatch(e){
    subscribers.forEach(function(fn){
        try{
            fn(e);
        } catch (_){
            // if fn threw, there's really
            // nothing we can do for it.
            unsubscribe(fn);
        }
    });
    return true; // prevent browsers from reporting this exception
}

function subscribe(fn){
    if (!subscribers.length) takeOver();
    subscribers.push(fn);
}

function unsubscribe(fn){
    var i = subscribers.indexOf(fn);
    if (i !== -1) subscribers.splice(i, 1);
    if (!subscribers.length) release();
}

module.exports = {
    subscribe: subscribe,
    unsubscribe: unsubscribe
};

})();
