// Catálogo de produtos - categoria Miniatura Brand
const PRODUCTS = [
  {
    "id": "008-brand-collection-vip-25ml",
    "name": "008 Brand Collection VIP - 25ml",
    "price": 100,
    "img": "assets/produtos/008-brand-collection-vip-25ml.jpg"
  },
  {
    "id": "133-eternit-brand-collection-25ml",
    "name": "133 - Eternit - Brand Collection 25ml",
    "price": 100,
    "img": "assets/produtos/133-eternit-brand-collection-25ml.jpg"
  },
  {
    "id": "161-come-back-men-25ml-brand-collection",
    "name": "161 Come Back Men 25ml - Brand Collection",
    "price": 100,
    "img": "assets/produtos/161-come-back-men-25ml-brand-collection.jpg"
  },
  {
    "id": "alien-mugler-brand-collection-no-043-25ml",
    "name": "Alien Mugler Brand Collection No. 043 - 25ml",
    "price": 100,
    "img": "assets/produtos/alien-mugler-brand-collection-no-043-25ml.jpg"
  },
  {
    "id": "angel-mugler-brand-collection-no-168-20ml",
    "name": "Angel Mugler Brand Collection No. 168 - 20ml",
    "price": 110,
    "img": "assets/produtos/angel-mugler-brand-collection-no-168-20ml.jpg"
  },
  {
    "id": "armani-stronger-with-you-brand-collection-no-232-25ml",
    "name": "Armani Stronger with you Brand Collection No. 232 - 25ml",
    "price": 100,
    "img": "assets/produtos/armani-stronger-with-you-brand-collection-no-232-25ml.jpg"
  },
  {
    "id": "brand-376-inspiracao-le-beau-jean-paul",
    "name": "Brand 376- Inspiração Le beau Jean Paul",
    "price": 100,
    "img": "assets/produtos/brand-376-inspiracao-le-beau-jean-paul.jpg"
  },
  {
    "id": "brand-391-inspiracao-valentino-donna-born-in-roma-valentino",
    "name": "Brand 391 inspiração Valentino Donna Born In Roma Valentino",
    "price": 100,
    "img": "assets/produtos/brand-391-inspiracao-valentino-donna-born-in-roma-valentino.jpg"
  },
  {
    "id": "brand-447-imagination-louis-vitton",
    "name": "Brand 447 Imagination Louis Vitton",
    "price": 100,
    "img": "assets/produtos/brand-447-imagination-louis-vitton.jpg"
  },
  {
    "id": "brand-collection-022-decadence-25ml",
    "name": "Brand Collection - 022 Decadence 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-022-decadence-25ml.jpg"
  },
  {
    "id": "brand-collection-054-aventos-inspiracao-creed-aventus-25ml",
    "name": "Brand Collection - 054 Aventos - INSPIRAÇÃO CREED AVENTUS - 25ML",
    "price": 100,
    "img": "assets/produtos/brand-collection-054-aventos-inspiracao-creed-aventus-25ml.jpg"
  },
  {
    "id": "brand-collection-167-water-drop-25ml",
    "name": "Brand Collection - 167 Water Drop 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-167-water-drop-25ml.jpg"
  },
  {
    "id": "brand-collection-225-bombshell-25ml",
    "name": "Brand Collection - 225 BombShell 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-225-bombshell-25ml.jpg"
  },
  {
    "id": "brand-collection-235-bvlgari-rose-25ml",
    "name": "Brand Collection - 235 Bvlgari Rose 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-235-bvlgari-rose-25ml.jpg"
  },
  {
    "id": "brand-collection-285-joop-pour-homme-25-ml",
    "name": "Brand Collection - 285 Joop Pour Homme 25 ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-285-joop-pour-homme-25-ml.jpg"
  },
  {
    "id": "brand-collection-289-rouge-royal-25ml",
    "name": "Brand Collection - 289 Rouge Royal 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-289-rouge-royal-25ml.jpg"
  },
  {
    "id": "brand-collection-315-sauvage-elixir-25ml",
    "name": "Brand Collection - 315 Sauvage Elixir 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-315-sauvage-elixir-25ml.jpg"
  },
  {
    "id": "brand-collection-323-le-manly-elixir-masculino-25ml",
    "name": "Brand Collection - 323 Le Manly Elixir Masculino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-323-le-manly-elixir-masculino-25ml.jpg"
  },
  {
    "id": "brand-collection-325-le-manly-parfum-masculino-25ml",
    "name": "Brand Collection - 325 Le Manly Parfum Masculino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-325-le-manly-parfum-masculino-25ml.jpg"
  },
  {
    "id": "brand-collection-336-my-way-intense-25ml",
    "name": "Brand Collection - 336 My Way Intense 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-336-my-way-intense-25ml.jpg"
  },
  {
    "id": "brand-collection-402-herba-unissex-25ml",
    "name": "Brand Collection - 402 Herba Unissex 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-402-herba-unissex-25ml.jpg"
  },
  {
    "id": "brand-collection-424-olympic-extrait-feminino-25ml",
    "name": "Brand Collection - 424 Olympic Extrait Feminino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-424-olympic-extrait-feminino-25ml.jpg"
  },
  {
    "id": "brand-collection-427-robotic-masculino-25ml",
    "name": "Brand Collection - 427 Robotic Masculino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-427-robotic-masculino-25ml.jpg"
  },
  {
    "id": "brand-collection-001-inspiracao-allure-25-ml",
    "name": "Brand Collection 001 - Inspiração Allure - 25 ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-001-inspiracao-allure-25-ml.jpg"
  },
  {
    "id": "brand-collection-005-inspiracao-one-million-25ml",
    "name": "Brand Collection 005 - Inspiração One Million - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-005-inspiracao-one-million-25ml.jpg"
  },
  {
    "id": "brand-collection-007-inspiracao-no-jadore-25ml",
    "name": "Brand Collection 007 - Inspiração no J'adore - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-007-inspiracao-no-jadore-25ml.jpg"
  },
  {
    "id": "brand-collection-009-inspiracao-212-vip-25ml",
    "name": "Brand Collection 009 - Inspiração 212 VIP - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-009-inspiracao-212-vip-25ml.jpg"
  },
  {
    "id": "brand-collection-011-inspiracao-angel-iced-star-mugler-25ml",
    "name": "Brand Collection 011 - Inspiração Angel Iced Star Mugler - 25ml",
    "price": 110,
    "img": "assets/produtos/brand-collection-011-inspiracao-angel-iced-star-mugler-25ml.jpg"
  },
  {
    "id": "brand-collection-014-inspiracao-miss-dior-blooming-bouquet-25ml",
    "name": "BRAND COLLECTION 014 - INSPIRAÇÃO MISS DIOR BLOOMING BOUQUET - 25ML",
    "price": 100,
    "img": "assets/produtos/brand-collection-014-inspiracao-miss-dior-blooming-bouquet-25ml.jpg"
  },
  {
    "id": "brand-collection-024-bright-crystal-feminino-25ml",
    "name": "Brand Collection 024- Bright Crystal - Feminino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-024-bright-crystal-feminino-25ml.jpg"
  },
  {
    "id": "brand-collection-027-inspiracao-hipnotic-poison-25ml",
    "name": "Brand Collection 027- Inspiração Hipnotic Poison - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-027-inspiracao-hipnotic-poison-25ml.jpg"
  },
  {
    "id": "brand-collection-028-hugo-boss-masculino-25ml",
    "name": "Brand Collection 028 - Hugo Boss - Masculino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-028-hugo-boss-masculino-25ml.jpg"
  },
  {
    "id": "brand-collection-031-inspiracao-chance-eau-tendre-25ml",
    "name": "Brand Collection 031 - Inspiração Chance Eau Tendre - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-031-inspiracao-chance-eau-tendre-25ml.jpg"
  },
  {
    "id": "brand-collection-034-inspiracao-212-vip-rose-25ml",
    "name": "Brand Collection 034 - Inspiração 212 Vip Rose - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-034-inspiracao-212-vip-rose-25ml.jpg"
  },
  {
    "id": "brand-collection-036-eau-de-toilette-brand-collection-25ml-feminino",
    "name": "Brand Collection 036 Eau de Toilette Brand Collection 25ml - Feminino",
    "price": 100,
    "img": "assets/produtos/brand-collection-036-eau-de-toilette-brand-collection-25ml-feminino.jpg"
  },
  {
    "id": "brand-collection-039-inspiracao-chanel-chance-25ml",
    "name": "Brand Collection 039 - Inspiração Chanel Chance - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-039-inspiracao-chanel-chance-25ml.jpg"
  },
  {
    "id": "brand-collection-060-inspiracao-narciso-her-25ml",
    "name": "BRAND COLLECTION 060 - INSPIRAÇÃO NARCISO HER - 25ML",
    "price": 100,
    "img": "assets/produtos/brand-collection-060-inspiracao-narciso-her-25ml.jpg"
  },
  {
    "id": "brand-collection-063-inspiracao-si-tradicional-25ml",
    "name": "Brand Collection 063 - Inspiração Sí Tradicional - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-063-inspiracao-si-tradicional-25ml.jpg"
  },
  {
    "id": "brand-collection-064-inspiracao-elie-saab-parfum-25ml",
    "name": "Brand Collection 064 - Inspiração Elie Saab Parfum - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-064-inspiracao-elie-saab-parfum-25ml.jpg"
  },
  {
    "id": "brand-collection-066-inspiracao-silver-scent-25ml",
    "name": "Brand Collection 066 - Inspiração Silver Scent - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-066-inspiracao-silver-scent-25ml.jpg"
  },
  {
    "id": "brand-collection-069-inspiracao-la-nuit-tresor",
    "name": "Brand Collection 069 - Inspiração La Nuit Trésor",
    "price": 100,
    "img": "assets/produtos/brand-collection-069-inspiracao-la-nuit-tresor.jpg"
  },
  {
    "id": "brand-collection-070-inspiracao-bleu-de-chanel-25-ml",
    "name": "Brand Collection 070 - Inspiração Bleu de Chanel -25 ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-070-inspiracao-bleu-de-chanel-25-ml.jpg"
  },
  {
    "id": "brand-collection-084-inspiracao-legend-montblanc-25ml",
    "name": "Brand Collection 084 - Inspiração Legend Montblanc - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-084-inspiracao-legend-montblanc-25ml.jpg"
  },
  {
    "id": "brand-collection-091-inspiracao-euphoria-man-25ml",
    "name": "Brand Collection 091 - Inspiração Euphoria Man - 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-091-inspiracao-euphoria-man-25ml.jpg"
  },
  {
    "id": "brand-collection-092-inspiracao-mon-paris-25ml",
    "name": "BRAND COLLECTION 092 - INSPIRAÇÃO MON PARIS - 25ML",
    "price": 100,
    "img": "assets/produtos/brand-collection-092-inspiracao-mon-paris-25ml.jpg"
  },
  {
    "id": "brand-collection-095-bloom-di-fiori-feminino-25ml",
    "name": "Brand Collection 095 - Bloom Di Fiori - Feminino 25ml",
    "price": 100,
    "img": "assets/produtos/brand-collection-095-bloom-di-fiori-feminino-25ml.jpg"
  }
];
