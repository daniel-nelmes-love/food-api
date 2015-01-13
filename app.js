$(document).ready(function(){
	$(".query").submit("click", function(event) {
  		event.preventDefault();
  		$(".results").children().remove();
  		$(".nutritional").children().remove();
  		// Global variables
  		userQuery = ($("input[type='text']").val()+",").replace(/, /g, ",");
		multiTagsArray = $.each(userQuery.split(",").slice(0,-1), function(index, item){});
		singleTag = multiTagsArray[0];
		searchTag(singleTag);
  	});
});

/*	

	var unitElm = temp.find(".food");
	unitElm.text("Unit: " + path.name);

	var calElm = temp.find(".cal");
	calElm.text("Calories: " + path.name);

	var protElm = temp.find(".prot");
	protElm.text("Protien: " + path.name);

	var fatElm = temp.find(".fat");
	fatElm.text("Fat: " + path.name);

	var carbsElm = temp.find(".carbs");
	carbsElm.text("Carbohydrates: " + path.name);
*/
	

// Global Variables
var userQuery,
	multiTagsArray,
	singleTag,
	ndbKey = "eCxqUNPKtEqBPIQtWQAdv0wBhbDjHnIr2cAd38tF";

function searchTag(singleTag) {
	
	var parameters = {
		format: 'json',
		q: singleTag,
		api_key: ndbKey
	};
	
	var result = $.ajax({
		url: "https://api.data.gov/usda/ndb/search/",
		data: parameters,
		type: "GET"
		})
	.done(function(result){
		var tagLower,
			tagUpper,
			checkRelavance,
			searchResults = result.list.item;
			console.log(result)

		$(".results").append("<ul class='food-list'></ul>");

		if (multiTagsArray.length === 1) {
			$.each(searchResults, function(index, searchValue) {
				checkCaseInArray(singleTag, searchValue);
				if(tagLower == 0 || tagUpper == 0) {
					printResults(searchValue);
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
					printResults(searchValue);
				};
			});
		};
			
			function printResults (searchValue) {
				$(".food-list").append("<li><a class='foodItem' data-id='" + searchValue.ndbno + "' href='#'>" + searchValue.name + "</a></li>");
			};

			function checkCaseInArray (tag, value) {
			tagLower = value.name.indexOf(tag.charAt(0).toLowerCase() + tag.slice(1));
			tagUpper = value.name.indexOf(tag.charAt(0).toUpperCase() + tag.slice(1));
			};

		$(".foodItem").on("click", function(){
	  		$(".nutritional").children().remove();
			var parameters = {
				format: 'json',
				ndbno: $(this).attr("data-id"),
				api_key: ndbKey
			};
			var result = $.ajax({
				url: "https://api.data.gov/usda/ndb/reports/",
				data: parameters,
				type: "GET"
			})
			.done(function(result){
				console.log(result.report);
				var foodNutirent = getFoodNutrient(result);
				$('.nutritional').append(foodNutirent);
			});
		});

	});

};

function getFoodNutrient(result) {
	var temp = $(".templates .nutrition").clone();
	var path = result.report.food
	var nutrPath = path.nutrients

	var foodElm = temp.find(".food");
	foodElm.text(path.name + " per 100g");

	var caloriesElm = temp.find(".calories");
	caloriesElm.text(path.nutrients[1].value);

	$.each(nutrPath, function(index, nutrValue) {
		console.log(nutrValue.name + ": " + nutrValue.value + nutrValue.unit);
	})

	return temp
}
