// app.js
(function($, global) {
  // Markdown Editor
  var editor = new Editor();

  // Elements
  var $saveBtn = $('#save');
  var $statusOut = $('#status');
  var $markdown = $('#markdown');
  var $title = $('#title');

  // Check the saved content
  nano.hgetall('md-example')
    .then(function(data) {
      $title.val(data.title);
      $markdown.val(data.content);

      editor.render($markdown.get(0));
    })
    .fail(function() {
      editor.render($markdown.get(0));
    });
})(jQuery, window);

function noop() { return false; }