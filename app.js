$(document).ready(function(){
	$(".query").submit("click", function(event) {
  		event.preventDefault();
  		var userFoodQuery = $("input[type='text']").val();
		var tag = userQuery.charAt(0).toUpperCase() + userQuery.slice(1);
  		searchTag(tag);
  	});
//	searchTag("Potato");

});

var searchTag = function(tag) {
	
	var parameters = {
		format: 'json',
		max: 50,
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
			if(value.name.indexOf(tag) == 0) {
				$(".food-list").append("<li><a class='foodItem' data-id='" + value.ndbno + "' href='#'>" + value.name + "</a></li>");
			};
			console.log(value)
		});
		$(".foodItem").on("click", function(){
			console.log($(this).attr("data-id"));

		});
	});

};