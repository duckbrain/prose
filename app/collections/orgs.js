var _ = require('underscore');
var Backbone = require('backbone');
var Org = require('../models/org');
var config = require('../config');
var auth = require('../config');
var util = require('../util');

module.exports = Backbone.Collection.extend({
  model: Org,

  initialize: function(models, options) {
    options = _.clone(options) || {};
    this.user = options.user;
    this.api = util.getApiFlavor();
    _.bindAll(this);
  },

  parse: function (res) {
    if (this.api === 'gitlab') {
      res.forEach(function (org) {
        org.login = org.path;
      });
    }
    return res;
  },

  url: function() {
    var token = cookie.get('oauth-token');
    var scope = cookie.get('scope');

    if (this.api === 'gitlab') {
      return auth.api + '/groups?access_token=' + token;
    } // else GitHub

    // If not authenticated, show public repos for user in path.
    // https://developer.github.com/v3/orgs/#list-user-organizations
    if (!token || scope !== 'repo') {
      return auth.api + '/groups';
    }

    // Authenticated users see all repos they have access to.
    // https://developer.github.com/v3/orgs/#list-your-organizations
    else {
      return config.api + '/user/orgs';
    }
  }
});
