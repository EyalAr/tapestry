var async = require('async');

module.exports = suite;

function suite(desc, fn, report){
    var self = this,
        tests = [],
        subsuites = [];

    function prerun(fn, tests, subsuites){
        fn(function(desc, fn){
            tests.push({desc:desc, fn: fn});
        }, function(desc, fn){
            subsuites.push({desc: desc, fn: fn});
        });
    }

    function run(tests, subsuites, done){
        var results = {};
        async.series([
            // run tests
            function(next){
                runTests(tests, function(testsResults){
                    results.tests = testsResults;
                    next();
                });
            },

            // run subsuites
            function(next){
                runSubsuites(subsuites, function(subsuitesResults){
                    results.subsuites = subsuitesResults;
                    next();
                });
            }
        ], function(){
            done(results);
        });
    }

    function runTests(tests, done){
        var results = {};
        async.series(
            tests.map(function(test, i){
                return function(next){
                    var t = {
                        ok: function(){
                            results[test.desc] = "ok";
                            next();
                        },
                        notOk: function(){
                            results[test.desc] = "not ok";
                            next();
                        }
                    };
                    setTimeout(function(){
                        test.fn(t);
                    }, 0);
                };
            }),
            function(){
                done(results);
            }
        );
    }

    function runSubsuites(subsuites, done){
        var results = {};
        async.series(
            subsuites.map(function(subsuite, i){
                return function(next){
                    setTimeout(function(){
                        suite.call(function(subsuiteResults){
                            results[subsuite.desc] = subsuiteResults;
                            next();
                        }, subsuite.desc, subsuite.fn);
                    }, 0);
                };
            }),
            function(){
                done(results);
            }
        );
    }

    prerun(fn, tests, subsuites);

    run(tests, subsuites, function(results){
        if (typeof self === 'function'){
            // it's a subsuite
            self(results);
        }
        if (report) report(results);
    });
}
