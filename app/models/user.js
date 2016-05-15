var $ = require('jquery-browserify');
var _ = require('underscore');
var url = require('url');

var Backbone = require('backbone');
var Repos = require('../collections/repos');
var Orgs = require('../collections/orgs');
var auth = require('../config');
var cookie = require('../cookie');
var templates = require('../../dist/templates');
var util = require('../util');

module.exports = Backbone.Model.extend({
  defaults: {
    login: '',
    id: 0,
    type: 'User', // User or Organization
    avatar_url: ''
  },

  initialize: function(attributes, options) {
    this.repos = new Repos([], { user: this });
    this.orgs = new Orgs([], { user: this });

    // TODO remove this hardcoded assumption
    this.api = util.getApiFlavor();
  },

  authenticate: function(options) {
    if (cookie.get('oauth-token')) {
      if (_.isFunction(options.success)) options.success();
    } else {
      var parsed = url.parse(window.location.href, true);
      var code = parsed.query && parsed.query.code;
      if (code) {
        var ajax = $.ajax(auth.url + '/authenticate/' + code, {
          success: function(data) {
            cookie.set('oauth-token', data.token);
            var newHref = url.format({
              protocol: parsed.protocol,
              slashes: parsed.slashes,
              host: parsed.host,
              pathname: parsed.pathname,
              hash: parsed.hash
            });
            window.location.href = newHref;
            if (_.isFunction(options.success)) options.success();
          }
        });
      } else {
        if (_.isFunction(options.error)) options.error();
      }
    }
  },

  parse: function (resp) {
    if (this.api === 'gitlab') {
      return _.extend(resp, {
        login: resp.username
      });
    } else {
      return resp;
    }
  },

  url: function() {
    var id = cookie.get('id');
    var token = cookie.get('oauth-token');
    if (this.api === 'gitlab') {
      return auth.api + '/user?access_token=' + token;
    } else {
      // Return '/user' if authenticated but no user id cookie has been set yet
      // or if this model's id matches authenticated user id
      return auth.api + ((token && _.isUndefined(id)) || (id && this.get('id') === id) ?
        '/user' : '/users/' + this.get('login'));
    }
  }
});
