var suite = require('./');

suite("suite 1", function(test, subsuite){

    test("test 1", function(t){
        setTimeout(function(){
            t.notOk();
        }, 100);
    });

    test("test 2", function(t){
        setTimeout(function(){
            t.ok();
        }, 100);
    });

    test("test 3", function(t){
        t.ok();
    });

    subsuite("subsuite 1.1", function(test){

        test("test 1", function(t){
            setTimeout(function(){
                t.notOk();
            }, 100);
        });

        test("test 2", function(t){
            t.notOk();
        });

    });

    subsuite("subsuite 1.2", function(test, subsuite){

        test("test 1", function(t){
            setTimeout(function(){
                t.ok();
            }, 100);
        });

        subsuite("subsuite 1.2.1", function(test, subsuite){

            test("test 1", function(t){ t.ok(); });
            test("test 2", function(t){ t.ok(); });
            test("test 3", function(t){ t.ok(); });
            test("test 4", function(t){ t.notOk(); });

            subsuite("subsuite 1.2.1.1", function(test){

                test("test 1", function(t){ t.notOk(); });
                test("test 2", function(t){ t.ok(); });

            });

        });

    });

}, function(results){
    console.log(JSON.stringify(results, 0, 4));
});
