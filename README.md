<!-- Project README -->
<h1>
    <img align="left" width="48" alt="LinkedIn logo" src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" />
    Volta à Estante
</h1>

## 📖 Sobre o Projeto

**Volta à Estante** é uma plataforma web desenvolvida como TCC para modernizar a gestão de sebos (livrarias de usados). O sistema oferece:

- 📚 **Gestão de Estoque** — Cadastro e controle de livros usando ISBN com integração automática à Google Books API
- 💰 **Registro de Vendas** — Histórico completo e métricas de desempenho
- 👥 **Gerenciamento de Funcionários** — Sistema de permissões (Owner, Editor, Reader)
- 📊 **Dashboard Analítico** — Gráficos interativos com receita, categorias e tendências
- 🔐 **Autenticação Segura** — Firebase Auth com controle granular de acesso

### Frontend
- **React** 19.1 + **Vite** 7.1
- **React Router** 7.9 para navegação
- **TanStack Query** (React Query) para gerenciamento de estado assíncrono
- **Recharts** para gráficos interativos
- **React Icons** para iconografia
- **CSS Modules** para estilos isolados

### Backend
- **Flask** 3.1 (Python REST API)
- **Firebase Admin SDK** para autenticação e Firestore
- **Google Books API** para enriquecimento de dados de livros
- **Flasgger** para documentação Swagger/OpenAPI
- **Flask-CORS** para cross-origin requests

### Infraestrutura
- **Firebase Hosting** (frontend)
- **Firebase Authentication** (gerenciamento de usuários)
- **Firestore** (banco de dados NoSQL)
- **Firebase Storage** (arquivos)

---

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ e npm/yarn
- Python 3.9+
- Conta Firebase (para autenticação e Firestore)

### 1. Clonar o Repositório
```bash
git clone https://github.com/Sabrina1408/Volta-Estante.git
cd Volta-Estante
```

### 2. Configurar o Frontend
```bash
# Instalar dependências
npm install

# Configurar Firebase (crie um projeto em https://console.firebase.google.com)
# Edite src/firebase/config.jsx com suas credenciais Firebase

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse em: `http://localhost:5173`

### 3. Configurar o Backend
```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar Firebase Admin SDK
# Baixe a chave JSON do Firebase e coloque em secret/voltaaestante-XXXXX.json

# Executar API Flask
python app.py
```

API disponível em: `http://localhost:5000`

---

## 📋 Uso

### Primeira Execução
1. Crie uma conta no app (primeiro usuário recebe role Owner automaticamente)
2. Configure dados do sebo no perfil
3. Adicione funcionários via "Gerenciar Funcionários" (apenas Owners)
4. Comece a cadastrar livros usando ISBN


## 📂 Estrutura do Projeto

```
Volta-Estante/
├── src/                      # Código React
│   ├── components/           # Componentes reutilizáveis
│   ├── pages/                # Páginas principais
│   ├── context/              # AuthContext
│   ├── hooks/                # Custom hooks (useApi, etc)
│   ├── utils/                # Helpers (errorMessages, etc)
│   └── firebase/             # Configuração Firebase
├── models/                   # Modelos de dados (backend)
├── services/                 # Lógica de negócio (backend)
├── swagger_docs/             # Documentação da API
├── app.py                    # Servidor Flask
├── requirements.txt          # Dependências Python
├── package.json              # Dependências Node
├── firebase.json             # Configuração Firebase Hosting
└── README.md
```

---

## 🌐 API Endpoints (Resumo)

### Principais Rotas
```
GET    /books              # Listar livros
POST   /books              # Adicionar livro (ISBN + cópias)
GET    /books/<isbn>       # Detalhes de um livro
DELETE /books/<isbn>       # Remover livro

POST   /sales/<isbn>/<copyId>  # Registrar venda
GET    /sales                   # Listar vendas
DELETE /sales/<sale_id>         # Cancelar venda

GET    /users                   # Listar funcionários (Owner)
POST   /users/employees         # Adicionar funcionário (Owner)
PUT    /users/<user_id>         # Atualizar role/perfil
DELETE /users/<user_id>         # Remover funcionário (Owner)

GET    /logs                    # Histórico de alterações
```

Documentação completa: `http://localhost:5000/apidocs` (Swagger)

---
## 👥 Equipe

- **Mauricio de Moraes Coutinho** — [LinkedIn](https://www.linkedin.com/in/mauricio-coutinho-84a758240/)
- **Daniel do Valle** — [LinkedIn](https://www.linkedin.com/in/daniel-do-valle-217483234/)
- **Sabrina Alves Brito** — [LinkedIn](https://www.linkedin.com/in/sabrina-a-brito)

---

## 🌍 App Hospedado

**Acesse a versão online:** [https://voltaaestante.web.app](https://voltaaestante.web.app)

> ⚠️ **Importante:** O backend não está hospedado publicamente. Para testar todas as funcionalidades, é necessário rodar o servidor Flask localmente seguindo as instruções da seção [Instalação e Configuração](#-instalação-e-configuração).

**Para desenvolvimento local:**
1. Siga os passos de instalação (frontend + backend)
2. Execute `npm run dev` para o frontend (`http://localhost:5173`)
3. Execute `python app.py` para a API (`http://localhost:5000`)
4. O frontend local irá consumir a API local automaticamente