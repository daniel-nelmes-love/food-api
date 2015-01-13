$(document).ready(function(){
	$(".query").submit("click", function(event) {
  		event.preventDefault();
		$(".results").children().remove();
  		$(".nutritional").children().remove();
		userQuery = ($("input[type='text']").val()+",").replace(/, /g, ",");
		multiTagsArray = $.each(userQuery.split(",").slice(0,-1), function(index, item){});
		singleTag = multiTagsArray[0];
		searchTag(singleTag);
  	});
});

	

// Global Variables
var userQuery,
	multiTagsArray,
	singleTag,
	ndbKey = "eCxqUNPKtEqBPIQtWQAdv0wBhbDjHnIr2cAd38tF";


// Start a new search
function searchTag(singleTag) {
	
	var parameters = {
		format: 'json',
		q: singleTag,
		api_key: ndbKey
	};
	// Gets food names and ids
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

		// Create a new results list
		$(".results").append("<ul class='food-list'></ul>");

		// If only 1 tag was input by the user
		// then print all results that have the user input tag at the beginning of the name
		if (multiTagsArray.length === 1) {
			$.each(searchResults, function(index, searchValue) {
				checkCaseInArray(singleTag, searchValue);
				if(tagLower == 0 || tagUpper == 0) {
					printResults(searchValue);
				};
			});
		// Else produce results that are refined based on all user input tags
		} else {
			$.each(searchResults, function(index, searchValue) {
				checkRelavance = 0;
				var resultNamesArray =
					$.each((searchValue.name +",")
					.replace(/, /g, ",")
					.replace(/ /g, ",")
					.split(",")
					.slice(0,-1), function(index, item){});

				// Counts how many user input tags are in each result
				$.each(multiTagsArray, function(index, tagValue) {
					checkCaseInArray(tagValue, searchValue);
					if(tagLower >= 0 || tagUpper >= 0) {
					checkRelavance ++;
					};
				});
				// If the result is relevant based on all user input tags then it gets printed
				if (checkRelavance===multiTagsArray.length) {
					printResults(searchValue);
				};
			});
		};
			
			function printResults (searchValue) {
				$(".food-list").append("<li><a class='foodItem' data-id='" + searchValue.ndbno + "' href='#'>" + searchValue.name + "</a></li>");
			};

			// This function is to mitigate first letter capitalisation for user input tags
			function checkCaseInArray (tag, value) {
			tagLower = value.name.indexOf(tag.charAt(0).toLowerCase() + tag.slice(1));
			tagUpper = value.name.indexOf(tag.charAt(0).toUpperCase() + tag.slice(1));
			};

		// When a food item is selected a second API search is completed
		// to retreive its nutritional information using the items data-id
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
				var mainInfo = createNutritionInfo(result);
				$('.nutritional').append(mainInfo);

				// Create a copy of the template nutrition list
				// and append it under nutritional information
				function createNutritionInfo(result){
					// Create a tempprary copy of the template
					var temp = $(".templates .nutrition").clone();
					var path = result.report.food;
					var nutrPath = path.nutrients;

					// Search to API object by index.name rather than index
					var lookup = {};
					for (var i = 0, len = nutrPath.length; i < len; i++) {
					    lookup[nutrPath[i].name
						    .replace(/ /g, "")
    						.replace("(", "")
    						.replace(")", "")
    						.replace("-", "")
    						.replace("+", "")
    						.replace(",", "")] = nutrPath[i];
					}

					// Prints the wanted search results into the temporary DOM's elements
					DomElement(".calories", lookup.Energy);
					DomElement(".protein", lookup.Protein);
					DomElement(".fat", lookup.Totallipidfat);
					DomElement(".saturated", lookup.Fattyacidstotalsaturated);
					DomElement(".fiber", lookup.Fibertotaldietary);
					DomElement(".water", lookup.Water);
					temp.find(".food").text(path.name);
					temp.find(".carbohydrate").text(
						(+lookup.Carbohydratebydifference.value -
						+lookup.Fibertotaldietary.value).toFixed(1) +
						lookup.Carbohydratebydifference.unit
					);
					temp.find(".total").text(
						(+lookup.Protein.value +
						+lookup.Totallipidfat.value +
						+lookup.Carbohydratebydifference.value +
						+lookup.Water.value).toFixed(1)
					);

					// Print all nutritional information in the console
					$.each(nutrPath, function(index, nutrValue) {
						console.log(nutrValue.name + ": " + nutrValue.value + nutrValue.unit);
					});

					return temp

					function DomElement(element, nutrient) {
						var nutrLevel = +nutrient.value
						temp.find(element).text(nutrLevel.toFixed(1) + nutrient.unit);
					}
				}
			});
		});

	});

};

