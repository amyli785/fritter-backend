function viewFilters(fields) {
	fetch('/api/filters')
	  .then(showResponse)
		.catch(showResponse);
}

function viewFilter(fields) {
	fetch(`/api/filters/${fields.filterId}`)
	  .then(showResponse)
		.catch(showResponse);
}

function createFilter(fields) {
	fetch('/api/filters', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
	  .then(showResponse)
		.catch(showResponse);
}

function updateFilter(fields) {
	fetch(`/api/filters/${fields.filterId}`, {method: 'PUT', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
	  .then(showResponse)
		.catch(showResponse);
}

function deleteFilter(fields) {
	fetch(`/api/filters/${fields.filterId}`, {method: 'DELETE'})
	  .then(showResponse)
		.catch(showResponse);
}
