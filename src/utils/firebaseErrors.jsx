const firebaseErrors = {
  "auth/user-not-found": "Usuário não encontrado.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Este e-mail já está em uso.",
  "auth/invalid-email": "O formato do e-mail é inválido.",
  "auth/weak-password": "A senha precisa ter no mínimo 6 caracteres.",
  "auth/wrong-password": "E-mail ou senha incorretos.", // Unificado com invalid-credential
};

/**
 * Retorna uma mensagem de erro amigável para um código de erro do Firebase.
 * @param {string} errorCode - O código do erro (ex: 'auth/user-not-found').
 * @param {string} defaultMessage - Mensagem padrão caso o código não seja encontrado.
 * @returns {string} A mensagem de erro amigável.
 */
export const getFriendlyFirebaseError = (errorCode, defaultMessage = "Ocorreu um erro inesperado.") => {
  return firebaseErrors[errorCode] || defaultMessage;
};