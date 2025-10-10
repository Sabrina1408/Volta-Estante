Sebos/
  └── {sebo_id}/
        ├── nomeSebo: string
        ├── proprietarioId: string
        ├── dataCadastro: timestamp = do usuario
        └── Books/
              └── {isbn}/
                    ├── title: string
                    ├── author: string
                    ├── publisher: string
                    └── Copies/
                          └── {copy_id}/
                                ├── price: number
                                ├── conservation_state: string
                                └── registered_at: timestamp


Users/
  └── {user_id}/
           ├── nome: string
           ├── email: string
           ├── seboId: string
           ├── funcaoAdmin: (Admin, Editor, Leitor)
           ├── dataCadastro
           └── nomeSebo
           

Vendas/
   └── {sebo_id}/
            └── {venda_id}/
                     ├── livro_id : string
                     ├── user_id : string
                     ├── title: string
                     ├── category: string
                     ├── price: number
                     ├── rating: number
                     └── timestamp: timestamp     