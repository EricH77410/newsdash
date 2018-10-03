const puppeteer = require('puppeteer');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const siteData = {
  name: 'Audiofanzine',
  section: [
    {
      name: 'Petites annonce',
      url: 'https://fr.audiofanzine.com/petites-annonces/acheter/',
      data: []
    },
    {
      name: 'News',
      url: 'https://fr.audiofanzine.com/',
      data: []
    }
  ]
}

// Recup New Audiofanzine
async function getNews() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(siteData.section[1].url);
  //await page.screenshot({path: 'example.png'});

  const allNews = await page.evaluate(
    () => Array.from(document.querySelectorAll('div.index-news'))
          .map( news => ({
            title: news.querySelector('.index-news-title h3').innerText.trim(),
            img: news.querySelector('.index-news-image img').dataset['original'],
            content: news.querySelector('.index-news-header').innerText.trim(),
            full: news.closest('a').href
          }))
  )

  siteData.section[1].data = allNews

  await browser.close();
  //return allNews
};

// Recup PA Audiofanzine
async function getAnnonces() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(siteData.section[0].url);
  //await page.screenshot({path: 'example.png'});
  const titles = await page.evaluate(
    () => Array.from(document.querySelectorAll('h2 span.playlist-row-title'))
      .map(title => title.innerText.trim())
  )

  const annonces = await page.evaluate(
    () => Array.from(document.querySelectorAll('.playlist li.clearfix'))
          .map( annonce => ({
            title: annonce.querySelector('span.playlist-row-title').innerText.trim(),
            img: annonce.querySelector('.playlist-row-thumbnail img').dataset['original'],
            price: annonce.querySelector('.playlist-price').innerText.trim(),
            full: annonce.querySelector('.playlist-row-content a').href,
            content: annonce.querySelector('p.playlist-row-summary').innerText.trim()
          }))
  )

   siteData.section[0].data = annonces

  await browser.close();
  //return annonces
};


// console.log(siteData);

function updateAll() {
  setInterval(function(){
    console.log('update...');
    getNews();
    getAnnonces();
    io.emit('news', siteData)
  }, 50000 );
}

updateAll()

io.on('connection', (socket) => {
  console.log('User connected..');
  socket.on('chat message', (s) => {
    console.log('message: ',s)
    io.emit('chat message', s)
  })
})

getNews()
getAnnonces()

app.get('/', (req, res) => {
    io.emit('news', siteData)
    res.sendFile(__dirname + '/public/index.html');
});


http.listen(8080, (err) => {
  if (err) {
    console.log('Erreur',err);
    return
  }
  console.log('Server running ...')
})
