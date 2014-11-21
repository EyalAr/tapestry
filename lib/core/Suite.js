(function(){ 'use strict';

var SUITE_STAGE_IDLE = 0,
    SUITE_STAGE_RUNNING = 1,
    SUITE_STAGE_FINISHED = 2;

var async = require('async'),
    Test = require('./Test'),
    Modifier = require('./Modifier'),
    gid = 0,
    noop = function(){},
    forceAsync = function(fn){
        setTimeout(fn, 0);
    };

/**
 * A test Suite. Groups together zero or more subsuites and tests.
 * @param {Object} meta
 *     Meta information about the suite, such as description, id, etc.
 * @param {Function} plan
 *     Suite's test plan function. This function builds the suite. Called with
 *     2 arguments: plan(subsuite, test).
 *     - 'subsuite' is a function which defines a new subsuite. It takes 2 args:
 *       subsuite(desc, plan).
 *           - desc is the subsuite's description
 *           - plan is the subsuite's plan function.
 *     - 'test' is a function which defines a test within this suite. it takes
 *       2 args: test(desc, fn)
 *           - desc is the test's description
 *           - fn is the test's function. if it has no arguments, the test is
 *             considered synchronous. The test will fail if this function
 *             throws an exception, and succeed otherwise.
 *             It can be called with one optional argument: fn(t). in this case
 *             the test is considered asynchronous. 't' is a Referee object
 *             which asynchronously determines failure or success of this test.
 * @param {Reference} parent
 *     Reference to the parent suite.
 * @param {Object} hooks
 *     {Function} hooks.test.pre - called before each test, with the test object
 *         as an argument.
 *     {Function} hooks.test.post - called after each test, with the test object
 *         as an argument.
 *     {Function} hooks.suite.pre - called before each suite, with the suite
 *         object as an argument.
 *     {Function} hooks.suite.post - called after each suite, with the suite
 *         object as an argument.
 */
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

/**
 * Prepare the suite for running.
 * This will call the suite's 'plan' function with the appropriate subsuites
 * and tests registering functions.
 */
Suite.prototype.preRun = function(){
    this.plan(registerTest.bind(this), registerSubsuite.bind(this));
    this.preRan = true;
};

/**
 * Create a new test and add it to this suite.
 * Note: this function must be called with the 'this' context set to the calling
 * suite.
 * @param {String} desc Test's description.
 * @param {Function} fn Test's function.
 * @return {Modifier} An object with methods to modify the test's
 *     directives.
 */
function registerTest(desc, fn){
    var test = new Test({
        num: this.tests.length,
        gid: gid++,
        desc: desc
    }, fn, this);
    this.tests.push(test);
    return new Modifier(test);
}

/**
 * Create a new suite and add it to this suite.
 * Note: this function must be called with the 'this' context set to the calling
 * suite.
 * @param {String} desc Suite's description.
 * @param {Function} fn Suite's plan function.
 * @return {Modifier} An object with methods to modify the suite's
 *     directives.
 */
function registerSubsuite(desc, fn){
    var suite = new Suite({
        num: this.subsuites.length,
        gid: gid++,
        desc: desc
    }, fn, this, this.hooks);
    this.subsuites.push(suite);
    return new Modifier(suite);
}

/**
 * Count the number of tests in this suite. The counting is recursive, and
 * includes tests in subsuites.
 * @return {Integer}
 */
Suite.prototype.count = function(){
    if (!this.preRan) this.preRun();
    return this.tests.length +
        this.subsuites.reduce(function(tot, suite){
            return tot + suite.count();
        }, 0);
};

/**
 * Run top level tests in this suite.
 * @param  {Function} done When all tests are done, call this function with an
 *     array of all tests.
 */
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

/**
 * Run top level subsuites in this suite.
 * @param  {Function} done When all suites are done, call this function with an
 *     array of all suites.
 */
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

/**
 * Run this test suite.
 * @param  {Function} done When done, call this function with a results object.
 *     The object has two fields:
 *     - tests: array of all top level finished tests in this suite.
 *     - subsuites: array of all top level finished subsuites in this suite.
 */
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
