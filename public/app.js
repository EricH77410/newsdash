$(function () {
  var socket = io();

  socket.on('news', function(news){

    var html = ''
    var html_news = ''
    var content;

    news.section[0].data.forEach(function(s){
      html +='<li>'
      html += createHtml.getTitle(s.title)
      html += createHtml.getImg(s.img)
      html += createHtml.getContent(s.content)
      html +='</li>';
    })

    news.section[1].data.forEach(function(n){
      html_news +='<li>'
      html_news += createHtml.getTitle(n.title)
      html_news += createHtml.getImg(n.img)
      html_news += createHtml.getContent(n.content)
      html_news +='</li>';
    })

    $('#annonces').html(html);
    $('#news-af').html(html_news);
  })

  socket.on('movies', function(movies){
    var html = ''
    var content=''
    movies.section[0].data.forEach(function(m){
      html += '<li>'
      content += createHtml.getImg(m.img)
      content += createHtml.getTitle(m.title)
      html += createHtml.getLink(m.full, content)
      html +='</li>'
      content=''
    })

    $('#movies').html(html);
  })

  var createHtml = {
    getImg: function(url) {
      return '<img src="'+url+'" class="img" alt="IMG"/>'
    },
    getContent: function(content){
      return '<p class="content">'+content+'</p>'
    },
    getTitle: function(title){
      return '<h3 class="title">'+title+'</h3>'
    },
    getLink: function(link, content){
      return '<a href="'+link+'">'+content+'</a>'
    }
  }

});
