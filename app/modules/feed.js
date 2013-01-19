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
      Feed.showTO = window.setTimeout(function(){
        $('.add-bg').show();
        $('.remove-section').show();
        $('.char-amount').hide();
        $('.edit-button').hide();
      },200);
    },
    vanish: function(){
      $('.button-list').hide();
    },
    keepHidden: function(){
      return false;
    },
    hideBG: function(e){
      $('.add-bg').hide();
      $('.remove-section').hide();
      $('.char-amount').show();
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
        if ($('.selected').parent().prop("tagName") === 'A'){
          var cnt = $('.selected').parent().contents();
          $('.selected').parent().replaceWith(cnt);
          var cn = $(".selected").contents();
          $(".selected").replaceWith(cn);
        } else {
          $('.input-link').show();
          $('.remove-section-type').hide();
          $('.edit-button').hide();
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
      $('.selected').wrap('<a href='+$('.link-input').val().trim()+' target="_blank"></a>');
      this.cancel();
      return false;
    },
    cancel: function(e){
      $('.input-link').hide();
      $('.remove-section-type').show();
      $('.edit-button').show();
      var cnt = $(".selected").contents();
      $(".selected").replaceWith(cnt);
      if (e) this.checkChar(e);
      return false;
    },
    afterRender: function(){
      $('.edit-button').hide();
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
      $('.char-amount').text(this.max - this.contentEditable.text().length +' ' + 'characters remaining. Press "Enter" to post.');
      if(e.which != 8 && this.contentEditable.text().length >= this.max)
        {
            e.preventDefault();
        }
    },
    cancel: function(e){
      $('.input-link').hide();
      $('.remove-section-type').show();
      $('.edit-button').show();
      if (e) this.checkChar(e);
      return false;
    },
    submitLink: function(){
      $('.title').wrap('<a class="title-link" href='+$('.link-input').val().trim()+' target="_blank"></a>');
      this.cancel();
      return false;
    },
    editor: function(e){
      var cls = $(e.currentTarget).attr('data-class');
      if (cls === 'makeLink'){
        if (this.$('.title').parent().hasClass('title-link')){
          var cnt = $(".title-link").contents();
          $(".title-link").replaceWith(cnt);
        } else {
          $('.input-link').show();
          $('.remove-section-type').hide();
          $('.edit-button').hide();
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
      $('.edit-button').hide();
      $(this.el).sortable({
        handle: '.move-title',
        start: function(){
          $('.title-filler').addClass('borderize');
        },
        stop: function(){
          $('.title-filler').removeClass('borderize');
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
    serialize: function(){
      var m = this.model.toJSON();
      return m;
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
        para:false,//2
        image:false, //1, 3
        title:false,//1
        link:false, //1
        video:false, //4
        type: false, // 1 = title, 2 = paragraph, 3 = image, 4 = video
        textAlign: false, //1
        vertIndex: false, //1
        color: false, //1
        titleFont: false, //1
        paraFont: false //2
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
  // Return the module for AMD compliance.
  return Feed;

});
