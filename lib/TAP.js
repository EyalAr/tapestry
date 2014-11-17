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
    print(result.success ? "ok" : "not ok");
    print(" " + counter++);
    print(" " + descStack.join(" "));
    for (i = 0; i < DIRECTIVES.length; i++){
        d = DIRECTIVES[i];
        if (result.directives[d] && result.directives[d].active){
            print(" # " + d.toUpperCase());
            if (result.directives[d].msg)
                print(" " + result.directives[d].msg);
        }
    }
    print("\n");
    descStack.pop();
};

hooks.suite.pre = function(meta){
    descStack.push(meta.desc);
};

hooks.suite.post = function(meta){
    descStack.pop();
};

function print(msg){
    process.stdout.write(msg);
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
        print(TAP_VER_STR + "\n");
        print("1.." + suite.count() + "\n");
        suite.run(function(){
            descStack.pop();
            running = false;
            next();
        });
    }
}

module.exports = queueSuite;
