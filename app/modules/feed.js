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
  Feed.Sections = [];
  Feed.SectionViews = [];
  // Default model.
  Feed.Model = Backbone.Model.extend();
  Feed.Section = Backbone.View.extend({
    className: 'post-sec',
    template: 'app/templates/layouts/section',
    events: {
      'click .remove-section': 'removeSection',
      'click .add-title': 'addTitle',
      'click .add-para': 'addPara',
      'click .add-vid': 'addVideo',
      'focus .title, .para': 'hideBG',
      'click .move-title': 'keepHidden',
      'blur .title,.para': 'showBG',
      'click .remove-section-type': 'removeSectionType'
    },
    removeSection: function(){
      this.model.collection.remove(this.model);
      return false;
    },
    removeSectionType: function(){
      Feed.SectionViews[this.options.index].remove();
      this.render();
      return false;
    },
    showBG: function(e){
      var self = this;
      Feed.showTO = window.setTimeout(function(){
        self.$('.add-bg').show();
        self.$('.remove-section').show();
        self.$('.char-amount').hide();
        self.$('.edit-button').hide();
      },200);
    },
    vanish: function(){
      this.$('.button-list').hide();
    },
    keepHidden: function(){
      return false;
    },
    hideBG: function(e){
      this.$('.add-bg').hide();
      this.$('.remove-section').hide();
      this.$('.char-amount').show();
    },
    addTitle: function(){
      var view = new Feed.Title({model:this.model, index: this.options.index});
      this.insertView(view);
      view.render();
      this.vanish();
      return false;
    },
    addPara: function(){
      var view = new Feed.Para({model:this.model, index: this.options.index});
      this.insertView(view);
      view.render();
      this.vanish();
      return false;
    },
    addVideo: function(){
      var view = new Feed.Video({model:this.model, index: this.options.index});
      this.insertView(view);
      view.render();
      this.vanish();
      return false;
    }
  });
  // Default collection.
  Feed.Collection = Backbone.Collection.extend();

  Feed.Para = Backbone.View.extend({
    tagName: 'div',
    className: 'para-section',
    template: 'app/templates/layouts/para',
    initialize: function(){
      this.max = 1400;
      this.placeHolder = 'Paragraph';
      Feed.SectionViews[this.options.index] = this;
    },
    events: {
      'keydown .para': 'checkChar',
      'click .para': 'cancel',
      'click .edit-button': 'makeEdit',
      'blur .para': 'save',
      'click .cancel-link': 'cancel',
      'click .submit-link': 'submitLink'
    },
    checkChar: function(e){
      if ($(e.currentTarget).text().trim() === this.placeHolder) {
        $(e.currentTarget).text('');
      }
      this.contentEditable = $(e.currentTarget);
      if(e.which != 8 && this.contentEditable.text().length >= this.max)
        {
            e.preventDefault();
        }
    },
    makeEdit: function(e){
      var cmd = $(e.currentTarget).attr('data-class');
      if (cmd === 'CreateLink') {
        this.savedSel = saveSelection();
        var spn = '<span class="selected">' + this.savedSel + '</span>';
        this.$('.para').html(this.$('.para').html().replace(this.savedSel, spn));
        if (this.$('.selected').parent().prop("tagName") === 'A'){
          var cnt = this.$('.selected').parent().contents();
          this.$('.selected').parent().replaceWith(cnt);
          var cn = this.$(".selected").contents();
          this.$(".selected").replaceWith(cn);
        } else {
          this.$('.input-link').show();
          this.$('.remove-section-type').hide();
          this.$('.edit-button').hide();
        }
      } else {
        document.execCommand (cmd, false, null);
      }
      window.clearTimeout(Feed.showTO);
      e.stopPropagation();
      e.preventDefault();
    },
    save: function(e){
      if ($(e.currentTarget).text().trim().length === 0) {
        $(e.currentTarget).text(this.placeHolder);
      }
    },
    submitLink: function(){
      this.$('.selected').wrap('<a href='+this.$('.link-input').val().trim()+' target="_blank"></a>');
      this.cancel();
      return false;
    },
    cancel: function(e){
      this.$('.input-link').hide();
      this.$('.remove-section-type').show();
      this.$('.edit-button').show();
      var cnt = this.$(".selected").contents();
      this.$(".selected").replaceWith(cnt);
      if (e) this.checkChar(e);
      return false;
    },
    afterRender: function(){
      this.$('.edit-button').hide();
    }
  });

  Feed.Title = Backbone.View.extend({
    tagName: 'ul',
    className: 'title-list',
    template: 'app/templates/layouts/titles',
    initialize: function(){
      this.max = 50;
      this.placeHolder = 'Title. Drag and align.';
      Feed.SectionViews[this.options.index] = this;
    },
    events: {
      'keydown .title': 'checkChar',
      'click .title': 'cancel',
      'blur .title': 'save',
      'click .edit-button': 'editor',
      'click .cancel-link': 'cancel',
      'click .submit-link': 'submitLink'
    },
    checkChar: function(e){
      if ($(e.currentTarget).text().trim() === this.placeHolder) {
        $(e.currentTarget).text('');
      }
      this.contentEditable = $(e.currentTarget);
      this.$('.char-amount').text(this.max - this.contentEditable.text().length +' ' + 'characters remaining. Press "Enter" to post.');
      if(e.which != 8 && this.contentEditable.text().length >= this.max)
        {
            e.preventDefault();
        }
    },
    cancel: function(e){
      this.$('.input-link').hide();
      this.$('.remove-section-type').show();
      this.$('.edit-button').show();
      if (e) this.checkChar(e);
      return false;
    },
    submitLink: function(){
      this.$('.title').wrap('<a class="title-link" href='+this.$('.link-input').val().trim()+' target="_blank"></a>');
      this.cancel();
      return false;
    },
    editor: function(e){
      var cls = $(e.currentTarget).attr('data-class');
      if (cls === 'makeLink'){
        if (this.$('.title').parent().hasClass('title-link')){
          var cnt = this.$(".title-link").contents();
          this.$(".title-link").replaceWith(cnt);
        } else {
          this.$('.input-link').show();
          this.$('.remove-section-type').hide();
          this.$('.edit-button').hide();
        }
      } else {
         this.$('.title').attr('class', 'title').addClass(cls);
      }
      window.clearTimeout(Feed.showTO);
      e.stopPropagation();
      e.preventDefault();
    },
    afterRender: function(){
      var self = this;
      this.$('.edit-button').hide();
      $(this.el).sortable({
        handle: '.move-title',
        start: function(){
          self.$('.title-filler').addClass('borderize');
        },
        stop: function(){
          self.$('.title-filler').removeClass('borderize');
        }
      });
    },
    save: function(e){
      if ($(e.currentTarget).text().trim().length === 0) {
        $(e.currentTarget).text(this.placeHolder);
      }
    }
  });


  Feed.Video = Backbone.View.extend({
    className: 'video-container',
    template: 'app/templates/layouts/video',
    initialize: function(){
      this.model.on('change', this.render,this);
      Feed.SectionViews[this.options.index] = this;
    },
    serialize: function(){
      var m = this.model.toJSON();
      var video = m.video;
      if (!video) return m;
      if (video !== "" && video.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)){
          youtubeID = video.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)[1];
          m.youtube = youtubeID;
      } else if (video !== "" && video.match(/vimeo.com\/(\d+)($|\/)/)) {
          vimeoId = video.match(/vimeo.com\/(\d+)($|\/)/)[1];
          m.vimeo = vimeoId;
      }
      return m;
    },
    events: {
      'click .submit-video': 'add',
      'click .change-vid': 'changeVid'
    },
    changeVid: function(){
      this.model.set('video', null);
      return false;
    },
    add: function(){
      var video = this.$('.video-input').val().trim();
      if (video !== "" && video.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)){
          this.model.set('video', video);
      } else if (video !== "" && video.match(/vimeo.com\/(\d+)($|\/)/)) {
          this.model.set('video', video);
      } else {
        this.$('.video-input').val('');
        return false;
      }
    },
    afterRender: function(){
      resizeVideo();
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
      var model = new Feed.Model({
        para:null,//2
        image:null, //1, 3
        title:null,//1
        link:null, //1
        video:null, //4
        type: null, // 1 = title, 2 = paragraph, 3 = image, 4 = video
        textAlign: null, //1
        vertIndex: null, //1
        color: null, //1
        titleFont: null, //1
        paraFont: null //2
      });
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
        $('html,body').scrollTop($(document).height());
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
      this.collection.each(function(model,index){
        Feed.Sections[index] = new Feed.Section({model:model, index:index});
        self.insertView(Feed.Sections[index]);
      });
    },
    checkWindow: function(){
      var win = ($(window).width()/screen.availWidth) * 100;
      $('body').css('font-size', win + '%');
      $('.para,.title').blur();
      resizeVideo();
      if ($(window).width() < 768){
        $('.button-title').hide();
      } else {
        $('.button-title').show();
      }
    },
    afterRender: function(){
      this.checkWindow();
      var self = this;
      $(window).on('resize', function(){
        clearTimeout(id);
        id = setTimeout(function(){
            self.checkWindow();
        }, 500);
      });
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


  function saveSelection() {
      if (window.getSelection) {
          sel = window.getSelection();
          if (sel.getRangeAt && sel.rangeCount) {
              var ranges = [];
              for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                  ranges.push(sel.getRangeAt(i));
              }
              return ranges;
          }
      } else if (document.selection && document.selection.createRange) {
          return document.selection.createRange();
      }
      return null;
  }

  function restoreSelection(savedSel) {
      if (savedSel) {
          if (window.getSelection) {
              sel = window.getSelection();
              sel.removeAllRanges();
              for (var i = 0, len = savedSel.length; i < len; ++i) {
                  sel.addRange(savedSel[i]);
              }
          } else if (document.selection && savedSel.select) {
              savedSel.select();
          }
      }
  }

  function resizeVideo(){
    var $allVideos = $(".video-holder").find('iframe'),
    $fluidEl = $(".video-container");
    $allVideos.each(function() {

    $(this).removeAttr('height').removeAttr('width');
    var newWidth = $fluidEl.width();
    var aspectRatio = $fluidEl.height() / $fluidEl.width();
    // Resize all videos according to their own aspect ratio
    if (aspectRatio > 1 ){
      $(".video-container").addClass('full-width');
      $allVideos.each(function() {
      var $el = $(this);
      $el
        .width(newWidth)
        .height(newWidth * aspectRatio/2);

      });
    } else {
      $(".video-container").removeClass('full-width');
      $allVideos.each(function() {
      var $el = $(this);
      $el
        .width(newWidth)
        .height(newWidth * aspectRatio/2);

      });
    }
    
  });
  }
  // Return the module for AMD compliance.
  return Feed;

});
