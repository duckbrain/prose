var _ = require('underscore');
var Backbone = require('backbone');
var templates = require('../../templates');

module.exports = Backbone.View.extend({
  template: templates.loading,

  queue: 0,

  start: function(message) {
    this.queue++;

    if (message) {
      this.$el.find('.message').html(message);
    }

    this.$el.show();
  },

  stop: function() {
    this.queue = 0;
    this.$el.fadeOut(150);
  },

  done: function() {
    _.defer((function() {
      this.queue--;
      if (this.queue < 1) this.stop();
    }).bind(this));
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
