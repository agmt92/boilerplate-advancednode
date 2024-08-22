$(document).ready(function () {
  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();
    /*global io*/
    let socket = io();

    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
