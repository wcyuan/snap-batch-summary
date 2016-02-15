var fs = require('fs');
var webdriver = require('selenium-webdriver');

var projects = [
    'http://snap.berkeley.edu/snapsource/snap.html#present:Username=alliejones&ProjectName=Snake',
    'http://snap.berkeley.edu/snapsource/snap.html#present:Username=alliejones&ProjectName=Lab%202.5%20What%20Goes%20Up%20Solution',
    'http://snap.berkeley.edu/snapsource/snap.html#present:Username=alliejones&ProjectName=Platformer%20Example'
];

function getNextSummary() {
  var driver = new webdriver.Builder()
      .forBrowser('firefox')
      .build();

  driver.get(projects.pop());

  driver.sleep(5000);

  driver.executeScript(function() {
    /* global world */
    var ide = world.children[0];
    ide.toggleAppMode();
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
    fs.writeFile("./"+summary.name+".html", summary.html, function() {
      fs.writeFile("./"+summary.name+".xml", summary.xml, function() {
        driver.quit();
        if (projects.length) getNextSummary();
      });
    });
  });
}

getNextSummary();
