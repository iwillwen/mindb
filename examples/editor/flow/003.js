// app.js
(function($, global) {
  // Markdown Editor
  var editor = new Editor();

  // Elements
  var $saveBtn = $('#save');
  var $statusOut = $('#status');
  var $markdown = $('#markdown');
  var $title = $('#title');
})(jQuery, window);

function noop() { return false; }