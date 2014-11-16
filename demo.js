var suite = require('./');

suite("My application", function(test, suite){

    test("basic function 1", function(t){
        t.assert("foo" === "bar", "foo === bar");
    });

    test("basic function 2", function(t){
        setTimeout(function(){
            t.ok();
        }, 100);
    });

    test("basic function 3", function(t){
        t.ok();
    });

    suite("login", function(test){

        test("with incorrect password", function(t){
            setTimeout(function(){
                t.notOk("login should've failed");
            }, 300);
        });

        test("with correct password", function(t){
            t.notOk("login should've succeeded");
        });

    });

    suite("shopping cart", function(test, suite){

        test("go to shopping cart page", function(t){
            setTimeout(function(){
                t.ok();
            }, 700);
        });

        suite("items", function(test, suite){

            suite("additions", function(test){

                test("add first item", function(t){
                    setTimeout(function(){
                        t.notOk("something went wrong");
                    }, 400);
                });

                test("add second item", function(t){
                    t.ok();
                });

            });

            suite("removals", function(test){

                test("remove first item", function(t){
                    setTimeout(function(){
                        t.ok();
                    }, 450);
                });

                test("remove second item", function(t){
                    t.notOk("can't remove item which doesn't exist");
                });

            });

        });

    });

});
