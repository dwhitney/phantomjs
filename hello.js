var page = new WebPage();
var url = phantom.args[0];

var resources = [];

page.onResourceReceived = function (resource) {
    resources.push(resource);
};

page.open(url, function(status){
	var result = page.evaluateInAllFrames(function(){
		var adSizes = ["250x250","240x400","336x280","300x100","720x300","468x60","234x60","120x90","120x240","125x125","120x600","970x250", "300x600", "300x1050", "970x90", "300x250", "300x600", "180x250", "160x600", "728x90", "120x60", "88x31", "180x160", "160x600", "550x480"];
		var ads = [];
		
		function isInView(elem){
		    var docViewTop = $(window).scrollTop();
		    var docViewBottom = docViewTop + $(window).height();
		    var elemTop = $(elem).offset().top;
		    var elemBottom = elemTop + $(elem).height();
		    return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom) && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
		}
		
		$("*").each(function(){
			var width = $(this).width();
			var height = $(this).height();
			var dimensions = width + "x" + height;
			for(i in adSizes){
				if(adSizes[i] == dimensions){
					var offset = $(this).offset();
					var ad = {
						top:offset.top,
						left:offset.left,
						width:width,
						height:height,
						isInView:isInView(this)
					};
					var flag = true;
					for(j in ads){
						var tmpAd = ads[j];
						if(tmpAd.top == ad.top && tmpAd.left == ad.left && tmpAd.width == ad.width && tmpAd.height == ad.height && tmpAd.isInView == ad.isInView) flag = false;
					}
					if(flag) ads.push(ad);
				}
			}
		});
		var data = {
				"html":document.getElementsByTagName('html')[0].outerHTML, 
				"uri":document.location.href,
				"ads":ads
			};
		return JSON.stringify(data);
	});
	
	var resultJson = eval('(' + result + ')');
	var data = {
	    "uri":url,
        "finalURI":encodeURI(resultJson.frame.uri),
        "frames":resultJson,
        "status":status
    }

	for(var i in resources){
		if(resources[i].url == data.finalURI){
			data.response = resources[i];
		}
	}
	
	console.log(JSON.stringify(data));
	phantom.exit();
});
