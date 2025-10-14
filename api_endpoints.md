# api_endpoints
---

## Endpoints de Livros (`/books`)

### Adicionar Livro/Cópia
**POST /books**

Adiciona um novo livro ao acervo do sebo. Se o livro (identificado pelo ISBN) já existir, adiciona apenas uma nova cópia.

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

### Buscar Livro
**GET /books/<ISBN>**

Busca os detalhes de um livro específico no acervo do sebo, incluindo todas as suas cópias disponíveis.

**Permissões:** `ADMIN`, `EDITOR`, `READER` (qualquer usuário autenticado do sebo)

---

### Deletar Livro
**DELETE /books/<ISBN>**

Deleta um livro e **todas** as suas cópias do acervo. Esta é uma ação destrutiva.

**Permissões:** `ADMIN`

---

### Atualizar Cópia de um Livro
**PUT /books/<ISBN>/copies/<copy_id>**

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
**DELETE /books/<ISBN>/copies/<copy_id>**

Deleta uma cópia específica de um livro do acervo. A quantidade total do livro é decrementada.

**Permissões:** `ADMIN`, `EDITOR`

---

## Endpoints de Vendas (`/sales`)

### Registrar Venda
**POST /sales/<ISBN>/<copy_id>**

Registra a venda de uma cópia específica de um livro. A cópia é removida do inventário e a quantidade total do livro é decrementada. O `user_id` do vendedor e o `sebo_id` são obtidos do token de autenticação.

**Permissões:** `ADMIN`, `EDITOR`

---

## Endpoints de Usuários (`/users`)

### Criar Usuário
**POST /users**

Cria um novo usuário e, se for o primeiro usuário de um sebo, cria o sebo associado. Endpoint público para registro.

**Payload (JSON):**
```json
{
    "userId": "some-firebase-auth-uid",
    "name" : "Nome do Usuário",
    "email": "usuario@email.com",
    "nameSebo" : "Nome do Sebo"
}
```

**Permissões:** Público

---

### Buscar Usuário
**GET /users/<user_id>**

Busca os detalhes de um usuário específico.

**Permissões:** Qualquer usuário autenticado pode ver seu próprio perfil. `ADMIN` pode ver qualquer perfil.

---

### Deletar Usuário
**DELETE /users/<user_id>**

Deleta um usuário do sistema.

**Permissões:** `ADMIN`
