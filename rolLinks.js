var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var fs = require('fs');
var d3 = require('d3');
var json2csv = require('json2csv');

var nightmare = Nightmare({
  dock: true,
  openDevTools: false,
  show: true,
})

var date = new Date().toISOString().slice(0, 19),
    columsHeaders = "id\turl",
    fileName = "data/links"+date+"tsv",
    peopleUrl = "http://www.republicofletters.net/index.php/people/"

fs.writeFileSync(fileName, columsHeaders+"\n");
console.log("FILE CREATED")

nightmare
  .goto(peopleUrl)
  .wait(randomly(2000,750))
  .scrollTo(300, 0)
  .wait("article")
  .inject('js', 'node_modules/jquery/dist/jquery.js')
  .evaluate(function () {
    return $(".portfolio_square_image").html()
  })
  .then(function(html){
    $ = cheerio.load(html);
    $("article").each(function(i,d){
      var element = {id:i,url:$(d).find("a").attr('href')}
      appendLast( fileName, element, columsHeaders.split("\t") );
    })
  })

function appendLast(file, artist, headers){
  json2csv({ data: artist, fields: headers, del: '\t', hasCSVColumnTitle:false, eol:'\n' }, function(err, tsv) {
      if (err) console.log(err);
      fs.appendFileSync(file, tsv);
      console.log('appended to file!')
  });
}

function randomly(max,min) {
  return Math.random() * (max - min) + min;
}
