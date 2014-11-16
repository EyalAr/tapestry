var Suite = require('./Suite'),
    print = function(msg){
        process.stdout.write(msg);
    };

function newSuiteRunner(){
    var descriptors = [],
        hooks = {
            test: {
                pre: function(meta){
                    descriptors.push(meta.desc);
                    print(descriptors.join(" ") + "... ");
                },
                post: function(result){
                    print(result.success ? "ok" : "not ok");
                    if (result.msg) print(" # " + result.msg);
                    print("\n");
                    descriptors.pop();
                }
            },
            suite: {
                pre: function(meta){
                    descriptors.push(meta.desc);
                },
                post: function(meta){
                    descriptors.pop();
                }
            }
        };
    return function(desc, fn){
        descriptors.push(desc);
        var suite = new Suite(desc, fn, hooks);
        suite.run();
    };
}

module.exports = newSuiteRunner();
