define([
  // Application.
  "app",
  "modules/feed",
  "spinnerOpts",
  "spin"

],

function(app, Feed, spinnerOpts, Spinner) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index"
    },

    index: function() {
      this.renderView();
    },
    renderView: function(){
      var layout = app.useLayout('main');
      layout.insertView('.post-init', new Feed.Post());
    }

  });

  return Router;

});
