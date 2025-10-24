# api_endpoints
---

## Endpoints de Livros (`/books`)

**Nota:** Para todos os endpoints de livros, o `sebo_id` é obtido automaticamente do token de autenticação do usuário.

### Adicionar Livro/Cópia
**POST /books**

Adiciona um novo livro ao acervo do sebo do usuário autenticado. Se o livro (identificado pelo ISBN) já existir, adiciona apenas uma nova cópia.

**Payload (JSON):**
```json
{
  "ISBN": "9788532530837",
  "price": 39.90,
  "conservationState": "Ótimo estado"
}
```

**Permissões:** `ADMIN`, `EDITOR`

---

### Listar Livros do Estoque
**GET /books**

Retorna uma lista de todos os livros no acervo do sebo, incluindo a quantidade total de cópias de cada um.

**Permissões:** `ADMIN`, `EDITOR`, `READER`

---

### Buscar Livro
**GET /books/`<ISBN>`**

Busca os detalhes de um livro específico no acervo do sebo, incluindo todas as suas cópias disponíveis.

**Permissões:** `ADMIN`, `EDITOR`, `READER` (qualquer usuário autenticado do sebo)

---

### Deletar Livro
**DELETE /books/`<ISBN>`**

Deleta um livro e **todas** as suas cópias do acervo. Esta é uma ação destrutiva.

**Permissões:** `ADMIN`

---

### Atualizar Cópia de um Livro
**PUT /books/`<ISBN>`/copies/`<copy_id>`**

Atualiza as informações de uma cópia específica de um livro, como preço e estado de conservação.

**Payload (JSON):**
```json
{
  "price": 49.90,
  "conservationState": "Como novo"
}
```

**Permissões:** `ADMIN`, `EDITOR`

---

### Deletar Cópia de um Livro
**DELETE /books/`<ISBN>`/copies/`<copy_id>`**

Deleta uma cópia específica de um livro do acervo. A quantidade total do livro é decrementada.

**Permissões:** `ADMIN`, `EDITOR`

---

## Endpoints de Vendas (`/sales`)

**Nota:** Para todos os endpoints de vendas, o `sebo_id` é obtido automaticamente do token de autenticação do usuário.

### Registrar Venda
**POST /sales/`<ISBN>`/`<copy_id>`**

Registra a venda de uma cópia específica de um livro. A cópia é removida do inventário, a quantidade total do livro é decrementada e um registro de venda é criado na coleção `Sales`. O `user_id` do vendedor e o `sebo_id` são obtidos do token de autenticação.

**Permissões:** `ADMIN`, `EDITOR`

---

### Listar Vendas
**GET /sales**

Retorna uma lista de todas as vendas registradas para o sebo.

**Permissões:** `ADMIN`

---

### Buscar Venda Específica
**GET /sales/`<sale_id>`**

Busca os detalhes de uma venda específica.

**Permissões:** `ADMIN`

---

## Endpoints de Usuários (`/users`)

### Criar Usuário
**POST /users**
 
Cria um novo perfil de usuário no banco de dados após o registro no Firebase Auth. O `userId`, `email` e `name` são obtidos do token de autenticação. Se for o primeiro usuário de um sebo, cria o sebo associado.

**Payload (JSON):**
```json
{
    "nameSebo" : "Nome do Sebo",
    "userRole": "ADMIN"
}
```

**Permissões:** Público

---

### Listar Usuários do Sebo
**GET /users**

Retorna uma lista de todos os usuários associados ao sebo do administrador autenticado.

**Permissões:** `ADMIN`

---

### Buscar Usuário
**GET /users/`<user_id>`**

Busca os detalhes de um usuário específico.

**Permissões:** Qualquer usuário autenticado pode ver seu próprio perfil. `ADMIN` pode ver qualquer perfil.

---
### Atualizar Usuário
**PUT /users/`<user_id>`**

Atualiza as informações de um usuário, como seu papel no sistema.

**Payload (JSON):**
```json
{
  "userRole": "EDITOR"
}
```

**Permissões:** `ADMIN`

---

### Deletar Usuário
**DELETE /users/`<user_id>`**

Deleta um usuário do sistema.

**Permissões:** `ADMIN`

---

## Endpoints de Log de Alterações (`/logs`)

### Listar Logs de Alterações
**GET /logs**

Retorna o histórico de alterações (log) para o sebo. Útil para auditoria.

**Permissões:** `ADMIN`
