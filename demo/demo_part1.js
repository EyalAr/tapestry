var suite = require('../lib/reporters/tree');

suite("My application - Part 1", function(test, suite){

    test("basic function 1", function(t){
        setTimeout(function(){
            t.assert("foo" === "bar", "foo === bar");
        }, 500);
    }).todo("will land in version 2.3.2");

    test("basic function 2", function(t){
        setTimeout(function(){
            t.ok();
        }, 500);
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
            }, 700);
        }).skip("logins server is down");

        test("with correct password", function(t){
            setTimeout(function(){
                t.notOk("login should've succeeded");
            }, 500);
        }).skip("logins server is down");;

    });

});
