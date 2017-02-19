var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var fs = require('fs');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Scraper System' });
});
router.post('/done',function(req,res,next){
	var collectionnaja = req.body.collection;
	var index = req.body.index;
	MongoClient.connect('mongodb://127.0.0.1:27017/im',function(err,db){
    if(!err){
      var collection = db.collection('done'+collectionnaja);
        collection.insert({index},function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log('Inserted');
            db.close();
          }
        });
      }
  	});
	res.send('done');
});
router.post('/undone',function(req,res,next){
	var collectionnaja = req.body.collection;
	var index = req.body.index;
	MongoClient.connect('mongodb://127.0.0.1:27017/im',function(err,db){
    if(!err){
      var collection = db.collection('done'+collectionnaja);
        collection.remove({index:''+index},function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            db.close();
          }
        });
      }
  	});
	res.send('undone');
});
router.post('/scrap',function(req,res,next){
	console.log('working..')
	var url = req.body.url;
	var collection = req.body.collection;
	var youtube1 = req.body.youtube1
	var youtube2 = req.body.youtube2
	var youtube3 = req.body.youtube3
	var morereview = req.body.morereview
	request(url,function(err,r,body){
		if(!body)return;
		var $ = cheerio.load(body);
		var X = cheerio.load(body, { decodeEntities: false });
		var title = $('#prod_title').text().replace(/\n/g,'').trim();
		var images = [];
		$('.lfloat.ui-border').each(function(index, el) {
			if($(this).children('div').attr('data-big')!=undefined)
				images.push($(this).children('div').attr('data-big'));
		});
		$('#productDetails').find('img').each(function(index, el) {
			if($(this).attr('src')!=undefined)
				images.push($(this).attr('src'))
		});
		var price = $('#special_price_box').text().replace(',','').trim()
		var oldprice = $('#price_box').text().split(' ')[0].replace(',','').trim()
		var discount = $('#product_saving_percentage').text().replace('%','').trim()

		var comments = [];
		$('.ratRev_reviewListRow').each(function(index, el) {
			if($(this).find('.product-card__rating__stars > div:last-child').css('width').replace('%','')>=80){
				let title = $(this).find('.ratRev_revTitle').text().replace(/\n/g,'').trim();
				let date = $(this).find('.ratRev_revDate').text()
				let nickname = $(this).find('.ratRev-revNickname').text().replace(/\n/g,'').trim();
				let detail = $(this).find('.ratRev_revDetail').text().replace(/\n/g,'').trim();
				let rating = $(this).find('.product-card__rating__stars > div:last-child').css('width').replace('%','')

				let data = {title,date,nickname,detail,rating}
				comments.push(data);
			}
		});
		var rating = $('.ratingNumber').children('em').text()
		var detail = X('#productDetails').html()
		var warranty = $('.prod-warranty__term').text()
		var contents = []
		$('.prod_content').find('ul').children('li').each(function(index, el) {
			contents.push($(this).children('span').text())
		});

		var data = {
			url,title,images,price,oldprice,discount,comments,rating,detail,warranty,contents,youtube1,youtube2,youtube3,morereview
		}
		insertToDatabase(data,collection);
		imgDownload(images,title);
		res.send(data);
	});
});
router.post('/allScrap',function(req,res,next){
	console.log('working..')
	var url = req.body.url;
	var collection = req.body.collection;
	request(url,function(req,res,body){
		var $ = cheerio.load(body)
		var q = $('.c-catalog-title__quantity').text().replace(/\n/g,'').trim().split(' ').pop();
		pagenum=Math.ceil(q/36)
		console.log(q)
		allScrap(url,collection,pagenum,q)
	});

})
router.get('/car',function(req,res,next){
	MongoClient.connect('mongodb://127.0.0.1:27017/im',function(err,db){
    if(!err){
      var collection = db.collection('car');
        collection.find({},{_id:0}).toArray(function(err, result) {
		    var carresult = result;
		     var donecollection = db.collection('donecar');
        donecollection.find({},{_id:0}).toArray(function(err, result) {
		    var donecarresult = result;

	res.render('car', { title: 'All Car',data:carresult,donecar:donecarresult });
		});
		});
		
      }
  });
});
function allScrap(url,collection,pagenum,q){
	var count=1;
	for(page=1;page<=pagenum;page++){
		anyurl = url;
		anyurl = anyurl.replace('searchredirect','page='+page+'&searchredirect')
		request(anyurl,function(req,res,body){
			let $ = cheerio.load(body)
			var itemurl = $('.product-card').children('a').attr('href')
			for(i=0;i<36;i++){
				scrap(itemurl,collection,count++,q)
			}
		});
	}

}
function scrap(url,collection,count,q){
	console.log(q+' : '+count)
	request(url,function(err,r,body){
		if(!body)return;
		var $ = cheerio.load(body);
		var X = cheerio.load(body, { decodeEntities: false });
		var title = $('#prod_title').text().replace(/\n/g,'').trim();
		var images = [];
		$('.lfloat.ui-border').each(function(index, el) {
			if($(this).children('div').attr('data-big')!=undefined)
				images.push($(this).children('div').attr('data-big'));
		});
		$('#productDetails').find('img').each(function(index, el) {
			if($(this).attr('src')!=undefined)
				images.push($(this).attr('src'))
		});
		var price = $('#special_price_box').text().replace(',','').trim()
		var oldprice = $('#price_box').text().split(' ')[0].replace(',','').trim()
		var discount = $('#product_saving_percentage').text().replace('%','').trim()

		var comments = [];
		$('.ratRev_reviewListRow').each(function(index, el) {
			if($(this).find('.product-card__rating__stars > div:last-child').css('width').replace('%','')>=80){
				let title = $(this).find('.ratRev_revTitle').text().replace(/\n/g,'').trim();
				let date = $(this).find('.ratRev_revDate').text()
				let nickname = $(this).find('.ratRev-revNickname').text().replace(/\n/g,'').trim();
				let detail = $(this).find('.ratRev_revDetail').text().replace(/\n/g,'').trim();
				let rating = $(this).find('.product-card__rating__stars > div:last-child').css('width').replace('%','')

				let data = {title,date,nickname,detail,rating}
				comments.push(data);
			}
		});
		var rating = $('.ratingNumber').children('em').text()
		var detail = X('#productDetails').html()
		var warranty = $('.prod-warranty__term').text()
		var contents = []
		$('.prod_content').find('ul').children('li').each(function(index, el) {
			contents.push($(this).children('span').text())
		});

		var data = {
			url,title,images,price,oldprice,discount,comments,rating,detail,warranty,contents,youtube1,youtube2,youtube3,morereview
		}
		insertToDatabase(data,collection);
		imgDownload(images,title);
		res.send(data);
	});
}

function imgDownload(imgArray,proName){
	proName = proName.replace(/ /g,'').replace(/\n/g,'').trim().replace(/\//g,'');
 	for(i in imgArray){
	 	let filename =proName+"_"+(i+1);
		let file = fs.createWriteStream("public/images/"+filename+"."+imgArray[i].split('.').pop());
		http.get(imgArray[i], function(response) {
	        response.pipe(file);
	        file.on('finish', function() {
	            file.close();
	        });
		}).on('error', function(e) {
		    console.log("Got error: " + e.message);
		});
	}
}
function insertToDatabase(data,collectionnaja){
	MongoClient.connect('mongodb://127.0.0.1:27017/im',function(err,db){
    if(!err){
      var collection = db.collection(collectionnaja);
        collection.insert(data,function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log('Inserted');
            db.close();
          }
        });
      }
  });
}
module.exports = router;
