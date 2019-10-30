const cheerio = require('cheerio')
const fs = require('fs');

const args = process.argv.slice(2);
const appType = args[0];
const loopIndefinitely = args[1];
afterBuild(appType, loopIndefinitely);

async function afterBuild(appType, loopIndefinitely) {
  if (loopIndefinitely) {
    while (true) {
      updateIndex(appType);
      await sleep(5000);
    }
  } else {
    updateIndex(appType);
  }
}

function updateIndex(appType) {
  let indexFilePath = '';
  let appDir = '';
  if (appType === 'vle') {
    indexFilePath = 'src/main/webapp/wise5/vle/dist/index.html';
    appDir = `/wise5/vle/dist`;
  } else if (appType === 'cm') {
    indexFilePath = 'src/main/webapp/wise5/classroomMonitor/dist/index.html';
    appDir = `/wise5/classroomMonitor/dist`;
  } else if (appType === 'at') {
    indexFilePath = 'src/main/webapp/wise5/authoringTool/dist/index.html';
    appDir = `/wise5/authoringTool/dist`;
  } else if (appType === 'site') {
    indexFilePath = 'src/main/webapp/site/dist/index.html';
    appDir = `/site/dist`;
  }

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
