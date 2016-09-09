$('#view3d').contents().find("#brainbrowser").click(function(event) {
  $("#pick-x").html($('#view3d').contents().find('#pick-x').text());
  $("#pick-y").html($('#view3d').contents().find('#pick-y').text());
  $("#pick-z").html($('#view3d').contents().find('#pick-z').text());
  $("#pick-index").html($('#view3d').contents().find('#pick-index').text());
  $("#pick-value").html($('#view3d').contents().find('#pick-value').text());
});
