const express = require('express');
const app = express();
const cors = require('cors')
const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
const puppeteer = require('puppeteer');


app.use(cors({
      allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
      exposedHeaders: ["authorization"], // you can change the headers
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false
    })
  );


  app.post('/search',async function(req,res){
    try{
   console.log(req.body)
   const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1860, height: 1400});
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36')

    // Navigate the page to a URL
    await page.goto('https://www.google.com/imghp?gl=us&hl=en');

    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    // debug and print what we see now in raw html
     //console.log(await page.content());

    await page.type('textarea[name="q"]', req.body.keyword);
    await page.click('button[type="submit"]');

    await page.waitForNavigation();
    console.log('New page URL:', page.url());

    // Collect all images with certain class
    const images = await page.$$('.czzyk.XOEbc');
    console.log(images)
    // Simulate click on the first image
    let googleImgArr=[]
    for (i=0;i<10;i++){
    const click =await images[i].click();
    //await page.evaluate((images[0]) => document.querySelector(images[0]).click(), selector); 

    console.log("click",click)
    // const re=await page.waitForFunction("document.querySelector('#Sva75c') && document.querySelector('#Sva75c').style.display=='block'");
    // console.log(re)

    // Wait for the preview div to load, identified with id: "islsp"
    const resp =await page.waitForSelector('#Sva75c',{visible:true});
    console.log(resp)
    const ress=await page.waitForSelector('.sFlh5c.pT0Scc.iPVvYb');
    console.log(ress)

    // Get the img src from img sFlh5c pT0Scc iPVvYb inside this div
    let imgSrc = await page.evaluate(() => {
        return document.querySelector('.sFlh5c.pT0Scc.iPVvYb').src;
    });
    
    console.log(imgSrc);
    googleImgArr.push(imgSrc)
    console.log(googleImgArr)
}
console.log("final array",googleImgArr)

  await browser.close();
  const browserBing = await puppeteer.launch();
  const pageBing = await browserBing.newPage();
  await pageBing.setViewport({width: 1860, height: 1400});
  await pageBing.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36')

    // Navigate the page to a URL
    await pageBing.goto('https://www.bing.com/images/feed');

    // Set screen size
    await pageBing.setViewport({width: 1080, height: 1024});

    // debug and print what we see now in raw html
     //console.log(await page.content());

    await pageBing.type('input[name="q"]', req.body.keyword);
    await pageBing.click('input[type="submit"]');

    await pageBing.waitForNavigation();
    console.log('New page URL:', pageBing.url());

    const imgSrcBing = await pageBing.evaluate(() => {
       // return document.querySelector('.cimg.mimg').src;
        const images = Array.from(document.querySelectorAll('.mimg'));
        return images.slice(0, 10).map(img => img.src);
    });

    console.log(imgSrcBing);

  await browserBing.close();
  res.status(200).json({
    googleimages: googleImgArr,
    bingimages:imgSrcBing
})
    }
    catch(e){
      console.log(e)
      res.status(500).json({
        message:"error"
      })
    }

})
  app.listen(8000, function () {

    console.log("listening on port 8000");
});