$(function () {
  var socket = io();

  socket.on('news', function(news){

    var html = ''
    var html_news = ''

    news.section[0].data.forEach(function(s){
      html +='<li>'+s.title+'</li>';
    })

    news.section[1].data.forEach(function(n){
      html_news +='<li>'+n.title+'</li>';
    })

    $('#annonces').html(html);
    $('#news-af').html(html_news);
  })

  socket.on('movies', function(movies){
    var html = ''

    movies.section[0].data.forEach(function(m){
      html += '<li>'+m.title+'</li>'
    })

    $('#movies').html(html);
  })

});
