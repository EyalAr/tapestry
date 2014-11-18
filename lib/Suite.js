(function(){ 'use strict';

var SUITE_STAGE_IDLE = 0,
    SUITE_STAGE_RUNNING = 1,
    SUITE_STAGE_FINISHED = 2;

var async = require('async'),
    Test = require('./Test'),
    DirectivesModifier = require('./DirectivesModifier'),
    gid = 0,
    noop = function(){},
    forceAsync = function(fn){
        setTimeout(fn, 0);
    };

function Suite(meta, plan, parent, hooks){
    hooks = hooks || {};
    this.meta = meta;
    this.plan = plan;
    this.tests = [];
    this.subsuites = [];
    this.preRan = false;
    this.parent = parent || null;
    this.stage = SUITE_STAGE_IDLE;
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
    this.plan(registerTest.bind(this), registerSubsuite.bind(this));
    this.preRan = true;
};

function registerTest(desc, fn){
    var test = new Test({
        num: this.tests.length,
        gid: gid++,
        desc: desc
    }, fn, this);
    this.tests.push(test);
    return new DirectivesModifier(test);
}

function registerSubsuite(desc, fn){
    var suite = new Suite({
        num: this.subsuites.length,
        gid: gid++,
        desc: desc
    }, fn, this, this.hooks);
    this.subsuites.push(suite);
    return new DirectivesModifier(suite);
}

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
                preHook(test);
                test.run(function(){
                    postHook(test);
                    done(null, test);
                });
            });
        },
        function(err, results){
            done(results);
        }
    );
};

Suite.prototype.runSubsuites = function(done){
    var preHook = this.hooks.suite.pre,
        postHook = this.hooks.suite.post;
    async.mapSeries(
        this.subsuites,
        function(subsuite, done){
            forceAsync(function(){
                preHook(subsuite);
                subsuite.run(function(){
                    postHook(subsuite);
                    done(null, subsuite);
                });
            });
        },
        function(err, results){
            done(results);
        }
    );
};

Suite.prototype.run = function(done){
    done = done || noop;
    var self = this,
        time = Date.now();

    self.stage = SUITE_STAGE_RUNNING;
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
        self.time = Date.now() - time;
        self.stage = SUITE_STAGE_FINISHED;
        done({
            tests: results[0],
            subsuites: results[1]
        });
    });
};

module.exports = Suite;

})();
