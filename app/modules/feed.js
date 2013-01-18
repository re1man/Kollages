define([
  // Application.
  "app",
  "spin",
  'jquery.ui',
  'jquery.fileupload',
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
      'click .remove-section': 'removeSection',
      'click .add-title': 'addTitle',
      'focus .title': 'hideBG',
      'blur .title': 'showBG'
    },
    removeSection: function(){
      this.model.collection.remove(this.model);
      return false;
    },
    showBG: function(e){
      $('.add-bg').show();
      $('.remove-section').show();
      $('.char-amount').hide();
    },
    vanish: function(){
      $('.button-list').hide();
    },
    hideBG: function(e){
      $('.add-bg').hide();
      $('.remove-section').hide();
      $('.char-amount').show();
    },
    addTitle: function(){
      var view = new Feed.Title();
      this.insertView(view);
      view.render();
      this.vanish();
      return false;
    }
  });
  // Default collection.
  Feed.Collection = Backbone.Collection.extend();
  Feed.Title = Backbone.View.extend({
    tagName: 'ul',
    className: 'title-list',
    template: 'app/templates/layouts/titles',
    initialize: function(){
      this.max = 50;
      this.placeHolder = 'Title. Drag and align.';
    },
    events: {
      'keydown .title': 'checkChar',
      'click .title': 'checkChar',
      'click .move-title, .m-btn': 'falsify',
      'blur .title': 'save',
      'click .edit-button': 'editor'
    },
    checkChar: function(e){
      if ($(e.currentTarget).text().trim() === this.placeHolder) {
        $(e.currentTarget).text('');
      }
      this.contentEditable = $(e.currentTarget);
      $('.char-amount').text(this.max - this.contentEditable.text().length +' ' + 'characters remaining. Press "Enter" to post.');
      if(e.which != 8 && this.contentEditable.text().length >= this.max)
        {
            e.preventDefault();
        }
    },
    editor: function(e){
      var cls = $(e.currentTarget).attr('data-class');
      this.$('.title').attr('class', 'title').addClass(cls);
    },
    afterRender: function(){
      $(this.el).sortable({
        handle: '.move-title',
        start: function(){
          $('.add-bg').hide();
          $('.remove-section').hide();
          $('.edit-button').hide();
          $('.title-filler').addClass('borderize');
        },
        stop: function(){
          $('.add-bg').show();
          $('.remove-section').show();
          $('.edit-button').show();
          $('.title-filler').removeClass('borderize');
        }
      });
    },
    falsify: function(){
      return false;
    },
    save: function(e){
      if ($(e.currentTarget).text().trim().length === 0) {
        $(e.currentTarget).text(this.placeHolder);
      }
    }
  });
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
      var model = new Feed.Model({para:false, image:false,title:false, link:false, video:false, inputs: [], textAlign: false, vertIndex: false});
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
    checkWindow: function(){
      var win = ($(window).width()/screen.availWidth) * 100;
      $('body').css('font-size', win + '%');
      if ($(window).width() < 768){
        $('.button-title').hide();
      } else {
        $('.button-title').show();
      }
    },
    afterRender: function(){
      this.checkWindow();
      $(window).on('resize', this.checkWindow);
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
