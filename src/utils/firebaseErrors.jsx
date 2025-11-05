const firebaseErrors = {
  "auth/user-not-found": "Usuário não encontrado.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Este e-mail já está em uso.",
  "auth/invalid-email": "O formato do e-mail é inválido.",
  "auth/weak-password": "A senha precisa ter no mínimo 6 caracteres.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
};

export const getFriendlyFirebaseError = (errorCode, defaultMessage = "Ocorreu um erro inesperado.") => {
  return firebaseErrors[errorCode] || defaultMessage;
};