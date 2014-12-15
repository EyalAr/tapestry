![Tapestry](assets/banner.png)

A minimal JavaScript testing framework for frontends and backends.

## Goals

0. Easy to test with.
0. Easy to extend.
0. Handle sync/async tests.
0. Group tests into suites.
0. Enable nesting test suites.
0. Skippable tests / suites. Conditionally skip tests (For example, if network is unavailable).
0. 'Todo' tests / suites. Write tests before the tested feature is ready, and mark the test as 'todo'. The test may fail, but it won't count until the feature is actually implemented.
0. Suites are runnable scripts.
0. Run both in browser and node.
0. Have an optional [TAP](http://testanything.org/) reporter.

## Demo

See [demo.js](demo.js) for current functionalities.

Run it with different reporters:

- `node demo/demo --tree`
- `node demo/demo --TAP`

Output of demo script on Node:

![Demo Node](assets/demo.gif)

Output of demo script on the browser (using _browserify_);

![Demo Browser](assets/demo_browser.gif)

## Usage & API

0. Tests are grouped into suites.
0. Suites are defined with `suite( ... )`.

    ```Javascript
    suite("suite's description", function(test, suite){
        // ...
    });
    ```

0. Suites can be nested.

    ```Javascript
    suite("suite's description", function(test, suite){

        suite("nested suite", function(test, suite){
            // ...
        });

        suite("another nested suite", function(test, suite){
            // ...
        });

    });
    ```

0. Tests can be synchronous.

    ```Javascript
    suite("suite's description", function(test, suite){

        test("a sync test", function(){
            throw Error("This test will fail!");
        });

    });
    ```

0. Tests can be asynchronous.

    ```Javascript
    suite("suite's description", function(test, suite){

        test("a sync test", function(t){
            setTimout(function(){
                t.notOK("This test will fail!");
            }, 100);
        });

    });
    ```

0. Async tests may throw exceptions to indicate failure.

    ```Javascript
    suite("suite's description", function(test, suite){

        test("a sync test", function(t){
            setTimout(function(){
                throw Error("This test will fail!");
            }, 100);
        });

    });
    ```

    **But remember** to indicate the test is async by passing the `t` parameter.
