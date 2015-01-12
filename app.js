$(document).ready(function(){
	$(".getter").submit("click", function(event) {
  		event.preventDefault();
  		var searchTerm = $("input[type='text']").val();
  		getRequest(searchTerm);
  	});
});
 
var getRequest = function(searchTerm) {
	
	// CS50 Food API parameters
	var parameters = {
		key: "eac1a9984101edd49804734c622fa622",
	    recipe: searchTerm,
	    output: "jsonp"
	};
	var result = $.ajax({
		url: "http://api.cs50.net/food/3/facts",
		data: parameters,
		dataType: "jsonp",
		type: "GET"
		})
	.done(function(result){
		console.log(result);
	});
};