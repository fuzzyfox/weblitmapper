var _ = require('underscore');

var settings = require('./public-settings');
var weblitmap = require('./weblitmap');

var weblitCategories = _.values(weblitmap.tags);

function mongo(query) {
  var ordering = {createdAt: -1};

  if (query.tags) {
    query.tags = {$all: query.tags.map(function(tag) {
      return settings.WEBLIT_TAG_PREFIX + tag;
    })};
  } else {
    query.tags = {$not: {$size: 0}};
  }
  if (query.sort) {
    if (query.sort == 'likes')
      ordering = {numLikes: -1};
    delete query.sort;
  }
  return {$query: query, $orderby: ordering};
}

function unnamespace(searchTerm) {
  if (searchTerm.indexOf(settings.WEBLIT_TAG_PREFIX) == 0)
    return searchTerm.slice(settings.WEBLIT_TAG_PREFIX.length);
  return searchTerm;
}

function getCategoryPropertyMatch(prop, searchTerm) {
  return _.find(weblitCategories, function(cat) {
    return cat[prop].toLowerCase().indexOf(searchTerm) != -1;
  });
}

module.exports = function parseSearchQuery(query, options) {
  options = options || {};
  var result = {tags: []};
  var sort = query.match(/sort:([A-Za-z]+)/);
  var hashtags = query.match(/#([A-Za-z0-9_\-]+)/g) || [];
  var user = query.match(/user:([A-Za-z0-9_\-]+)/);
  var terms = query.split(' ').filter(function(term) {
    return /^([^#:]+)$/.test(term.trim());
  });

  hashtags.forEach(function(hashtag) {
    var searchTerm = unnamespace(hashtag.slice(1).toLowerCase());
    var cat = getCategoryPropertyMatch('tag', searchTerm);

    if (!cat) cat = getCategoryPropertyMatch('name', searchTerm);
    if (cat) result.tags.push(cat.tag);
  });

  if (sort) result.sort = sort[1].toLowerCase();
  if (user) result.username = user[1];
  if (!result.tags.length) delete result.tags;
  if (terms.length) result.allText = new RegExp(terms.join(' '), "i");

  return options.mongo ? mongo(result) : result;
};

module.exports.mongo = mongo;
