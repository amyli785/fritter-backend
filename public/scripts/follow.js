function viewFollowers(fields) {
  fetch('/api/follow/followers')
    .then(showResponse)
    .catch(showResponse);
}

function viewFollowing(fields) {
  fetch('/api/follow/following')
    .then(showResponse)
    .catch(showResponse);
}

function follow(fields) {
  fetch(`/api/follow`, {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function unfollow(fields) {
  fetch(`/api/follow/${fields.followee}`, {method: 'DELETE', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}