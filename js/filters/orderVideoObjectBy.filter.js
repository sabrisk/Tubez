angular.module('ytorg').filter('orderVideoObjectBy', orderVideoObjectBy);

function orderVideoObjectBy() {
	return function(items, field, reverse) {
		var filtered = [];
		angular.forEach(items, function(item) {
			filtered.push(item);
		});
		filtered.sort(function (a, b) {
			return (a.snippet[field] > b.snippet[field] ? 1 : -1);
		});
		if(reverse) filtered.reverse();
			return filtered;
	};
}