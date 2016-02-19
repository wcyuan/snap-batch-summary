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

function getJsonUrlParams(url, hashBased) {
  var query;
  var pos = url.indexOf(":", 5);
  if(pos==-1) return [];
  query = url.substr(pos+1);
  var result = {};
  query.split("&").forEach(function(part) {
    if(!part) return;
    part = part.split("+").join(" "); // replace every + with space, regexp-free version
    var eq = part.indexOf("=");
    var key = eq>-1 ? part.substr(0,eq) : part;
    var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
    var from = key.indexOf("[");
    if(from==-1) result[decodeURIComponent(key)] = val;
    else {
      var to = key.indexOf("]");
      var index = decodeURIComponent(key.substring(from+1,to));
      key = decodeURIComponent(key.substring(0,from));
      if(!result[key]) result[key] = [];
      if(!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}

function getNextSummary() {
  var driver = new webdriver.Builder()
      .forBrowser('firefox')
      .build();

  var url = projects.pop();
  var params = getJsonUrlParams(url);
  console.log(params);
  console.log("Reading user " + params["Username"] + " project " + params["ProjectName"]);

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
