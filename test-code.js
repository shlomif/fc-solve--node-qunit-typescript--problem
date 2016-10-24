var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require,
    enforceDefine: true,
});

requirejs(['./dest/js/fcs-validate.js', ],
    function   (fcs_valid) {
        requirejs(['./dest/js/web-fc-solve-tests--fcs-validate.js'],
            function (test_valid) {
                test_valid.test_fcs_validate();
                return;
            });
        return;
    });

