function viewPicture(fields) {
	fetch('/api/rrpictures/current')
	  .then(showResponse)
		.catch(showResponse);
}

function viewPictureOther(fields) {
	fetch(`/api/rrpictures/current/${fields.username}`)
	  .then(showResponse)
		.catch(showResponse);
}

function changePicture(fields) {
	fetch('/api/rrpictures/current', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
	  .then(showResponse)
		.catch(showResponse);
}

function deletePicture(fields) {
	fetch('/api/rrpictures/current', {method: 'DELETE'})
	  .then(showResponse)
		.catch(showResponse);
}

function viewPicturesPrevious(fields) {
	fetch('/api/rrpictures/previous')
	  .then(showResponse)
		.catch(showResponse);
}

function createPicturePrevious(fields) {
	fetch('/api/rrpictures/previous', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
	  .then(showResponse)
		.catch(showResponse);
}

function deletePicturePrevious(fields) {
	fetch(`/api/rrpictures/previous/${fields.rrpictureId}`, {method: 'DELETE'})
	  .then(showResponse)
		.catch(showResponse);
}
