function viewFeed(fields) {
	fetch(`/api/feed/${fields.filterId}`)
	  .then(showResponse)
		.catch(showResponse);
}