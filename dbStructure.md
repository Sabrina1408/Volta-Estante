Sebos/
  └── {seboID}/
        ├── nameSebo: string
        ├── seboID: string
        ├── userID: string
        ├── createdAt: datetime
        └── Books/
              └── {ISBN}/
                    ├── ISBN: string
                    ├── title: string    
                    ├── authors: list[string]
                    ├── publisher: string
                    ├── categories: list[string]
                    ├── publishedDate: string
                    ├── description: string
                    ├── pageCount: number
                    ├── ratingsCount: number
                    ├── averageRating: number
                    ├── language: string
                    ├── maturityRating: string
                    ├── thumbnail: string
                    ├── smallThumbnail: string
                    ├── textSnippet: string
                    ├── totalQuantity: number
                    └── Copies/
                          └── {copyID}/
                                ├── copyID: string
                                ├── conservationState: string
                                ├── price: number
                                └── registeredAt: datetime


Users/
  └── {userID}/
           ├── userID: string
           ├── name: string
           ├── email: string
           ├── nameSebo: string
           ├── seboId: string
           ├── userRole: (Admin, Editor, Reader) string
           └── registeredAt: datetime
           
           

Sales/
   └── {seboID}/
            └── {saleID}/
                     ├── saleID: string
                     ├── userID : string
                     ├── ISBN : string
                     ├── bookTitle: string
                     ├── bookCategory: string
                     ├── bookPrice: number
                     ├── bookRating: number
                     └── saleDate: datetime


AlterationLog/ 
      └── {seboID}/
            └── {logId}/
                  ├── logId: string
                  ├── ISBN: string
                  ├── userId: string
                  ├── userEmail: string
                  ├── action: (qual endpoint ele chamou (?))
                  └── executedAt: datetime
