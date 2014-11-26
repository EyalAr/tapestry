(function(){ 'use strict';

var TAP_VER_STR = "TAP version 13",
    TEST_OK = "ok",
    TEST_NOT_OK = "not ok",
    DIRECTIVE_DELIM = "#",
    DIRECTIVES = ["skip", "todo"];

var Suite = require('../core/Suite'),
    queue = [],
    descStack = [],
    running = false,
    counter = 0,
    hooks = {
        test: {},
        suite: {}
    };

hooks.test.pre = function(test){
    descStack.push(test.meta.desc);
};

hooks.test.post = function(test){
    var i, d;
    var line = [];
    line.push(test.success ? TEST_OK : TEST_NOT_OK);
    line.push(counter++);
    Array.prototype.push.apply(line, descStack);
    for (i = 0; i < DIRECTIVES.length; i++){
        d = DIRECTIVES[i];
        if (test[d]){
            line.push(DIRECTIVE_DELIM, d.toUpperCase());
            if (typeof test[d] === 'string')
                line.push(test[d]);
        }
    }
    println.apply(null, line);
    descStack.pop();
};

hooks.suite.pre = function(suite){
    descStack.push(suite.meta.desc);
};

hooks.suite.post = function(suite){
    descStack.pop();
};

function println(){
    console.log.apply(console, arguments);
}

function queueSuite(desc, fn){
    queue.push([desc, fn]);
    next();
}

function next(){
    if (!running && queue.length){
        var suite = queue.shift();
        descStack.push(suite[0]);
        suite = new Suite(suite[0], suite[1], null, hooks);
        running = true;
        println(TAP_VER_STR);
        println("1.." + suite.count());
        suite.run(function(result){
            descStack.pop();
            running = false;
            next();
        });
    }
}

module.exports = queueSuite;

})();
