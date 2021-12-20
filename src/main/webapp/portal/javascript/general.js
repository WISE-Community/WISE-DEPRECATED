function impersonateUser(username, userType) {
  $.post( "/api/login/impersonate", {username: username}).always(function( data ) {
    window.location.href = `/${userType}`;
  });
}

function switchBackToOriginalUser() {
  $.post( "/api/logout/impersonate").always(function( data ) {
    window.location.href = "/teacher";
  });
}
