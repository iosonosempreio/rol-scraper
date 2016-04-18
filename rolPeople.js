var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var fs = require('fs');
var d3 = require('d3');
var json2csv = require('json2csv');

var nightmare = Nightmare({
  dock: true,
  openDevTools: false,
  show: false,
})

var date = new Date().toISOString().slice(0, 19);
var columsHeaders = ["id","name", "img", "community", "role", "wg", "institution", "country", "website", "project", "email", "social"]
var columsHeaders = "id\turl\tname\timg\tcommunity\trole\twg\tinstitution\tcountry\twebsite\tproject\temail\tsocial"
var people=[],
    doneInSession=0,
    links = "data/links2016-04-15T14:41:44.tsv"
    fileName = "data/people"+date+".tsv",
    linksObj = []

linksObj = d3.tsv.parse( fs.readFileSync(links, 'utf8').toString() )

fs.writeFileSync(fileName, columsHeaders+"\n");
console.log("FILE CREATED")

var i=0;
scrapePeople(i);
function scrapePeople(num) {
  console.log("link",linksObj[num].url)
  var researcher = {}
  researcher.id = linksObj[num].id;
  researcher.url = linksObj[num].url;
  nightmare
    .goto(linksObj[num].url)
    .wait(".content_inner")
    .inject('js', 'node_modules/jquery/dist/jquery.js')
    .evaluate(function () {
      return $(".content_inner").html()
    })
    .then(function(html){
      $ = cheerio.load(html);
      researcher.name = $(".title_subtitle_holder>h1>span:nth-of-type(1)").text().replace(/\t|\n| /g,"")
      researcher.info = $(".title_subtitle_holder>h1>span:nth-of-type(2)").text().replace(/\t|\n| /g,"")
      researcher.img = $(".portfolio_images>img").attr("src")
      researcher.community = $(".portfolio_single_custom_field:nth-of-type(1) p").text().replace(/\t|\n/g,"")
      researcher.role = $(".portfolio_single_custom_field:nth-of-type(2) p").text().replace(/\t|\n/g,"")
      researcher.wg = $(".portfolio_single_custom_field:nth-of-type(3) p").text().replace(/\t|\n/g,"")
      researcher.institution = $(".portfolio_single_custom_field:nth-of-type(4) p").text().replace(/\t|\n/g,"")
      researcher.country = $(".portfolio_single_custom_field:nth-of-type(5) p").text().replace(/\t|\n/g,"")
      researcher.website = $(".portfolio_single_custom_field:nth-of-type(6) p").text().replace(/\t|\n/g,"")
      researcher.project = $(".portfolio_single_custom_field:nth-of-type(7) p").text().replace(/\t|\n/g,"")
      researcher.email = $(".portfolio_single_custom_field:nth-of-type(8) p").text().replace(/\t|\n/g,"")
      researcher.social = $(".portfolio_single_custom_field:nth-of-type(9)").text()

      console.log(researcher)
      appendLast(fileName, researcher, columsHeaders.split("\t"))
      num++;
      if ( num < linksObj.length ) {
        scrapePeople(num);
      }
    })
}

// nightmare
//   .goto(peopleUrl)
//   .wait(randomly(2000,750))
//   .scrollTo(300, 0)
//   // .wait(randomly(2000,750))
//   .wait("article")
//   .inject('js', 'node_modules/jquery/dist/jquery.js')
//   .evaluate(function () {
//       //take the container of all the relevant info
//       return $(".portfolio_square_image").html()
//   })
//   .then(function(html){
//     $ = cheerio.load(html);
//     // var links = [];
//     $("article").each(function(i,d){
//       // console.log($(d).find("a").attr('href'),i)
//       var element = {id:i,url:$(d).find("a").attr('href')}
//       console.log(element)
//       appendLast( fileName, element, columsHeaders.split("\t") );
//       console.log( "pushed", i )
//     })
//   })

function writeCsv(arr, headers, name) {
    json2csv({ data: arr, fields: headers, del: '\t', hasCSVColumnTitle:true, eol:'' }, function(err, tsv) {
        if (err) console.log(err);
        // console.log(tsv)
        fs.writeFileSync(name+'.tsv', tsv, function(err) {
            if (err) throw err;
            console.log(name+'.tsv','file TSV saved');
        });
    });
}

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
