export function createAccountSuccessResponse(username: string) {
  return {
    status: 'success',
    username: username
  };
}

export function createAccountErrorResponse(messageCode: string) {
  return {
    error: {
      messageCode: messageCode
    }
  };
}
