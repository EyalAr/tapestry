var suite = require('../');

suite("My application", function(test, suite){

    // although this test fails, it's marked as 'todo'...
    // so this failure be noted, but not counted.
    test("basic function 1", function(t){
        setTimeout(function(){
            throw Error("async failure? no problem!");
        }, 500);
    });

    // this test will time out after 300ms.
    // it would've passed if it had 500ms.
    test("basic function 2", function(t){
        var self = this;
        setTimeout(function(){
            t.assert(self.db.get("hello") === "HELLO");
        }, 500);
    }).setup(function(){
        this.db = {
            get: function(key){
                return key.toUpperCase();
            }
        };
    }).teardown(function(done){
        // disconnect from db...
        setTimeout(done, 100);
    });

    // this test will fail because the test
    // function throws synchronously
    test("basic function 3", function(t){
        throw Error("Ooops");
    });

    // this test will pass
    test("basic function 4", function(){
        // all good
    });

    suite("login module", function(test){

        // This asynchronous test will fail
        test("with incorrect password", function(t){
            setTimeout(function(){
                // if login succeeded, fail the test...
                t.notOk("login should've failed");
                // else, t.ok()...
            }, 300);
        });

        // let's say the login server is down, so we can't run this
        // part of the test. we mark the test as 'skipped' (conditionally).
        var loginServerDown = true;
        test("with correct password", function(t){
            setTimeout(function(){
                t.ok();
            }, 500);
        }).skip(loginServerDown);

    });

    suite("logout module", function(test){

        // This asynchronous test will pass.
        // notice it's marked as 'todo'.
        // maybe the test was written before the feature was implemented.
        // it will be noted as a passed 'todo' test, so the developer can
        // remember to remove the 'todo' and make this test count in
        // failures.
        test("after login", function(t){
            setTimeout(function(){
                t.ok();
            }, 700);
        }).todo();

    });

    suite("other module", function(test, suite){

        suite("sub-module", function(test, suite){

            test("function 1", function(t){
                setTimeout(function(){
                    t.ok();
                }, 300);
            });

            suite("sub-sub-module", function(test, suite){

                // you can also define tests in a loop
                for (var i = 1; i <= 10; i++)(function(i){
                    test("function " + i, function(t){
                        setTimeout(function(){
                            t.assert(i % 2 === 0);
                        }, 100);
                    }).todo(i % 3 === 0).skip(i % 7 === 0).timeout(i * 40);
                })(i);

            });

            suite("another sub-sub-module", function(test, suite){

                // example for skipping an entire subsuite
                suite("another sub-sub-sub-module", function(test, suite){

                    // doesn't matter if tests here fail or succeed.
                    // the entire suite is skipped.

                    test("some function", function(t){
                        setTimeout(function(){
                            t.notOK();
                        }, 300);
                    });

                    test("some other function", function(t){
                        setTimeout(function(){
                            t.OK();
                        }, 300);
                    });

                }).skip();

                // example for 'todo'ing an entire subsuite
                suite("another sub-sub-sub-module", function(test, suite){

                    test("some function", function(t){
                        setTimeout(function(){
                            t.notOK();
                        }, 300);
                    });

                    test("some other function", function(t){
                        setTimeout(function(){
                            t.OK();
                        }, 300);
                    });

                }).todo();

            });

        });

    });

});
