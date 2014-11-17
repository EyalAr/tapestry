var TAP_VER_STR = "TAP version 13",
    DIRECTIVES = ["skip", "todo"];

var Suite = require('./Suite'),
    queue = [],
    descStack = [],
    running = false,
    counter = 0,
    hooks = {
        test: {},
        suite: {}
    };

hooks.test.pre = function(meta){
    descStack.push(meta.desc);
};

hooks.test.post = function(result){
    var i, d;
    var line = [];
    line.push(result.success ? "ok" : "not ok");
    line.push(counter++);
    Array.prototype.push.apply(line, descStack);
    for (i = 0; i < DIRECTIVES.length; i++){
        d = DIRECTIVES[i];
        if (result.directives[d] && result.directives[d].active){
            line.push("#", d.toUpperCase());
            if (result.directives[d].msg)
                line.push(result.directives[d].msg);
        }
    }
    println.apply(null, line);
    descStack.pop();
};

hooks.suite.pre = function(meta){
    descStack.push(meta.desc);
};

hooks.suite.post = function(meta){
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
        suite = new Suite(suite[0], suite[1], hooks);
        running = true;
        println(TAP_VER_STR);
        println("1.." + suite.count());
        suite.run(function(result){
            descStack.pop();
            running = false;
            next();
            console.log("---------------");
            console.log(JSON.stringify(result, 0, 4));
        });
    }
}

module.exports = queueSuite;
