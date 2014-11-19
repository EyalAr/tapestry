var suite = require('../');

suite("My application - Part 2", function(test, suite){

    suite("shopping cart", function(test, suite){

        test("go to shopping cart page", function(t){
            setTimeout(function(){
                t.ok();
            }, 700);
        }).todo();

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
