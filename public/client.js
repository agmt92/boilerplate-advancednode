$(document).ready(function () {
  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();
    /*global io*/
    let socket = io();
    socket.on('user count', (data) => {
      console.log(data);
    });
    socket.on('user', data => {
      $('#num-users').text(data.currentUsers + ' users online');
      let message =
        data.username +
        (data.connected ? ' has joined the chat.' : ' has left the chat.');
      $('#messages').append($('<li>').html('<b>' + message + '</b>'));
    });
    
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
