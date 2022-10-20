function viewGroups(fields) {
	fetch('/api/groups')
	  .then(showResponse)
		.catch(showResponse);
}

function createGroup(fields) {
	fetch('/api/groups', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
	  .then(showResponse)
		.catch(showResponse);
}

function viewGroup(fields) {
	fetch(`/api/groups/${fields.name}`)
	  .then(showResponse)
		.catch(showResponse);
}

function deleteGroup(fields) {
	fetch(`/api/groups/${fields.name}`, {method: 'DELETE'})
	  .then(showResponse)
		.catch(showResponse);
}

function addGroupMember(fields) {
	fetch(`/api/groups/${fields.name}`, {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
	  .then(showResponse)
		.catch(showResponse);
}

function deleteGroupMember(fields) {
	fetch(`api/groups/${fields.name}/${fields.member}`, {method: 'DELETE'})
	  .then(showResponse)
		.catch(showResponse);
}