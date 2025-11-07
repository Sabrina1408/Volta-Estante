const errorMessages = {
  // Firebase Auth errors
  "auth/user-not-found": "Usuário não encontrado.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Este e-mail já está em uso.",
  "auth/invalid-email": "O formato do e-mail é inválido.",
  "auth/weak-password": "A senha precisa ter no mínimo 6 caracteres.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  
  // Backend/Generic errors
  "PROFILE_UPDATE_FAILED": "Erro ao atualizar perfil. Tente novamente.",
  "PROFILE_LOAD_FAILED": "Erro ao carregar o perfil.",
  "SIGNUP_FAILED": "Erro ao cadastrar.",
  "LOGIN_FAILED": "Erro ao efetuar login.",
  "PASSWORD_RESET_FAILED": "Erro ao enviar e-mail de recuperação.",
  "EMPLOYEE_DELETE_FAILED": "Erro ao excluir funcionário. Tente novamente.",
  "EMPLOYEE_LOAD_FAILED": "Erro ao carregar funcionários.",
  "EMPLOYEE_ADD_FAILED": "Não foi possível adicionar o funcionário. Tente novamente.",
  "EMPLOYEE_ADD_INVALID_RESPONSE": "Resposta inválida do servidor. Tente novamente.",
  "EMPLOYEE_UPDATE_FAILED": "Erro ao atualizar. Tente novamente.",
  "STOCK_LOAD_FAILED": "Erro ao carregar o estoque.",
  "BOOK_DELETE_FAILED": "Erro ao excluir livro.",
  "BOOK_SEARCH_FAILED": "Ocorreu um erro ao buscar o livro.",
  "BOOK_GOOGLE_NOT_FOUND": "Livro com este ISBN não foi encontrado na Google Books. Verifique o ISBN (use 13 dígitos começando com 978).",
  "SALE_LOAD_FAILED": "Erro ao carregar vendas.",
  "SALE_REGISTER_FAILED": "Erro ao registrar venda. Tente novamente.",
  "COPY_DELETE_FAILED": "Erro ao excluir exemplar. Tente novamente.",
  "LOG_LOAD_FAILED": "Erro ao carregar o histórico.",
  "DASHBOARD_LOAD_FAILED": "Erro ao carregar dados.",
  "ACCOUNT_DELETED": "Sua conta foi excluída por um administrador. Clique em Continuar para ir para a página de cadastro.",
  
  // Success messages
  "USER_SIGNUP_SUCCESS": "Usuário cadastrado com sucesso!",
  "EMPLOYEE_DELETE_SUCCESS": "Funcionário excluído com sucesso!",
  "SALE_REGISTER_SUCCESS": "Venda registrada com sucesso!",
  "COPY_DELETE_SUCCESS": "Cópia excluída com sucesso!",
  "EMPLOYEE_ADD_SUCCESS": "Funcionário adicionado com sucesso!",
  "EMPLOYEE_UPDATE_SUCCESS": "Funcionário atualizado com sucesso!",
};

export const getFriendlyError = (errorCode, defaultMessage = "Ocorreu um erro inesperado.") => {
  return errorMessages[errorCode] || defaultMessage;
};

// Legacy export for backwards compatibility during migration
export const getFriendlyFirebaseError = getFriendlyError;
