$(document)
    .ready(function() {

      // Menu sidebar
      $('#site-menu')
        .sidebar({
          onVisible: function() {
            $('.site-menu.trigger').html('<i class="ui remove icon"></i>');
          },
          onHide: function() {
            $('.site-menu.trigger').html('<i class="ui content icon"></i>');
          }
        })
        .sidebar('attach events', '.site-menu.trigger', 'toggle')
      ;

      // Submit on [enter]
      $('button').keypress( function(event) {
        if (event.which == 13) {
          event.preventDefault();
          $(this).parent('form').submit();
        }
      });

      // Video embeds
      $('.ui.embed').embed('show');
      

  })
;
