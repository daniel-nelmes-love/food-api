$(document).ready(function(){
	$(".query").submit("click", function(event) {
  		event.preventDefault();
		$(".results").children().remove();
  		$(".nutritional-container").children().remove();
		var userQuery = ($("input[name='tags']").val()).replace(/[\s-+(),.]/g, " ");
		searchApiWith(userQuery);
  	});
});

// User key for API access
var ndbKey = "eCxqUNPKtEqBPIQtWQAdv0wBhbDjHnIr2cAd38tF";


// Start a new search
function searchApiWith(userQuery) {

	var parameters = {
		format: 'json',
		q: userQuery,
		api_key: ndbKey
	};
	// Get food names and foodIds
	var result = $.ajax({
		url: "https://api.data.gov/usda/ndb/search/",
		data: parameters,
		type: "GET"
		})
	.done(function(result){
		var	searchResults = result.list.item,
			multiTagsArray = $.each(userQuery.split(/[\s]/), function(index, item){});

//			console.log(result);

		reviewSearchResults(searchResults, multiTagsArray)

		// When a food item is selected a second API search is completed
		// to retreive its nutritional-container information using the items foodId
		$(".results li").on("click", function(){
			var foodId = $(this).find("a").attr("data-id");
			getNutritionalInformation(foodId);
		});

	})
	.fail(function(e,x, thrownError){
		if (thrownError=="Not Found"){
			showError();
		}
	});
};

// If only 1 tag was input by the user
// then print results whose primary tag matches the user input tag
// E.g. A search for "potato" would not print "Snacks, potato chips..."
// Else produce results that are refined based on all user input tags
// E.g. A search for "raw potato" would print all results with "raw" and "potato" as part of its name
function reviewSearchResults(searchResults, multiTagsArray) {
	var domToBeSetUp = true,
		relevantResults = 0;
	if (multiTagsArray.length === 1) {
		var singleTag = multiTagsArray[0];
		printSearchResults(domToBeSetUp, relevantResults, searchResults, singleTag);
	} else {
		refineSearchResults(domToBeSetUp, relevantResults, searchResults, multiTagsArray);
	};
}

function printSearchResults(domToBeSetUp, relevantResults, searchResults, singleTag) {
	$.each(searchResults, function(index, searchValue) {
		checkCaseInArray(singleTag, searchValue);
		if(tagLower == 0 || tagUpper == 0) {
			checkForFoodList(domToBeSetUp);
			printResult(searchValue);
			relevantResults++;
		};
	});
	checkRelevantResults(relevantResults);
}

function refineSearchResults(domToBeSetUp, relevantResults, searchResults, multiTagsArray) {
	$.each(searchResults, function(index, searchValue) {
		var thisResultRelevance = 0,
			resultNamesArray =
				$.each((searchValue.name)
				.replace(/,/g, "")
				.split(" "), function(index, item){});

		// Counts how many user input tags are in each result
		$.each(multiTagsArray, function(index, tagValue) {
			checkCaseInArray(tagValue, searchValue);
			if(tagLower >= 0 || tagUpper >= 0) {
				thisResultRelevance ++;
			};
		});

		// If the result is relevant based on all user input tags then it gets printed
		if (thisResultRelevance===multiTagsArray.length) {
			// Set up the DOM when first relevant result is found
			if (domToBeSetUp) {
				setUpDomToPrint();
				domToBeSetUp = false;
			};
			printResult(searchValue);
			relevantResults++;
		};
	});
	checkRelevantResults(relevantResults);
};

// Check if the DOM is ready to be populated with foor items
function checkForFoodList(domToBeSetUp) {
	if (domToBeSetUp) {
		setUpDomToPrint();
		domToBeSetUp = false;
	};
}

// If no relevant results were found present error
function checkRelevantResults(relevantResults) {
	if (relevantResults===0) {
		showError();
	};
}

function getNutritionalInformation (foodId) {
	$(".nutritional-container").children().remove();
	var parameters = {
		format: 'json',
		ndbno: foodId,
		api_key: ndbKey
	};
	var result = $.ajax({
		url: "https://api.data.gov/usda/ndb/reports/",
		data: parameters,
		type: "GET"
	})
	.done(function(result){
		var nutritionalInformation = createNutritionList(result);
		$('.nutritional-container').append(nutritionalInformation);

//		console.log(result.report);

	});
}

// Create a copy of the template nutrition list
// and append it under nutritional-container information
function createNutritionList(result){
	// Create a tempprary copy of the template
	var temp = $(".templates .nutrition").clone();
	var path = result.report.food;
	var nutrPath = path.nutrients;

	// Search to API object by index.name rather than index
	var lookup = {};
	for (var i = 0, len = nutrPath.length; i < len; i++) {
		lookup[nutrPath[i].name.replace(/[\s-+(),.]/g, "")] = nutrPath[i];
	}

	// Prints the wanted search results into the temporary DOM's elements
	updateNutrListElement(".calories", lookup.Energy, temp);
	updateNutrListElement(".protein", lookup.Protein, temp);
	updateNutrListElement(".fat", lookup.Totallipidfat, temp);
	updateNutrListElement(".saturated", lookup.Fattyacidstotalsaturated, temp);
	updateNutrListElement(".fiber", lookup.Fibertotaldietary, temp);
	updateNutrListElement(".water", lookup.Water, temp);
	temp.find(".food").text(path.name);
	temp.find(".carbohydrate").text(
		(+lookup.Carbohydratebydifference.value -
		+lookup.Fibertotaldietary.value).toFixed(1) +
		lookup.Carbohydratebydifference.unit
	);

	return temp

//	Print all nutritional information in the console
//	$.each(nutrPath, function(index, nutrValue) {
//		console.log(nutrValue.name + ": " + nutrValue.value + nutrValue.unit);
//	});

}

// Create a new results list and provide secondary instruction
function setUpDomToPrint() {
	$(".results").append("<ul class='food-list'></ul>");
	$(".nutritional-container").append("<div class='instruction'><p>Click on a food item to display its nutritional information.</p></div>");
}

// Mitigate first letter capitalisation for user input tags
function checkCaseInArray (tag, value) {
	tagLower = value.name.indexOf(tag.charAt(0).toLowerCase() + tag.slice(1));
	tagUpper = value.name.indexOf(tag.charAt(0).toUpperCase() + tag.slice(1));
};

// Print food items found in first search along with their ndbno (data-id)
function printResult (searchValue) {
	$(".food-list").append("<li><a class='foodItem' data-id='" + searchValue.ndbno + "' href='#'>" + searchValue.name + "</a></li>");
};

// Place the nutritional value and unit inside the temporary element for the DOM
function updateNutrListElement(element, nutrient, temp) {
	var nutrLevel = +nutrient.value
	temp.find(element).text(nutrLevel.toFixed(1) + nutrient.unit);
};

// Provides error feedback if no results were found
function showError () {
	$(".results").append($('.templates .error').clone());
};

