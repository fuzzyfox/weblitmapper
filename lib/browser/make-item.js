var url = require('url');
var querystring = require('querystring');
var _ = require('underscore');

var prettyDate = require('./pretty-date');
var session = require('./session');
var template = require('./template');
var settings = require('../public-settings');
var weblitmap = require('../weblitmap');

function MakeItem(make) {
  var parsedURL = url.parse(make.url);

  _.extend(this, make);
  this.avatarURL = 'http://www.gravatar.com/avatar/' + this.emailHash +
                   '?' + querystring.stringify({
                     d: 'https://stuff.webmaker.org/avatars/' +
                        'webmaker-avatar-44x44.png'
                   });
  this.profileURL = settings.WEBMAKER_URL + '/u/' + this.username;
  this.updateURL = '/update?' + querystring.stringify({
    url: this.url
  });
  this.createdAtPrettyDate = prettyDate(new Date(this.createdAt));
  this.urlSimplified = parsedURL.hostname +
                       (parsedURL.pathname == '/' ? '' : parsedURL.pathname);
  this.weblitTags = {};
  weblitmap
    .normalizeTags(this.tags, settings.WEBLIT_TAG_PREFIX)
    .forEach(function(tag) {
      this.weblitTags[tag] = true;
    }, this);

  this._createView();
}

MakeItem.prototype = {
  _createView: function() {
    this.$el = $('<div class="make-item col-sm-4"></div>');
    this.$el.on('click', 'button.js-like', this.toggleLike.bind(this));
    this.el = this.$el[0];
    this.render();
  },
  render: function() {
    this.$el.html(template.render('./template/browser/make-item.html', {
      make: this,
      weblitmap: weblitmap,
      userId: session.userId
    }));
  },
  toggleLike: function() {
    if (this.doesUserLike()) {
      alert("TODO: unlike and re-render");
    } else {
      alert("TODO: like and re-render");
    }
  },
  hasWeblitTag: function(tag) {
    return !!this.weblitTags[settings.WEBLIT_TAG_PREFIX + tag];
  },
  doesUserLike: function() {
    return _.any(this.likes, function(like) {
      return like.userId == session.userId;
    });
  }
};

module.exports = MakeItem;