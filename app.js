$(document).ready(function(){
	$(".query").submit("click", function(event) {
  		event.preventDefault();
  		$(".results").children().remove();

  		// Global variables
  		userQuery = ($("input[type='text']").val()+",").replace(/, /g, ",");
		multiTagsArray = $.each(userQuery.split(",").slice(0,-1), function(index, item){});
		singleTag = multiTagsArray[0];

		searchTag(singleTag);
  	});
//	searchTag("potato");
});

// Global Variables
var userQuery,
	multiTagsArray,
	singleTag,
	tagLower,
	tagUpper,
	checkRelavance;

function searchTag(singleTag) {
	
	var parameters = {
		format: 'json',
		q: singleTag,
		api_key: "eCxqUNPKtEqBPIQtWQAdv0wBhbDjHnIr2cAd38tF"
	};
	
	var result = $.ajax({
		url: "http://api.data.gov/usda/ndb/search/",
		data: parameters,
		type: "GET",
		})
	.done(function(result){
		var searchResults = result.list.item;
		$(".results").append("<ul class='food-list'></ul>");
		if (multiTagsArray.length === 1) {
			$.each(searchResults, function(index, searchValue) {
				checkCaseInArray(singleTag, searchValue);
				if(tagLower == 0 || tagUpper == 0) {
					$(".food-list").append("<li><a class='foodItem' data-id='" + searchValue.ndbno + "' href='#'>" + searchValue.name + "</a></li>");
				};
			});
		} else {
			$.each(searchResults, function(index, searchValue) {
				checkRelavance = 0;

				var resultNamesArray =
					$.each((searchValue.name +",")
					.replace(/, /g, ",")
					.replace(/ /g, ",")
					.split(",")
					.slice(0,-1), function(index, item){});

				$.each(multiTagsArray, function(index, tagValue) {
					checkCaseInArray(tagValue, searchValue);
					if(tagLower >= 0 || tagUpper >= 0) {
					checkRelavance ++;
					};
				});
				if (checkRelavance===multiTagsArray.length) {
					$(".food-list").append("<li><a class='foodItem' data-id='" + searchValue.ndbno + "' href='#'>" + searchValue.name + "</a></li>");
				};
			});
		};
		
			function checkCaseInArray (tag, value) {
			tagLower = value.name.indexOf(tag.charAt(0).toLowerCase() + tag.slice(1));
			tagUpper = value.name.indexOf(tag.charAt(0).toUpperCase() + tag.slice(1));
			};

		$(".foodItem").on("click", function(){
			console.log($(this).attr("data-id"));
		});

	});

};
