$(document).ready(function(){
	$(".query").submit("click", function(event) {
  		event.preventDefault();
  		var tag = $("input[type='text']").val();
  		searchTag(tag);
  	});
  	searchTag("potato");

});

var searchTag = function(tag) {
	
	var parameters = {
		format: 'json',
		max: 5,
		q: tag,
		api_key: "eCxqUNPKtEqBPIQtWQAdv0wBhbDjHnIr2cAd38tF"
	};
	
	var result = $.ajax({
		url: "http://api.data.gov/usda/ndb/search/",
		data: parameters,
		type: "GET",
		})
	.done(function(result){
		$(".results").append("<ul class='food-list'></ul>");
		$.each(result.list.item, function(index, value){
			$(".food-list").append("<li><a class='foodItem' data-id='" + value.ndbno + "' href='#'>" + value.name + "</a></li>");
		});
		$(".foodItem").on("click", function(){
			console.log($(this).attr("data-id"));

		});
	});

};