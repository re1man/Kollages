define([
  // Application.
  "app",
  "spin",
  'jquery.fileupload',
  'jquery.ui',
  "idle",
  "bootstrap"
],

// Map dependencies from above array.
function(app,Spinner) {

  // Create a new module.
  var Feed = app.module();

  // Default model.
  Feed.Model = Backbone.Model.extend();
  Feed.Section = Backbone.View.extend({
    className: 'post-sec',
    template: 'app/templates/layouts/section',
    events: {
      'click .remove-section': 'removeSection'
    },
    removeSection: function(){
      this.model.collection.remove(this.model);
      return false;
    }
  });
  // Default collection.
  Feed.Collection = Backbone.Collection.extend();
  Feed.Posting = Backbone.View.extend({
    className: 'posting-container',
    template: 'app/templates/layouts/posting',
    initialize: function(){
      this.collection.on('add', this.save, this);
      this.collection.on('remove', this.save, this);
    },
    events: {
      'click .add-section': 'addSection'
    },
    addSection: function(){
      var model = new Feed.Model({para:false, image:false,title:false, link:false, images: []});
      this.collection.add(model);
      return false;
    },
    removeSection: function(){
      return false;
    },
    save: function(){
      var self = this;
      var collection = [];
      this.collection.each(function(model){
        var mod = model.attributes;
        collection.push(mod);
      });
      $.post('/save', {collection:collection}, function(data){
        self.render();
      });
    },
    beforeRender: function(){
      var self = this;
      var len = this.collection.models.length;
      var height;
      // if (len === 0){
      //   height = 100;
      // } else {
      //   height = len * 100;
      // }
      // $(this.el).css('height', height + '%');
      this.collection.each(function(model){
        var view = new Feed.Section({model:model});
        self.insertView(view);
      });
    },
    afterRender: function(){
      $('.add-toolbar').show();
    }
  });
  Feed.Post = Backbone.View.extend({
    template: 'app/templates/layouts/post',
    className:'posting',
    initialize: function(){
      this.facebook_id = '345555722142160';
    },
    afterRender: function(){
      var self = this;
      require( ['facebook-api!appId:' + this.facebook_id], function(FB) {
        $(".facebook-login>img").click(function() {
             FB.login(function (response){
              if (response.status === 'connected') {
                  check();
              }
             });
          });
          FB.getLoginStatus(function(response) {
              if (response.status === 'connected') {
                  check();
              }
          });

          function check(){
            FB.api('/me', function(res){
                $('.facebook-login').remove();
                $('.post-loading').show();
                Feed.userId = res.id;
                var target = $('.post-loading')[0];
                var spinner = new Spinner(window.spinnerOpts).spin(target);
                $.post('/getSplash', {id: res.id}, function(data){
                  console.log(data);
                  $('.post-loading').hide();
                  $('.post-section').show();
                  var collection = new Feed.Collection();
                  
                  if (data !== 'OK'){
                    _.each(data, function(dat){
                      var mod = new Feed.Model(dat);
                      collection.add(mod);
                    });
                  }
                  
                  Feed.Current = new Feed.Posting({collection: collection});
                  self.insertView('.post-section', Feed.Current);
                  Feed.Current.render();
                });
            });
          }

      });
      
    }
  });
  // Return the module for AMD compliance.
  return Feed;

});
