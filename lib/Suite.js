var async = require('async'),
    Referee = require('./Referee'),
    TestDirectivesModifier = require('./TestDirectivesModifier'),
    noop = function(){},
    forceAsync = function(fn){
        setTimeout(fn, 0);
    };

function Suite(meta, plan, hooks){
    hooks = hooks || {};
    this.meta = meta;
    this.plan = plan;
    this.tests = [];
    this.subsuites = [];
    this.preRan = false;
    this.hooks = {
        test: hooks.test || {},
        suite: hooks.suite || {}
    };
    this.hooks.test.pre = this.hooks.test.pre || noop;
    this.hooks.test.post = this.hooks.test.post || noop;
    this.hooks.suite.pre = this.hooks.suite.pre || noop;
    this.hooks.suite.post = this.hooks.suite.post || noop;
}

Suite.prototype.preRun = function(){
    var self = this;

    this.plan(registerTest, registerSubsuite);
    this.preRan = true;

    function registerTest(desc, fn){
        var test = {num: self.tests.length, desc:desc, fn: fn};
        self.tests.push(test);
        return new TestDirectivesModifier(test);
    }

    function registerSubsuite(desc, fn){
        self.subsuites.push(new Suite(
            {num: self.subsuites.length, desc: desc},
            fn,
            self.hooks
        ));
    }
};

Suite.prototype.count = function(){
    if (!this.preRan) this.preRun();
    return this.tests.length +
        this.subsuites.reduce(function(tot, suite){
            return tot + suite.count();
        }, 0);
};

Suite.prototype.runTests = function(done){
    var preHook = this.hooks.test.pre,
        postHook = this.hooks.test.post;
    async.mapSeries(
        this.tests,
        function(test, done){
            forceAsync(function(){
                var result = {
                    num: test.num,
                    desc: test.desc,
                    directives: test.directives
                };
                preHook(result);
                var time = Date.now();
                try{
                    if (test.fn.length === 0){
                        test.fn();
                        result.time = Date.now() - time;
                        result.success = true;
                        postHook(result);
                        done(null, result);
                    } else {
                        test.fn(new Referee(function(success, msg){
                            result.time = Date.now() - time;
                            result.success = success;
                            result.msg = msg;
                            postHook(result);
                            done(null, result);
                        }));
                    }
                } catch(e){
                    result.time = Date.now() - time;
                    result.success = false;
                    result.msg = e.toString();
                    postHook(result);
                    done(null, result);
                }
            });
        },
        function(err, results){
            done(results);
        }
    );
};

Suite.prototype.runSubsuites = function(done){
    var self = this,
        preHook = this.hooks.suite.pre,
        postHook = this.hooks.suite.post;
    async.mapSeries(
        this.subsuites,
        function(subsuite, done){
            forceAsync(function(){
                var result = {
                    num: subsuite.meta.num,
                    desc: subsuite.meta.desc,
                };
                preHook(result);
                subsuite.run(function(results){
                    result.results = results;
                    postHook(result);
                    done(null, result);
                });
            });
        },
        function(err, results){
            done(results);
        }
    );
};

Suite.prototype.run = function(report){
    report = report || noop;
    var self = this;

    if (!this.preRan) this.preRun();

    async.series([

        // run tests:
        function(next){
            self.runTests(function(results){
                next(null, results);
            });
        },

        // run subsuites
        function(next){
            self.runSubsuites(function(results){
                next(null, results);
            });
        },

    ], function(err, results){
        report({
            tests: results[0],
            subsuites: results[1]
        });
    });
};

module.exports = Suite;
