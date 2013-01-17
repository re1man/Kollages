// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file.
  deps: ["main"],

  paths: {
    // JavaScript folders.
    libs: "../assets/js/libs",
    plugins: "../assets/js/plugins",
    vendor: "../assets/vendor",

    // Libraries.
    jquery: "../assets/js/libs/jquery",
    lodash: "../assets/js/libs/lodash",
    backbone: "../assets/js/libs/backbone",
    handlebars: "../assets/js/libs/handlebars-1.0.0.beta.6",
    bootstrap: "../assets/js/libs/bootstrap",
    "facebook-api": "../assets/js/libs/facebook-api",
    'propertyParser':'../assets/js/plugins/propertyParser',
    'spin':'../assets/js/plugins/spin',
    'spinnerOpts':'../assets/js/plugins/spinnerOpts',
    'modernizr': '../assets/js/libs/modernizr.custom.95716',
    'backbone-touch':'../assets/js/plugins/backbone.touch',
    "highlight": '../assets/js/plugins/jquery.highlight',
    'jquery.touch-punch' :     '../assets/js/plugins/jquery.ui.touch-punch',
    'jquery.ui' :     '../assets/js/libs/jquery-ui-1.9.2.custom',
    "idle": '../assets/js/plugins/jquery.idle',
    'jquery.iframe-transport' :  '../assets/js/plugins/jquery.iframe-transport',
    'jquery.fileupload' :        '../assets/js/plugins/jquery.fileupload'
  },

  shim: {
    // Backbone library depends on lodash and jQuery.
    backbone: {
      deps: ["lodash", "jquery"],
      exports: "Backbone"
    },
    'backbone-touch': {
      deps: ["backbone"],
      exports: "Backbone-touch"
    },
    bootstrap: {
      deps: ["jquery"],
      exports: "Bootstrap"
    },
    'jquery.ui': {
      deps: ['jquery.touch-punch'],
      exports: "Jquery-UI"
    },
    'jquery.fileupload': {
      deps: ['jquery.ui']
    },
    // Handlebars has no dependencies.
    handlebars: {
      exports: "Handlebars"
    },
    "spin":{
      deps: ["spinnerOpts"],
      exports: "Spin"
    },

    // Backbone.LayoutManager depends on Backbone.
    "plugins/backbone.layoutmanager": ["backbone"]
  }

});
