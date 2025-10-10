Sebos/
  └── {seboID}/
        ├── nameSebo: string
        ├── ownerID: string
        ├── created_at: timestamp = do usuario
        └── Books/
              └── {ISBN}/
                    ├── title: string
                    ├── authors: string
                    ├── publisher: string
                    └── Copies/
                          └── {copyID}/
                                ├── price: number
                                ├── conservation_state: string
                                ├── copyID: string
                                └── registered_at: timestamp


Users/
  └── {userID}/
           ├── nome: string
           ├── email: string
           ├── seboId: string
           ├── funcao: (Admin, Editor, Leitor)
           ├── dataCadastro
           └── nomeSebo
           

Vendas/
   └── {seboID}/
            └── {venda_id}/
                     ├── livro_id : string
                     ├── userID : string
                     ├── title: string
                     ├── category: string
                     ├── price: number
                     ├── rating: number
                     └── timestamp: timestamp     