var suite = require('../lib/reporters/tree');

suite("My application - Part 1", function(test, suite){

    test("basic function 1", function(t){
        t.assert("foo" === "bar", "foo === bar");
    }).todo("will land in version 2.3.2");

    test("basic function 2", function(t){
        setTimeout(function(){
            t.ok();
        }, 100);
    });

    test("basic function 3", function(t){
        throw Error("Ooops");
    });

    test("basic function 4", function(){
        // all good
    });

    suite("login", function(test){

        test("with incorrect password", function(t){
            setTimeout(function(){
                t.notOk("login should've failed");
            }, 300);
        }).skip("logins server is down");

        test("with correct password", function(t){
            t.notOk("login should've succeeded");
        });

    });

});
