// Catálogo de produtos - Miniatura Brand & Miniatura Árabe
const PRODUCTS = [
  {
    "id": "008-brand-collection-vip-25ml",
    "name": "008 Brand Collection VIP - 25ml",
    "price": 100,
    "img": "assets/produtos/008-brand-collection-vip-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "133-eternit-brand-collection-25ml",
    "name": "133 - Eternit - Brand Collection 25ml",
    "price": 100,
    "img": "assets/produtos/133-eternit-brand-collection-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "161-come-back-men-25ml-brand-collection",
    "name": "161 Come Back Men 25ml - Brand Collection",
    "price": 100,
    "img": "assets/produtos/161-come-back-men-25ml-brand-collection.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "alien-mugler-brand-collection-no-043-25ml",
    "name": "Alien Mugler Brand Collection No. 043 - 25ml",
    "price": 100,
    "img": "assets/produtos/alien-mugler-brand-collection-no-043-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "angel-mugler-brand-collection-no-168-20ml",
    "name": "Angel Mugler Brand Collection No. 168 - 20ml",
    "price": 110,
    "img": "assets/produtos/angel-mugler-brand-collection-no-168-20ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "armani-stronger-with-you-brand-collection-no-232-25ml",
    "name": "Armani Stronger with you Brand Collection No. 232 - 25ml",
    "price": 100,
    "img": "assets/produtos/armani-stronger-with-you-brand-collection-no-232-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-376-inspiracao-le-beau-jean-paul",
    "name": "Brand 376- Inspiração Le beau Jean Paul",
    "price": 100,
    "img": "assets/produtos/brand-376-inspiracao-le-beau-jean-paul.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-391-inspiracao-valentino-donna-born-in-roma-valentino",
    "name": "Brand 391 inspiração Valentino Donna Born In Roma Valentino",
    "price": 100,
    "img": "assets/produtos/brand-391-inspiracao-valentino-donna-born-in-roma-valentino.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-447-imagination-louis-vitton",
    "name": "Brand 447 Imagination Louis Vitton",
    "price": 100,
    "img": "assets/produtos/brand-447-imagination-louis-vitton.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-022-decadence-25ml",
    "name": "Brand Collection - 022 Decadence 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-022-decadence-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-054-aventos-inspiracao-creed-aventus-25ml",
    "name": "Brand Collection - 054 Aventos - INSPIRAÇÃO CREED AVENTUS - 25ML",
    "price": 100,
    "img": "assets/produtos/brand-collection-054-aventos-inspiracao-creed-aventus-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-167-water-drop-25ml",
    "name": "Brand Collection - 167 Water Drop 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-167-water-drop-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-225-bombshell-25ml",
    "name": "Brand Collection - 225 BombShell 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-225-bombshell-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-235-bvlgari-rose-25ml",
    "name": "Brand Collection - 235 Bvlgari Rose 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-235-bvlgari-rose-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-285-joop-pour-homme-25-ml",
    "name": "Brand Collection - 285 Joop Pour Homme 25 ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-285-joop-pour-homme-25-ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-289-rouge-royal-25ml",
    "name": "Brand Collection - 289 Rouge Royal 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-289-rouge-royal-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-315-sauvage-elixir-25ml",
    "name": "Brand Collection - 315 Sauvage Elixir 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-315-sauvage-elixir-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-323-le-manly-elixir-masculino-25ml",
    "name": "Brand Collection - 323 Le Manly Elixir Masculino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-323-le-manly-elixir-masculino-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-325-le-manly-parfum-masculino-25ml",
    "name": "Brand Collection - 325 Le Manly Parfum Masculino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-325-le-manly-parfum-masculino-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-336-my-way-intense-25ml",
    "name": "Brand Collection - 336 My Way Intense 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-336-my-way-intense-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-402-herba-unissex-25ml",
    "name": "Brand Collection - 402 Herba Unissex 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-402-herba-unissex-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-424-olympic-extrait-feminino-25ml",
    "name": "Brand Collection - 424 Olympic Extrait Feminino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-424-olympic-extrait-feminino-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-427-robotic-masculino-25ml",
    "name": "Brand Collection - 427 Robotic Masculino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-427-robotic-masculino-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-001-inspiracao-allure-25-ml",
    "name": "Brand Collection 001 - Inspiração Allure - 25 ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-001-inspiracao-allure-25-ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-005-inspiracao-one-million-25ml",
    "name": "Brand Collection 005 - Inspiração One Million - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-005-inspiracao-one-million-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-007-inspiracao-no-jadore-25ml",
    "name": "Brand Collection 007 - Inspiração no J'adore - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-007-inspiracao-no-jadore-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-009-inspiracao-212-vip-25ml",
    "name": "Brand Collection 009 - Inspiração 212 VIP - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-009-inspiracao-212-vip-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-011-inspiracao-angel-iced-star-mugler-25ml",
    "name": "Brand Collection 011 - Inspiração Angel Iced Star Mugler - 25ml",
    "price": 110,
    "img": "assets/produtos/brand-collection-011-inspiracao-angel-iced-star-mugler-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-014-inspiracao-miss-dior-blooming-bouquet-25ml",
    "name": "BRAND COLLECTION 014 - INSPIRAÇÃO MISS DIOR BLOOMING BOUQUET - 25ML",
    "price": 100,
    "img": "assets/produtos/brand-collection-014-inspiracao-miss-dior-blooming-bouquet-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-024-bright-crystal-feminino-25ml",
    "name": "Brand Collection 024- Bright Crystal - Feminino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-024-bright-crystal-feminino-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-027-inspiracao-hipnotic-poison-25ml",
    "name": "Brand Collection 027- Inspiração Hipnotic Poison - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-027-inspiracao-hipnotic-poison-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-028-hugo-boss-masculino-25ml",
    "name": "Brand Collection 028 - Hugo Boss - Masculino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-028-hugo-boss-masculino-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-031-inspiracao-chance-eau-tendre-25ml",
    "name": "Brand Collection 031 - Inspiração Chance Eau Tendre - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-031-inspiracao-chance-eau-tendre-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-034-inspiracao-212-vip-rose-25ml",
    "name": "Brand Collection 034 - Inspiração 212 Vip Rose - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-034-inspiracao-212-vip-rose-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-036-eau-de-toilette-brand-collection-25ml-feminino",
    "name": "Brand Collection 036 Eau de Toilette Brand Collection 25ml - Feminino",
    "price": 100,
    "img": "assets/produtos/brand-collection-036-eau-de-toilette-brand-collection-25ml-feminino.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-039-inspiracao-chanel-chance-25ml",
    "name": "Brand Collection 039 - Inspiração Chanel Chance - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-039-inspiracao-chanel-chance-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-060-inspiracao-narciso-her-25ml",
    "name": "BRAND COLLECTION 060 - INSPIRAÇÃO NARCISO HER - 25ML",
    "price": 100,
    "img": "assets/produtos/brand-collection-060-inspiracao-narciso-her-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-063-inspiracao-si-tradicional-25ml",
    "name": "Brand Collection 063 - Inspiração Sí Tradicional - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-063-inspiracao-si-tradicional-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-064-inspiracao-elie-saab-parfum-25ml",
    "name": "Brand Collection 064 - Inspiração Elie Saab Parfum - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-064-inspiracao-elie-saab-parfum-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-066-inspiracao-silver-scent-25ml",
    "name": "Brand Collection 066 - Inspiração Silver Scent - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-066-inspiracao-silver-scent-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-069-inspiracao-la-nuit-tresor",
    "name": "Brand Collection 069 - Inspiração La Nuit Trésor",
    "price": 100,
    "img": "assets/produtos/brand-collection-069-inspiracao-la-nuit-tresor.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-070-inspiracao-bleu-de-chanel-25-ml",
    "name": "Brand Collection 070 - Inspiração Bleu de Chanel -25 ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-070-inspiracao-bleu-de-chanel-25-ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-084-inspiracao-legend-montblanc-25ml",
    "name": "Brand Collection 084 - Inspiração Legend Montblanc - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-084-inspiracao-legend-montblanc-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-091-inspiracao-euphoria-man-25ml",
    "name": "Brand Collection 091 - Inspiração Euphoria Man - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-091-inspiracao-euphoria-man-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-092-inspiracao-mon-paris-25ml",
    "name": "BRAND COLLECTION 092 - INSPIRAÇÃO MON PARIS - 25ML",
    "price": 100,
    "img": "assets/produtos/brand-collection-092-inspiracao-mon-paris-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-095-bloom-di-fiori-feminino-25ml",
    "name": "Brand Collection 095 - Bloom Di Fiori - Feminino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-095-bloom-di-fiori-feminino-25ml.jpg",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-097-euphoria-feminino-25ml",
    "name": "Brand Collection 097 - Euphoria - Feminino 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_CBF96E0A-CCF1-4AC6-BE1A-47D82BCD0F14.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-100-inspiracao-sauvage-25ml",
    "name": "Brand Collection 100 - Inspiração Sauvage - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_61437e32-44fb-40ec-8fce-ab7c684bd251.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-102-inspiracao-212-men-25ml",
    "name": "Brand Collection 102 - Inspiração 212 Men - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_GBZHjBoMPKfzmmOzCf49oA%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-109-kenzo-world-feminino-25ml",
    "name": "Brand Collection 109 Kenzo World - Feminino - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_A108959A-4A9E-4113-A09F-58A9200DFFB9.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-116-inspiracao-invictus-25ml",
    "name": "BRAND COLLECTION 116 - INSPIRAÇÃO INVICTUS - 25ML",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_2E4D3BA2-4783-4D48-9A62-CADDC02C33ED.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-124-high-heel-glitter",
    "name": "Brand Collection 124 - High Heel Glitter",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_A8C7EA57-95BB-4A3E-8A2D-2FA73488431A.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-126-inspiracao-good-girl",
    "name": "Brand Collection 126 - Inspiração Good Girl",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_E0250C19-5C42-463A-972F-C727FB615756.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-132-inspiracao-fantasy-25ml",
    "name": "Brand Collection 132 - Inspiração Fantasy - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_60c6cfb8-d1d1-4dd6-80b2-b70706ec274a.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-134-inspiracao-gabrielle-chanel-25ml",
    "name": "Brand Collection 134 - Inspiração Gabrielle Chanel - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_6F53726C-B28E-4BA2-B38C-AC70483EF65B.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-135-25ml-perfume-masculino",
    "name": "Brand Collection 135 25ml - Perfume Masculino",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_4a243416-2ec7-4f4c-844d-86218614d4bb.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-136-inspiracao-scandal-25ml",
    "name": "Brand Collection 136 - Inspiração Scandal - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_bb4eabc2-5eaf-4394-8279-72d6b69cd3b2.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-151-inspiracao-delina-25ml",
    "name": "Brand Collection 151- Inspiração Delina - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_598F0C62-BCDC-4FE8-911F-019BFBAD5D31.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-152-inspiracao-meliora-parfums-de-marly-25ml",
    "name": "Brand Collection 152 - Inspiração Meliora Parfums de Marly - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_3EE3E13E-CB3F-41A5-A05D-F2B9DAA22A00.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-153-inspiracao-jean-paul-le-male-25ml",
    "name": "Brand Collection 153- Inspiração Jean Paul Lê male - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_25cd460f-b641-4b3c-b288-8fe9a981a277.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-155-inspiracao-acqua-di-gio-giorgio-armani-25ml",
    "name": "Brand Collection 155 - Inspiração Acqua di Giò Giorgio Armani - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_EC3467B0-0908-41DF-A310-0BA4AA15106C.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-156-classic-men-s-25ml",
    "name": "Brand Collection 156 - Classic Men S - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_4A9981B6-97A7-43E4-99FB-5D3A87FAE282.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-159-inspiracao-libre-eau-de-parfum-yves-saint-laurent-25ml",
    "name": "Brand Collection 159 - Inspiração Libre Eau de Parfum Yves Saint Laurent - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_ABBD647E-4934-4025-8A33-2EBD6370A74A.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-163-inspiracao-hypnose-25ml",
    "name": "Brand Collection 163 - Inspiração Hypnose - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_05caea67-25e1-477f-b550-874829e52b7e.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-164-inspiracao-armani-code-25ml",
    "name": "BRAND COLLECTION 164 - INSPIRAÇÃO ARMANI CODE - 25ML",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_79902F67-6C14-4AFE-97F6-44B42321D2F1.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-170-dylan-blue-masculino-25ml",
    "name": "Brand Collection 170 - Dylan Blue - Masculino - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_1ef885b9-440b-446f-b18a-c4d4609076af.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-172-blue-tea-masculino-25ml",
    "name": "Brand Collection 172 - Blue Tea - Masculino - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_0EA97393-78B8-49F9-AB62-2848049AC0D3.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-172-inspiracao-blv-pour-homme-bvlgari-25ml",
    "name": "Brand Collection 172 - Inspiração BLV Pour Homme Bvlgari - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_d819b585-b5b1-4718-bbd9-7a74cce2dd3a.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-173-inspiracao-good-girl-legere-25ml",
    "name": "Brand Collection 173 - Inspiração Good Girl Legere - 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_b6b9d6e9-6a46-4655-8532-3cd8912d3ea1.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-177-inspiracao-chloe-eau-de-parfum",
    "name": "Brand Collection 177 - Inspiração Chloe Eau de Parfum",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_2307DA77-8B62-418A-B32E-45E65E13052F.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-178-inspiracao-pure-xs-men-25ml",
    "name": "BRAND COLLECTION 178 - INSPIRAÇÃO PURE XS MEN - 25ML",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_58016ADA-298C-4D9A-B86F-24FB05DD6EF8.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-188-25ml-ref-my-way",
    "name": "Brand Collection 188 - 25ML (Ref.My Way)",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_CD839A29-1885-4F90-8C12-33010AF254CE.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-193-inspiracao-good-girl-velvet-fatale-25ml",
    "name": "Brand Collection 193 - Inspiração Good Girl Velvet Fatale - 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_45D86F28-2222-439C-9B4A-8EF249BFCCBD.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-200-inspiracao-miu-miu-l-eau-rosee-25ml",
    "name": "Brand Collection 200 - Inspiração Miu Miu L'Eau Rosée - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_AC32862C-A27B-409A-AC6B-0659578AF60A.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-202-inspiracao-black-xs-men",
    "name": "Brand Collection 202 - Inspiração BLACK XS MEN",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_32609B9A-2DC1-457A-A1A2-4C88F5B7DFBE.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-210-inspiracao-pure-xs-25ml",
    "name": "Brand Collection 210 - Inspiração Pure XS - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_f6a3ef9b-1c2f-4521-bbeb-9180ae372943.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-214-inspiracao-invictus-victory-25ml",
    "name": "BRAND COLLECTION 214 - INSPIRAÇÃO INVICTUS VICTORY- 25ML",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_3349B90E-FD18-44BD-9B19-D7B19B587EFC.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-216-inspiracao-flower-by-kenzo-25ml",
    "name": "Brand Collection 216 - Inspiração Flower by Kenzo - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_CBA855A6-34A2-4F2B-B03E-0B0F4D84C45E.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-220-inspiracao-giorgio-armani-acqua-di-gio-profumo-25ml",
    "name": "Brand Collection 220 - Inspiração Giorgio Armani Acqua di Giò Profumo - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_1A60E138-3353-4241-8D7A-D91254FA7FFA.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-233-inspiracao-because-it-s-you-25ml",
    "name": "Brand Collection 233 - Inspiração Because It's You - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_3761FCD8-F5A7-4CCF-A1D9-4D3AF8C77829.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-234-inspiracao-bvlgari-petits-et-mamans-perfume-infantil-25ml",
    "name": "Brand Collection 234 - Inspiração Bvlgari Petits et Mamans (Perfume Infantil) - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_34E58C3C-AFBC-40A9-8641-B8EA18932C2B.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-238-inspiracao-idole-25ml",
    "name": "Brand Collection 238 - Inspiração Idôle - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_25187bae-8610-4da7-865a-34335db169ef.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-239-inspiracao-joy-25ml",
    "name": "Brand Collection 239 - Inspiração Joy - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_60156214-34c2-4ab9-bae9-12bd676e65a8.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-240-inspiracao-212-tradicional-25ml",
    "name": "BRAND COLLECTION 240 - INSPIRAÇÃO 212 TRADICIONAL - 25ML",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_FC0B11D7-53B1-430D-8408-4BFECDD43F51.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-246-inspiracao-burberry-her-25ml",
    "name": "BRAND COLLECTION 246 - INSPIRAÇÃO BURBERRY HER - 25ML",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_5F0E60F5-ED80-4AD5-A76B-BB3F06E52411.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-250-inspiracao-wanted-boy-25-ml",
    "name": "Brand Collection 250 - Inspiração Wanted boy - 25 ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_de620b5c-147f-48f3-a316-ccff257da131.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-253-inspiracao-la-vie-est-belle-l-eclat-25ml",
    "name": "Brand Collection 253 - Inspiração La Vie Est Belle L'Éclat - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_C43DA1EB-3177-432B-A7B3-5B9C8012377E.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-265-25ml-perfume-feminino",
    "name": "Brand Collection 265 25ml - Perfume Feminino",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_ED953BD6-F4E9-467A-AD5D-094EB9C95A43.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-286-inspiracao-ferrari-black-25ml",
    "name": "Brand Collection 286 - Inspiração Ferrari Black - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_801e4fa2-7121-4634-94e0-9ae4c4bec5d5.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-293-inspiracao-idole-intense-25ml",
    "name": "Brand Collection 293 - Inspiração Idôle Intense - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_6bca9af4-0cd2-4dfe-b2a6-043a76dc99f5.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-294-inspiracao-l-interdit-rouge-25ml",
    "name": "Brand Collection 294 - Inspiração L'Interdit Rouge - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_309EB3D6-2E80-4883-8387-5F390EF1EB9F.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-295-inspiracao-cloud-ariana-grande-25ml",
    "name": "Brand Collection 295 - Inspiração Cloud Ariana Grande - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_6D2E5889-63F7-4692-BCBA-39B3B352F24D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-296-plantom-25ml",
    "name": "BRAND COLLECTION 296-PLANTOM 25ML-",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_4E24363F-E79E-4AC8-BF16-BDFF8BAB0AA8.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-303-inspiracao-d-g-devotion-25ml",
    "name": "Brand Collection 303 - Inspiração D&G Devotion - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_0343CCCC-1F2F-4FEB-BAB9-005819EB14D0.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-316-inspiracao-scandal-gold-25ml",
    "name": "Brand Collection 316 - Inspiração Scandal Gold - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_349828A4-66E4-45AB-9574-9DCFDCF331F1.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-320-inspiracao-chloe-naturelle-25ml",
    "name": "Brand Collection 320 - Inspiração Chloé Naturelle - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_cec903d1-b6fb-4675-90a7-059a46aa6f86.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-322-very-good-lady-elixir-feminino-25ml",
    "name": "Brand Collection 322 - Very Good Lady Elixir Feminino 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_A5DB858F-2345-44EF-A136-89195A927667.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-329-inspiracao-fame-couture-25-ml",
    "name": "Brand collection 329 - Inspiração Fame Couture - 25 ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_9B14E90E-7BAE-4264-BE0B-3D10EB972049.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-340-inspiracao-212-heroes-forever-25ml",
    "name": "Brand Collection 340 - Inspiração 212 Heroes Forever - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_a8ff19a5-72a7-45c8-a7a8-342843f0245e.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-350-inspiracao-invictus-platinum-25ml",
    "name": "Brand Collection 350 - Inspiração Invictus Platinum - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_ec254527-00fc-4b5b-b5b9-4a2664770fd0.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-351-inspiracao-versace-dylan-turquoise-pour-femme-25ml",
    "name": "Brand Collection 351 - Inspiração Versace Dylan Turquoise Pour Femme - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_2E20AFD3-718A-487A-BBED-07AA942D18A3.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-356-inspiracao-j-adore-parfum-d-eau-25ml",
    "name": "Brand Collection 356 - Inspiração J'adore Parfum d'Eau - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_FFE0CF15-B683-4D35-B69B-E701C9248793.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-365-inspiracao-fame-25ml",
    "name": "Brand Collection 365 - Inspiração Fame - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_C817AE14-5523-4068-9337-CD2AD9FF46FB.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-367-inspiracao-valaya-pafums-de-marly-25ml",
    "name": "Brand Collection 367 - Inspiração Valaya Pafums de Marly - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_C99335A0-5CEC-4A89-96D5-C9B6E5DC56EF.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-370-inspiracao-dylan-purple-25ml",
    "name": "Brand Collection 370 - Inspiração Dylan Purple - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_797d2ee2-59ca-40b7-b4c7-d2a6ed9d8333.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-371-inspiracao-fantasy-naked-britney-spears-25ml",
    "name": "Brand Collection 371 - Inspiração Fantasy Naked Britney Spears - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_81A17350-E558-466A-BCBF-9BD958FC0EFF.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-372-beauty-girl-gold-f-feminino-25ml",
    "name": "Brand Collection 372 - Beauty Girl Gold F. Feminino 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_46EF2D08-E9DB-4FC5-B119-41D54636498C.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-373-inspiracao-q-by-dolce-gabbana-25ml",
    "name": "Brand Collection 373 - Inspiração Q by Dolce & Gabbana - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_CEABEB53-950E-410A-BE22-159BA0AD02EA.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-374-inspiracao-black-opium-le-parfum-25ml",
    "name": "Brand Collection 374 - Inspiração Black Opium Le Parfum - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_347E19E8-C2ED-4AEE-930C-11DA0BF83A84.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-380-inspiracao-baccarat-rouge-extrait-25ml",
    "name": "Brand Collection 380 - Inspiração Baccarat Rouge Extrait - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_250672a7-f233-429d-846f-73fa5ada8560.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-382-inspiracao-l-interdit-25ml",
    "name": "Brand Collection 382 - Inspiração L'Interdit - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_045809a4-8fba-43f4-a2fb-a4d7ae24713e.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-387-inspiracao-the-most-wanted-azzaro-25ml",
    "name": "Brand Collection 387 - Inspiração The Most Wanted Azzaro - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_F9E1CFF3-2664-4AA8-84B4-648BE1F6667F.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-394-inspirado-no-toy-boy-25-ml",
    "name": "Brand Collection 394 - Inspirado no Toy Boy - 25 ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_9B3220BB-25EF-4A9F-8D23-85A3120DC6F2.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-395-inspiracao-toy-2-bubble-gum-moschino-25ml",
    "name": "Brand Collection 395 - Inspiração Toy 2 Bubble Gum Moschino - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_2e9a32e2-c94e-4ed3-aebe-5723de4b5da4.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-396-inspiracao-toy-2-moschino-25ml",
    "name": "Brand Collection 396 - Inspiração Toy 2 Moschino - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_254f8dfa-23c3-41ea-93ed-d3f49bfb6bda.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-402-inspiracao-erba-pura-25ml",
    "name": "Brand Collection 402 - Inspiração Erba Pura - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_c02dd7d5-2d3f-4f64-958e-6c83d2b9270a.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-410-inspiracao-dolce-gabbana-dolce-gabbana-25ml",
    "name": "Brand Collection 410 - Inspiração Dolce&Gabbana Dolce&Gabbana - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_8904a865-c296-4361-af93-d8aa8be7a0c3.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-414-inspiracao-boucheron-quatre-25ml",
    "name": "Brand Collection 414 - Inspiração Boucheron Quatre - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_B426663E-81B5-4F48-B790-7BA2C454C5BB.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-415-inspiracao-fame-parfum-25ml",
    "name": "Brand Collection 415 - Inspiração Fame Parfum - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_ba9458e9-8671-4e5d-bdf8-4e98f812da68.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-420-inspiracao-bonne-etoile-baby-dior-25ml-infantil",
    "name": "Brand Collection 420 - Inspiração Bonne Étoile Baby Dior - 25ml (Infantil)",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_2AC003B0-D3E6-4E62-B6DC-32014C41FEBC.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-423-inspiracao-invictus-parfum-25ml",
    "name": "Brand Collection 423 - Inspiração Invictus Parfum - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_593C7213-1013-4075-9BFC-9DD9FA2999B6.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-433-inspiracao-myself-25ml",
    "name": "Brand Collection 433 - Inspiração Myself - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_7f26ec5f-093e-4afe-88f2-a6e0392ea058.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-435-burberry-goddess-inspired-perfume-feminino-eau-de-parfum-25ml",
    "name": "Brand Collection 435 – Burberry Goddess Inspired – Perfume Feminino – Eau de Parfum – 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_113FA3CD-AF05-4DEF-8435-BD8E52C8D755.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-440-25ml-inspirado-no-phantom-elixir-da-paco-rabanne",
    "name": "Brand Collection 440 25ml inspirado no Phantom Elixir da Paco Rabanne.",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_83A627E3-CCB9-4487-BA5F-B555DE528A8B.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-445-inspiracao-paradoxe-25ml",
    "name": "Brand Collection 445 - Inspiração Paradoxe - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_9817DC8A-E057-46DF-88A9-822902A214BB.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-n-321-scandal-masculino-25-ml",
    "name": "BRAND COLLECTION N 321 SCANDAL MASCULINO 25 ML",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_02428940-D59C-4D74-A485-98FB4B40B1AB.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "brand-collection-n385-e-um-perfume-feminino-de-25ml-wanted-girl-by-night",
    "name": "Brand Collection N°385 é um perfume feminino de 25ml Wanted Girl By Night",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_DA7CF183-E7FD-49C2-A8F6-01460E7D9D7B.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "ch-brand-collection-no-003-25ml",
    "name": "CH Brand Collection No. 003 - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_GXYaDORhGQuJ1fLIUYyEsg%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "coco-mademoselle-brand-collection-no-021-25ml",
    "name": "Coco Mademoselle Brand Collection No. 021 - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_qp9YWLdmMgmLGrAUur0m1A%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "delina-brand-collection-no-151-25ml",
    "name": "Delina Brand Collection No. 151 - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_bq%2BsdMwjN9Lkxnuu6RrsA%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "divine-jean-paul-brand-collection-no-205-25ml",
    "name": "Divine Jean Paul Brand Collection No. 205 - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_zpwS75CMJDN%2Bk5yrDNxEUA%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "dream-brand-collection-no-012-inspiracao-la-vie-25ml",
    "name": "Dream Brand Collection No. 012 - Inspiração La Vie - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_r1m8Qin7RuI05DHRsR61Q%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "dream-brand-collection-154-inspiracao-212-vip-black-25ml",
    "name": "Dream Brand Collection 154 - Inspiração 212 Vip Black - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_3d404fe9-b3cc-477d-a92d-bb643b309153.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "dream-brand-collection-194-inspiracao-212-sexy-25ml",
    "name": "Dream Brand Collection 194 - Inspiração 212 Sexy - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_fb6e1771-1fc7-47ce-94f1-652eeb61857c.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "eau-de-parfum-feminino-brand-collection-n342-miss-rose-25ml",
    "name": "Eau de Parfum Feminino Brand Collection N°342 Miss Rose 25mL",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_CBE8E411-FBBE-42E2-872D-A0826E42196F.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "eau-de-parfum-masculino-dream-brand-collection-azzaro-25ml-aromatico",
    "name": "Eau de parfum masculino Dream Brand Collection Azzaro 25ml Aromático",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_EA2096AB-6BB0-4078-80B2-D307A6717AF9.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "la-belle-le-parfum-brand-collection-no-324-25ml",
    "name": "La Belle Le Parfum Brand Collection No. 324 - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_arlAf3yghbNTshJyzv9XQ%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "lady-million-collection-no-105-eau-de-parfum-25ml",
    "name": "Lady Million Collection No. 105 - Eau de Parfum 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_tKziFhzChACidnlXvo9Hg%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "ligth-blue-brand-collection-no-093-25ml",
    "name": "Ligth Blue Brand Collection No. 093 - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_oS6%2B2LZwtvddnHL%2Bz0tThQ%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "miniatura-brand-collection-no-242-versace-eros-25ml",
    "name": "Miniatura Brand Collection Nº 242 Versace Eros 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_B7089BED-D17A-48C2-88A3-93EC81A75E01.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "olympea-brand-collection-no-087",
    "name": "Olympéa Brand Collection No. 087",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_VdoEOzD1gOlev53%2BCA9X4g%3D%3D.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-brand-190-inspiracao-animale-25-ml",
    "name": "Perfume Brand 190 - Inspiração Animale - - 25 ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_851CD4DA-2EF0-4134-8D76-0B101DE26252.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-brand-collection-055-inspiracao-black-opium-25ml",
    "name": "Perfume Brand Collection 055 - Inspiração Black Opium - 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_55568402-64C7-4D54-988F-86FB1E9DD768.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-brand-collection-170-eau-de-parfum-25-ml-intenso-inverno",
    "name": "Perfume Brand Collection 170 Eau de Parfum 25 mL Intenso Inverno",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_33EB5BA3-9751-4955-9D22-5F10F0388641.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-brand-collection-b-349-eau-de-parfum-25ml-spray-citrico",
    "name": "Perfume Brand Collection B-349 Eau de Parfum 25ml Spray Cítrico",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_F78192D7-9B17-4E0A-8B50-2E5A2A35FCE1.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-brand-collection-n-015-miniatura-25ml",
    "name": "Perfume Brand Collection N° 015 Miniatura 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_E731745B-71EA-451B-9609-8D2D8FF4F1DF.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-brand-collection-n-407-inspiracao-naxos-25ml",
    "name": "PERFUME BRAND COLLECTION n° 407 - INSPIRAÇÃO NAXOS - 25ML",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_E1ECCCA5-27DE-42C8-AB4B-6F29CF0F58BB.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-brand-collection-n176-feminino-25-ml",
    "name": "Perfume Brand Collection N°176 - Feminino 25 Ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_F090ECF8-4394-4A06-8234-E966DE77803E.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-brand-collection-no-425-masculino-25ml",
    "name": "Perfume Brand Collection No 425 - Masculino 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_81C0E7F0-97C6-4ACA-87C1-D853BA23AB35.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-brand-collection-no-108-edp-masculino-25ml",
    "name": "Perfume Brand Collection No.108 EDP Masculino 25ml",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_4D7B9987-2D57-46CE-A9D8-931B309B3B5F.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-masculino-brand-collection-n213-amadeirado-25ml-vegan",
    "name": "Perfume Masculino Brand Collection N213 Amadeirado 25ml Vegan",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_54C7F5CA-4E95-4A74-936D-116B073C72C2.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-masculino-miniatura-brand-collection-no-181-25ml-edp",
    "name": "Perfume Masculino Miniatura Brand Collection No 181 25ml Edp",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_980B5681-BAC9-475A-B94C-DAA181123A26.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-miu-brand-collection-no-115-spray-25ml-eau-de-parfum-floral-feminino",
    "name": "Perfume Miu Brand Collection Nº 115 Spray 25mL Eau de Parfum Floral Feminino",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_F7788E67-DB86-4925-97CA-AE2AEB8FA3FD.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-n-004-ch-man-eau-de-parfum-brand-collection-25ml-masculino",
    "name": "Perfume N° 004 CH man Eau de Parfum Brand Collection 25ml - Masculino",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_2C73CA38-67AE-43F8-852A-A0C412DA0F18.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "perfume-n-224-eau-de-parfum-brand-collection-25ml-masculino",
    "name": "Perfume N° 224 Eau de Parfum Brand Collection 25ml - Masculino",
    "price": 100,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_CEE314E9-702C-4583-A52E-A7EAEB0ECBC0.jpg?alt=media",
    "category": "miniatura-brand"
  },
  {
    "id": "01-arabic-collection-fakhar-rose",
    "name": "01 - Arabic Collection - Fakhar Rose",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_dfd53a4e-aa3f-4035-a995-c903cecf4829.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a001-arabic-collection-inspiracao-arabe-asad-25ml",
    "name": "A001 Arabic Collection - Inspiração Árabe Asad - 25ML",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_de876604-4cf8-4468-a8c3-bf7d48e37fc0.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a002-arabic-collection-inspiracao-yara-rose-fem-25ml",
    "name": "A002 - Arábic Collection inspiração Yara Rose FEM 25ML",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_362aa722-f021-4cac-9497-487f14add8dd.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a005-arabic-collection-inspiracao-khamrah-masculino-25ml",
    "name": "A005 - Arabic Collection inspiração Khamrah Masculino 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_ffad2e15-c024-4e0b-898d-01c996d92a23.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a007-arabic-collection-inspiracao-fakhar-black-masc-25ml",
    "name": "A007 - Arábic Collection inspiração Fakhar Black MASC 25ML",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_a669953e-f193-42bf-9c5d-d43a1a3ec0b1.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a008-arabic-collection-fakhar-ouro",
    "name": "A008 - Arabic Collection - Fakhar Ouro",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_054b3f96-f3b4-43e5-adc9-5989a5b19823.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a010-arabic-collection-gloria-25ml",
    "name": "A010 Arabic Collection - Glória - 25ML",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_c16be7a0-1898-4898-b104-441c8989af60.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a013-attar-al-wesal-arabic-collection-25-ml",
    "name": "A013 Attar Al Wesal - Arabic Collection - 25 ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_28bc62de-9eff-4bf6-adf2-75fa47233129.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a014-arabic-collection-inspiracao-sabah-al-ward-25ml",
    "name": "A014 - Arábic Collection inspiração Sabah Al Ward 25ML",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_502a9836-6666-4bf7-82e2-3f7c3afd1b22.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a016-miniatura-arabic-serenidade-feminino-25ml",
    "name": "A016 Miniatura Arabic Serenidade - Feminino 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_87688759-b1da-49b0-baab-20a53a91ccdf.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a017-arabic-collection-inspiracao-tharwah-gold-25ml",
    "name": "A017 - Arábic Collection inspiração Tharwah Gold 25ML",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_ccc2c627-7f63-46b9-97ef-360786a578b4.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a021-club-de-nuit-precieux-arabic-collection",
    "name": "A021 Club de Nuit Precieux - Arabic Collection",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_8f7cc395-1bcd-4b0f-8324-4124e0cc7a7d.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a027-arabic-collection-inspiracao-club-de-nuit-iconic-25ml",
    "name": "A027 Arabic Collection - Inspiração Club De Nuit Icônic - 25ML",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_52d8b869-8ecc-4cad-92c3-c82b247472a3.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a031-arabic-collection-inspiracao-the-kingdom-masculino-25ml",
    "name": "A031 - Arabic Collection inspiração The Kingdom Masculino 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_41ab8a05-3025-423f-94a0-7a2f76c53e6a.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a033-yara-candy-arabic-collection-25ml",
    "name": "A033 Yara Candy - Arabic Collection 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_06aa5dda-10de-4d2f-8c02-9f7e80cffbf9.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "a034-asad-bourbon-arabic-collection-25-ml",
    "name": "A034 Asad Bourbon - Arabic Collection - 25 ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_936251aa-a97e-49ec-8482-0f8b065ce79e.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "arabe-arabic-collection-rouge-ambar",
    "name": "Árabe Arabic Collection Rouge Âmbar",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_40B06375-30DF-498B-9FCB-7844FBC59E65.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "arabic-al-noble-wazeer-collection-a019-25ml",
    "name": "Arabic Al Noble Wazeer Collection A019 - 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_5D8FC53A-514E-4343-887B-F076602EAE05.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "arabic-collection-a018-musam-branco-25ml",
    "name": "Arabic Collection A018 - Musam Branco - 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_ad50d8e8-1629-4fea-88d6-63abb9ab1fab.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "arabic-collection-a020-spectro-25ml",
    "name": "Arabic Collection A020 - Spectro - 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_A4695579-AEEB-4B4A-B482-85F4FCC65486.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "arabic-collection-a024-ambar-real-25ml",
    "name": "Arabic Collection A024 - Âmbar Real - 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_7a683868-ce66-4d62-af35-bfa5f8b3855d.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "arabic-collection-a040-inspiracao-dania-25ml",
    "name": "Arabic Collection A040 - Inspiração Dania - 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_6CEEA94E-3F52-4874-A01A-1FEA2495C217.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "miniatura-a003-yara-tous-arabic-collection",
    "name": "Miniatura A003 Yara Tous - Arabic Collection",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_34ee0fb6-1924-4014-8b31-32dede906435.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "miniatura-club-de-nuit-arabic-collection-eau-de-parfum-masculino-25ml-perfume-arabe",
    "name": "Miniatura Club de Nuit Arabic Collection Eau de Parfum Masculino 25ml [Perfume Árabe]",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_F1235BE5-F3FE-45E5-BE22-02DF3DE06EEB.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "perfume-arabe-compartilhavel-ameer-arabic-collection-a038-25ml-ref-olfativa-al-noble-ameer-lattafa",
    "name": "Perfume Árabe Compartilhável Ameer Arabic Collection A038 - 25ml (Ref. Olfativa: Al Noble Ameer Lattafa)",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_9AC032E9-199D-4E7C-8949-0D5F7713D366.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "perfume-arabic-minha-essencia-a004-feminino-25ml",
    "name": "Perfume Arabic Minha Essencia A004 - Feminino 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_89A48E86-04D3-4BE5-B766-5DB95502FCE6.jpg?alt=media",
    "category": "miniatura-arabe"
  },
  {
    "id": "perfume-blush-nobre-a025-arabic-collection-perfume-feminino-25ml",
    "name": "Perfume Blush Nobre A025 - Arabic Collection - Perfume Feminino - 25ml",
    "price": 110,
    "img": "https://images-cdn.kyte.site/v0/b/kyte-7c484.appspot.com/o/LfvIulOXaqW7ZDOrNqEkVldrhqh1%2Fthumb_280_E76E0AC8-4938-4F6A-9F8C-F35325852467.jpg?alt=media",
    "category": "miniatura-arabe"
  }
];
