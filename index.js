const express = require("express");
const app = express();
const readline = require("readline");
const PORT = process.env.PORT || 5000;
const puppeteer = require("puppeteer");
const fs = require("fs");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// const prompt = require('pr');
let pathsave = process.argv[2];
console.log(pathsave, 123);

let pagenum = process.argv[3];
console.log(pagenum, pathsave, "Custome");
MainRun(pagenum, pathsave)
  .then((item) => {
    console.log("Done");
  })
  .catch((e) => {
    console.log(e, "Result Call ");
  });
function writeFile(Path, content) {
  fs.writeFile(Path, content, (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });
}

async function MainRun(PageNumBer, PathSave) {
  let data = await GetHome(PageNumBer);
  let result = [];
  let arrFetch = data.slice(0, PageNumBer);
  for (let item of arrFetch) {
    let slug = item.substring(item.lastIndexOf("/") + 1);
    let detail = await GetDetailPlayList(slug);
    result.push(detail);
  }
  console.log("Your Data dowloaded successfully");
  writeFile(PathSave, JSON.stringify(result));
  // return result;
  console.log("done");
  console.log("Closing the interface and app");
  rl.close();
}

async function GetHome(PageNum) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto("https://lofigirl.com/blogs/releases");
    let link = await page.evaluate(() => {
      const PlayListItemLink = document.querySelectorAll(
        ".Cv_release_mini_wrap_inner a"
      );
      let Links = Object.values(PlayListItemLink).map((item, idx) => {
        return item.getAttribute("href").toString();
      });
      return Links;
    });
    // console.log(link);
    await browser.close();
    return link.slice(0, PageNum);
  } catch (e) {
    console.log(
      "Opps it crashed , may be your link are not working right now, \n try later",
      e
    );
  }
}

async function GetDetailPlayList(Slug) {
  const browser = await puppeteer.launch({ headless: true });
  // scraping logic comes here…
  const page = await browser.newPage();

  await page.goto(
    `https://lofigirl.com/blogs/releases/${Slug ? Slug : "momentary"}`
  );
  let tag = await page.$$("audio");
  // console.log(tag," ")
  // return res.json(tag)
  let quotes = await page.evaluate(() => {
    let songlink = document.querySelectorAll(".js-player source");
    let headingPlaylist = document.querySelector(
      ".cv_custom_release_album_main_heading h2"
    );
    let quotesElement = document.body.querySelectorAll(".plyr__controls");
    // quotesElement.forEach(item=>{
    //     const title=item.querySelector("h4")
    //     const artist=item.querySelector("#artistLabel")
    //     console.log(title,artist)
    // })
    let arr = Object.values(quotesElement).map((item, idx) => {
      // console.log(item)
      const title = item.querySelector("h4");
      const artist = item.querySelector(
        ".cv_custom_custom_content_description p"
      );
      console.log(title, artist);
      return {
        title: title.innerHTML,
        artist: artist.innerHTML,
        link: songlink[idx].getAttribute("src"),
      };
    });
    return {
      name: headingPlaylist.innerHTML,
      songs: arr,
    };
  });
  await browser.close();
  return quotes;
}

async function main() {
  /* using 20 to make the progress bar length 20 charactes, multiplying by 5 below to arrive to 100 */

  for (let i = 0; i <= 20; i++) {
    const dots = ".".repeat(i);
    const left = 20 - i;
    const empty = " ".repeat(left);
    process.stdout.write(`\r[${dots}${empty}]`);
    await wait(80);
    /* need to use  `process.stdout.write` becuase console.log print a newline character */
    /* \r clear the current line and then print the other characters making it looks like it refresh*/
  }
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// app.get("/page/:page", async (req, res) => {
//   let page = req.params.page ? req.params.page : 1;
//   console.log(page);
//   let data = await GetHome(page);
//   let result = [];
//   //   data.slice(0,page).forEach(async (item,idx)=>{
//   //     let slug=item.substring(item.lastIndexOf("/")+1)
//   //     let detail = await GetDetailPlayList(slug)
//   //     console.log(detail)
//   //     result.push(detail)
//   //   })
//   let arrFetch = data.slice(0, page);
//   for (let item of arrFetch) {
//     let slug = item.substring(item.lastIndexOf("/") + 1);
//     let detail = await GetDetailPlayList(slug);
//     console.log(detail);
//     result.push(detail);
//   }
//   res.json(result);
//   console.log("done");
// });

// app.get("/detail/:name", (req, res) => {});

// app.use("/", async (req, res) => {
//   res.json("Done");
// });

// app.listen(PORT, () => {
//   console.log(`Main Server is running at ${PORT}`);
// });
