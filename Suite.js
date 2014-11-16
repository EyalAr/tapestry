var async = require('async'),
    Referee = require('./Referee'),
    noop = function(){},
    forceAsync = function(fn){
        setTimeout(fn, 0);
    };

function Suite(desc, plan, hooks){
    hooks = hooks || {};
    this.desc = desc;
    this.plan = plan;
    this.tests = [];
    this.subsuites = [];
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

    function registerTest(desc, fn){
        self.tests.push({num: self.tests.length, desc:desc, fn: fn});
    }

    function registerSubsuite(desc, fn){
        self.subsuites.push({num: self.subsuites.length, desc: desc, fn: fn});
    }
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
                    desc: test.desc
                };
                preHook(result);
                test.fn(new Referee(function(success, msg){
                    result.success = success;
                    result.msg = msg;
                    postHook(result);
                    done(null, result);
                }));
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
                    num: subsuite.num,
                    desc: subsuite.desc,
                };
                preHook(result);
                var suite = new Suite(subsuite.desc, subsuite.fn, self.hooks);
                suite.run(function(results){
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

    this.preRun();

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
