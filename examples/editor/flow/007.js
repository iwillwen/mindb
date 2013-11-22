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

  // Save
  $saveBtn.on('click', function() {
    var md = editor.codemirror.getValue();
    var title = $title.val();

    nano.hmset('md-example', {
      title: title,
      content: md
    })
      .then(function() {
        $statusOut.text('Saved 已保存，请尝试刷新页面。');
      })
      .fail(function(err) {
        $statusOut.text('出错！' + err.message);
      });
  });


})(jQuery, window);

function noop() { return false; }

// open http://localhost:8080