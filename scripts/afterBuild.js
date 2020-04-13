const cheerio = require('cheerio')
const fs = require('fs');

const args = process.argv.slice(2);
const loopIndefinitely = args[0];
afterBuild(loopIndefinitely);

async function afterBuild(loopIndefinitely) {
  if (loopIndefinitely) {
    while (true) {
      updateIndex();
      await sleep(2000);
    }
  } else {
    updateIndex();
  }
}

function updateIndex() {
  const indexFilePath = 'src/main/webapp/site/dist/index.html';
  const appDir = '/site/dist';

  fs.readFile(indexFilePath, 'utf8', function (err,data) {
    if (err) {
      return;
    }

    const $ = cheerio.load(data);
    $('script[src]').each((i, element) => {
        if ($(element).attr('src').indexOf(appDir) === -1) {
          $(element).attr('src', `${appDir}/${$(element).attr('src')}`);
        }
    });
    fs.writeFile(indexFilePath, $.html(), function (err) {
        if (err) return console.log(err);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
