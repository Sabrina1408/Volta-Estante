# api_endpoints
---

## Endpoints de Livros (`/books`)

**Nota:** Para todos os endpoints de livros, o `sebo_id` é obtido automaticamente do token de autenticação do usuário.

### Adicionar Livro/Cópia
**POST /books**

Adiciona um novo livro ao acervo do sebo do usuário autenticado. Se o livro (identificado pelo ISBN) já existir, adiciona apenas uma nova cópia.

**Payload (JSON):**
"""markdown
# api_endpoints
---

> Observação geral: o `sebo_id` e o `user_id` são obtidos a partir do token de autenticação (middleware). Todos os endpoints que usam `ISBN` esperam ISBN-13 sanitizado.

## Endpoints de Livros (`/books`)

### Adicionar Livro / Adicionar Cópia
POST /books

Descrição: adiciona um novo livro (buscado na Google Books API) ao acervo do sebo ou, se o livro já existir, adiciona apenas uma nova cópia ao inventário.

Payload (JSON):
```json
{
  "ISBN": "9788532530837",
  "price": 39.90,
  "conservationState": "Ótimo estado"
}
```

Permissões: `ADMIN`, `EDITOR`

---

### Listar livros do estoque
GET /books

Descrição: retorna uma lista dos livros do sebo (campos principais: title, author, categories, ISBN, totalQuantity).

Permissões: `ADMIN`, `EDITOR`, `READER`

---

### Buscar livro
GET /books/<ISBN>

Descrição: retorna os detalhes de um livro específico e suas cópias.

Permissões: `ADMIN`, `EDITOR`, `READER`

---

### Deletar livro (todas as cópias)
DELETE /books/<ISBN>

Descrição: deleta o documento do livro e todas as suas cópias do acervo.

Permissões: `ADMIN`

---

### Atualizar uma cópia do livro
PUT /books/<ISBN>/copies/<copy_id>

Descrição: atualiza campos editáveis de uma cópia (ex.: preço, estado de conservação).

Payload (JSON): campos a atualizar (ex.: `price`, `conservationState`).

Permissões: `ADMIN`, `EDITOR`

---

### Deletar uma cópia do livro
DELETE /books/<ISBN>/copies/<copy_id>

Descrição: remove uma cópia específica e decrementa `totalQuantity` do livro.

Permissões: `ADMIN`, `EDITOR`

---

## Endpoints de Vendas (`/sales`)

### Registrar venda
POST /sales/<ISBN>/<copy_id>

Descrição: registra a venda de uma cópia específica. O `user_id` e `sebo_id` são obtidos do token.

Permissões: `ADMIN`, `EDITOR`

---

### Buscar venda
GET /sales/<sale_id>

Descrição: retorna os detalhes de uma venda específica.

Permissões: `ADMIN`, `EDITOR`, `READER`

---

### Deletar venda
DELETE /sales/<sale_id>

Descrição: remove o registro de venda.

Permissões: `ADMIN`

---

### Atualizar venda
PUT /sales/<sale_id>

Descrição: atualiza campos de uma venda (payload com campos a atualizar).

Permissões: `ADMIN`, `EDITOR`

---

## Endpoints de Usuários (`/users`)

### Criar usuário
POST /users

Descrição: cria um perfil no banco para um usuário autentificado (dados básicos vindos do token). Permite criar o primeiro sebo se necessário.

Payload (JSON) exemplo:
```json
{
  "nameSebo": "Nome do Sebo",
  "userRole": "ADMIN"
}
```

Permissões: sem claims obrigatórias (público autenticado)

---

### Buscar usuário
GET /users/<user_id>

Descrição: retorna dados do usuário. Usuário comum só pode ver seu próprio perfil; `ADMIN` pode ver qualquer perfil do seu sebo.

Permissões: `ADMIN`, `EDITOR`, `READER` (com regras de autorização aplicadas)

---

### Deletar usuário
DELETE /users/<user_id>

Descrição: remove o usuário. Se um admin deletar a si mesmo, é necessário informar `editorID` no body para promoção.

Permissões: `ADMIN` (editores/usuários podem deletar apenas a si mesmos)

---

### Criar funcionário (pelo admin)
POST /users/employees/<user_id>

Descrição: adiciona um novo funcionário ao sebo (o `user_id` aqui é o UID do Firebase do funcionário).

Permissões: `ADMIN`

---

### Atualizar usuário
PUT /users/<user_id>

Descrição: atualiza campos do usuário. `ADMIN` pode atualizar qualquer usuário do sebo; `EDITOR` pode atualizar apenas seu próprio perfil.

Permissões: `ADMIN`, `EDITOR`

---

## Endpoints de Logs (`/logs`)

### Buscar log
GET /logs/<log_id>

Descrição: retorna um registro de log específico do sebo.

Permissões: `ADMIN`, `EDITOR`, `READER`

---

### Atualizar log
PUT /logs/<log_id>

Descrição: atualiza um registro de log (somente `ADMIN`).

Permissões: `ADMIN`

---

### Listar logs
GET /logs

Descrição: retorna todos os logs do sebo (paginável se necessário).

Permissões: `ADMIN`, `EDITOR`, `READER`

---

## Observações finais
- Todos os endpoints protegem o `sebo_id` e as autorizações via o decorator `permission_required`.
- Campos esperados e nomes (ex.: `conservationState`) são sensíveis — consulte os payloads de cada rota.
- Para performance, as operações de criação/atualização retornam respostas mínimas; o frontend pode solicitar dados completos via GET quando necessário.

``` 
