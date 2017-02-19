$(document).ready(function() {
	$('#submit').click(function(){
		if (confirm("กดตกลงเพื่อยืนยัน") == true){
			var url = $('#url').val()
			var collection = $('#collection').val()
			var youtube1 = $('#youtube1').val()
			var youtube2 = $('#youtube2').val()
			var youtube3 = $('#youtube3').val()
			var morereview = $('#morereview').val()
			$.ajax({
				url: '/scrap',
				type: 'POST',
				data: {url,collection,youtube1,youtube2,youtube3,morereview},
			})
			.done(function(data) {
				location.reload()
				// $('.url').append(data.url)
				// $('.title').append(data.title)
				// for(i in data.images)
				// 	$('.images').append("<img src="+data.images[i]+" width='100px' height='100px'>")
				// $('.price').append(data.price)
				// $('.oldprice').append(data.oldprice)
				// $('.discount').append(data.discount)
				// for(i in data.comments)
				// 	$('.comments').append('<div>'+data.comments[i].title+'<br>'+data.comments[i].date+'<br>'+data.comments[i].nickname+'<br>'+data.comments[i].detail+'<br>'+data.comments[i].rating+'</div>')
				// $('.rating').append(data.rating)
				// $('.detail').html(data.detail)
				// $('.warranty').append(data.warranty)
				// for(i in data.contents)
				// 	$('.contents').append('<div>'+data.contents[i]+'</div>')
			})		
		}
	});
});
function urleiei(){
	let url = $('#urleiei').val();
	let collection = $('#collectioneiei').val();
	$.ajax({
		url: '/allScrap',
		type: 'POST',
		data: {url,collection},
	})
	.done(function(data) {
		location.reload()
	})
	
}
function gen(i){
	if($('#affURL'+i).val()=='')alert('affURL?');
	if($('#type'+i).val()=='-')alert('type?');
	if($('#color'+i).val()=='-')alert('color?');
	var img = $('#images'+i).val().split(',')
	var content = $('#contents'+i).val().split(',')
	var contentToHTML = "<ul>";
	for(j in content){
		contentToHTML+=`<li>${content[j]}</li>`;
		console.log(i)
	}
	contentToHTML+="</ul>";
	var script = 
	"$('#title').val('"+$('#title'+i).val()+"')\n"+
	"$('#in-product_cat-28').prop('checked', true);\n"+
	"$('#in-product_cat-33').prop('checked', true);\n"+
	"$('#new-tag-product_tag').val('car,"+$('#type'+i).val()+","+$('#color'+i).val()+"')\n"+
	`$('input[value="เพิ่ม"]').click()\n`+
	"$('#product-type').val('external')\n"+
	"$('#_product_url').val('"+$('#affURL'+i).val()+"')\n"+
	"$('#_button_text').val('ดูรายละเอียดเพิ่มเติม')\n"+
	"$('#_regular_price').val('"+$('#oldprice'+i).val()+"')\n"+
	"$('#_sale_price').val('"+$('#price'+i).val()+"')\n"+
	"$('#excerpt').val('"+contentToHTML+"')\n"+ //short description
	"$('#content').val('"+$('#detail'+i).val().replace(/\'/g,'')+"<center><img src="+(img[1]||img[4])+" width=80%></center>')\n"+
	"$('#fifu_input_url').val('"+img[0]+"')\n"+
	"previewImage();\n"+
	"$('#fifu_input_alt').val('"+$('#title'+i).val()+"')\n"+
	`$('a[data-choose="Add images to product gallery"]')[0].click()\n`+
	"$('#media-search-input').val('"+$('#name'+i).text().replace(/ /g,'').replace(/\(/g,'').replace(/\)/g,'').replace(/\//g,'').replace(/:/g,'').trim()+"')\n";

	// "$('#et_price').val('"+$('#price'+i).val()+"')\n"+
	// "$('#content').val('"+$('#detail'+i).val()+"')\n"+
	// "$('#et_description').val('"+$('#contents'+i).val()+"')\n"+
	// "$('#et_upload_image').val('"+(img[0]||"")+"')\n"+
	// "$('#et_upload_image2').val('"+(img[1]||"")+"')\n"+
	// "$('#et_upload_image3').val('"+(img[2]||"")+"')\n"+
	// "$('#et_upload_image4').val('"+(img[3]||"")+"')\n"+
	// "$('#et_band').val('"+"onsale"+"')\n"+
	// "$('#monarch-override-locations').prop('checked', true);\n"+
	// "$('#content').val('<center><img src="+(img[1]||img[4])+" width=60%></center>"+$('#detail'+i).val()+"')\n"

	var script2 = 
	"$('.attachment.save-ready').each(function(){\n"+
	"$(this).children('div').click()\n"+
	"$('label[data-setting=title]').children('input').val('"+$('#title'+i).val()+"')\n"+
	"$('label[data-setting=caption]').children('textarea').val('"+$('#title'+i).val()+"')\n"+
	"$('label[data-setting=alt]').children('input').val('"+$('#title'+i).val()+"')\n"+
	"$('label[data-setting=description]').children('textarea').val('"+$('#title'+i).val()+"')\n"+
	"})"
	var script3 = 
	`$('.attachment.save-ready').each(function(){
	$(this).children('div').click()
	$('a[data-choose="Add images to product gallery"]')[0].click()	
	$('.button.media-button.button-primary.button-large.media-button-select').click()
	})`;

	$('#item'+i).css('background-color', 'orange');
	$('textarea#script'+i).val(script);
	$('textarea#searchimg'+i).val(script2)
	$('textarea#script3'+i).val(script3)
	console.log($('#script'+i).length)
}
function done(collection,index){
	$.ajax({
		url: '/done',
		type: 'POST',
		data: {collection,index},
	})
	.done(function(data) {
		console.log();
		$('#item'+index).css('background-color', 'red');
	})
}
function undone(collection,index){
	$.ajax({
		url: '/undone',
		type: 'POST',
		data: {collection,index},
	})
	.done(function(data) {
		console.log();
		$('#item'+index).css('background-color', 'white');
	})
}
