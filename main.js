var fs = require('fs');
var webdriver = require('selenium-webdriver');
var program = require('commander');

program.parse(process.argv);

var projects = program.args;

if (projects.length == 0) {
  projects.push('http://snap.berkeley.edu/snapsource/snap.html#present:Username=alliejones&ProjectName=Snake');
} else {
  console.log("Urls: "+projects);
}

function getNextSummary() {
  var driver = new webdriver.Builder()
      .forBrowser('firefox')
      .build();

  var url = projects.pop();
  driver.get(url);

  driver.sleep(5000);

  driver.executeScript(function() {
    /* global world */
    var ide = world.children[0];
    //ide.toggleAppMode();
    var summary;
    ide.saveFileAs = function (html, _, name) {
      summary = { html: html, name: name };
    };
    ide.exportProjectSummary();
    ide.saveFileAs = function (xml, _, name) {
      summary.xml = xml;
    };
    ide.exportProject(ide.projectName, false);
    return summary;
  }).then(function(summary) {
    if (summary.xml === undefined) {
      console.log("Error fetching "+url);
      driver.quit();
      if (projects.length) getNextSummary();
    } else {
      fs.writeFile("./"+summary.name+".html", summary.html, function() {
        fs.writeFile("./"+summary.name+".xml", summary.xml, function() {
          driver.quit();
          if (projects.length) getNextSummary();
        });
      });
    }
  });
}

getNextSummary();
