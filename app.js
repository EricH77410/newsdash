const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = 3100;

const SLOW = 1200000;
const QUICK = 500000

app.use(cors())
app.use(express.static('public'))

const af = {
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

const directDl = {
  name: 'Direct Download',
  section: [
    {
      name: 'Nouveautés',
      url: 'https://ww1.extreme-d0wn.com/home.html',
      data: []
    },
    {
      name: 'Exclu',
      url: 'https://ww1.extreme-d0wn.com/home.html',
      data: []
    }
  ]
}

// Recup New Audiofanzine
async function getNews() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(af.section[1].url);
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

  af.section[1].data = allNews

  await browser.close();
  //return allNews
};

// Recup PA Audiofanzine
async function getAnnonces() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(af.section[0].url);
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

   af.section[0].data = annonces

  await browser.close();
  //return annonces
};

async function getDL_news() {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(directDl.section[0].url);

  const movies = await page.evaluate(
    () => Array.from(document.querySelectorAll('#Films a.top-last'))
          .map( film => ({
            title: film.querySelector('.top-title').innerText.trim(),
            img: film.querySelector('img').src,
            full: film.href
          }))
  )

    directDl.section[0].data = movies
    await browser.close();

};


// console.log(af);

function updateAllQuick() {
  setInterval(function(){
    console.log('update...');
    getNews();
    getAnnonces();
    //io.emit('news', af)
  }, QUICK );
}

function updateSlow(){
  setInterval(function(){
    console.log('updateSlow')
    getDL_news();
    //io.emit('movies', directDl)
  }, SLOW)
}

updateAllQuick()
updateSlow()

// io.on('connection', (socket) => {
//   console.log('User connected..');
//   io.emit('news', af)
//   io.emit('movies', directDl)
// })

getNews()
getAnnonces()
getDL_news()

app.get('/', (req, res) => {
    //io.emit('news', af)
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/afnews', (req, res)=>{
  res.send(af.section[1].data)
})

app.get('/afannonces', (req, res) => {
  res.send(af.section[0].data)
})

app.get('/dlnews', (req, res)=>{
  res.send(directDl.section[0].data);
})

app.get('/dlexclu', (req, res)=>{
  res.send(directDl.section[1].data);
})


http.listen(PORT, (err) => {
  if (err) {
    console.log('Erreur',err);
    return
  }
  console.log('Server running ...')
})
