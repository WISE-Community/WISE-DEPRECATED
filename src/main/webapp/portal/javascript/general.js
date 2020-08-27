function impersonateUser(username) {
  $(`<form style="visibility:hidden" action="/login/impersonate" method="POST"><input name="username" value="${username}"/></form>`)
      .appendTo('body').submit();
}

function switchBackToOriginalUser() {
  $(`<form style="visibility:hidden" action="/logout/impersonate" method="POST"></form>`)
      .appendTo('body').submit();
}
