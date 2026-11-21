// Datos de ejemplo. Fotos: Unsplash.
export const SHOP = {
  "key": "trama",
  "name": "Trama",
  "installments": 3,
  "freeFrom": 120000
};

export const FILTER_GROUPS = [
  {
    "key": "category",
    "label": "Categoría",
    "options": [
      {
        "id": "all",
        "label": "Todo"
      },
      {
        "id": "camisas",
        "label": "Camisas"
      },
      {
        "id": "vestidos",
        "label": "Vestidos"
      },
      {
        "id": "pantalones",
        "label": "Pantalones"
      },
      {
        "id": "abrigos",
        "label": "Abrigos"
      },
      {
        "id": "remeras",
        "label": "Remeras"
      }
    ]
  }
];

export const PRODUCTS = [
  {
    "id": "camisa-lino",
    "name": "Camisa de lino",
    "tagline": "Blanco óptico",
    "category": "camisas",
    "price": 48900,
    "badge": "Nuevo",
    "alt": "Camisa blanca colgada de un tendedero",
    "desc": "Lino lavado, cuello camisero y botones de nácar. Cae suelta y se arruga con gracia: justo lo que buscás en verano.",
    "variants": [
      {
        "id": "s",
        "label": "S",
        "stock": 4
      },
      {
        "id": "m",
        "label": "M",
        "stock": 7
      },
      {
        "id": "l",
        "label": "L",
        "stock": 5
      },
      {
        "id": "xl",
        "label": "XL",
        "stock": 2
      }
    ],
    "variantLabel": "Talle",
    "details": [
      [
        "Composición",
        "100% lino lavado"
      ],
      [
        "Cuidado",
        "Lavar a máquina en frío. Secar a la sombra; se plancha húmeda."
      ],
      [
        "Calce",
        "Suelto. Si estás entre dos talles, elegí el menor."
      ]
    ],
    "img": "https://images.unsplash.com/photo-1713881676551-b16f22ce4719?w=600&h=750&fit=crop&q=75&fm=jpg",
    "imgLarge": "https://images.unsplash.com/photo-1713881676551-b16f22ce4719?w=900&h=1125&fit=crop&q=80&fm=jpg"
  },
  {
    "id": "camisa-oxford",
    "name": "Camisa Oxford",
    "tagline": "Celeste",
    "category": "camisas",
    "price": 42900,
    "alt": "Camisa celeste colgada de un tendedero",
    "desc": "Algodón oxford de trama gruesa, corte recto. Va con jean y con pantalón de vestir.",
    "variants": [
      {
        "id": "s",
        "label": "S",
        "stock": 6
      },
      {
        "id": "m",
        "label": "M",
        "stock": 8
      },
      {
        "id": "l",
        "label": "L",
        "stock": 3
      },
      {
        "id": "xl",
        "label": "XL",
        "stock": 0
      }
    ],
    "variantLabel": "Talle",
    "details": [
      [
        "Composición",
        "100% algodón oxford"
      ],
      [
        "Cuidado",
        "Lavar a máquina hasta 30 °C. Se plancha a temperatura media."
      ],
      [
        "Calce",
        "Recto, ni ajustado ni suelto."
      ]
    ],
    "img": "https://images.unsplash.com/photo-1713881842156-3d9ef36418cc?w=600&h=750&fit=crop&q=75&fm=jpg",
    "imgLarge": "https://images.unsplash.com/photo-1713881842156-3d9ef36418cc?w=900&h=1125&fit=crop&q=80&fm=jpg"
  },
  {
    "id": "vestido-camisero",
    "name": "Vestido camisero",
    "tagline": "Largo midi",
    "category": "vestidos",
    "price": 68900,
    "badge": "Más vendido",
    "alt": "Mujer con vestido blanco de manga larga y lentes de sol",
    "desc": "Viscosa liviana con cinturón de tela. Manga larga con puño, apertura frontal y largo a media pantorrilla.",
    "variants": [
      {
        "id": "s",
        "label": "S",
        "stock": 3
      },
      {
        "id": "m",
        "label": "M",
        "stock": 5
      },
      {
        "id": "l",
        "label": "L",
        "stock": 4
      }
    ],
    "variantLabel": "Talle",
    "details": [
      [
        "Composición",
        "100% viscosa"
      ],
      [
        "Cuidado",
        "Lavar a mano o ciclo delicado, sin retorcer."
      ],
      [
        "Calce",
        "Cintura marcada con cinturón. Largo midi."
      ]
    ],
    "img": "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&h=750&fit=crop&q=75&fm=jpg",
    "imgLarge": "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=900&h=1125&fit=crop&q=80&fm=jpg"
  },
  {
    "id": "vestido-verano",
    "name": "Vestido de verano",
    "tagline": "Vuelo amplio",
    "category": "vestidos",
    "price": 59900,
    "alt": "Mujer bailando en la playa con un vestido",
    "desc": "Algodón fino con vuelo, tiras ajustables y bolsillos ocultos. Se lava a máquina y casi no necesita planchado.",
    "variants": [
      {
        "id": "s",
        "label": "S",
        "stock": 5
      },
      {
        "id": "m",
        "label": "M",
        "stock": 6
      },
      {
        "id": "l",
        "label": "L",
        "stock": 0
      }
    ],
    "variantLabel": "Talle",
    "details": [
      [
        "Composición",
        "100% algodón fino"
      ],
      [
        "Cuidado",
        "Lavar a máquina en frío. Casi no necesita planchado."
      ],
      [
        "Calce",
        "Vuelo amplio, tiras regulables."
      ]
    ],
    "img": "https://images.unsplash.com/photo-1623288516140-47a0a17cec7c?w=600&h=750&fit=crop&q=75&fm=jpg",
    "imgLarge": "https://images.unsplash.com/photo-1623288516140-47a0a17cec7c?w=900&h=1125&fit=crop&q=80&fm=jpg"
  },
  {
    "id": "jean-recto",
    "name": "Jean recto",
    "tagline": "Tiro alto, azul oscuro",
    "category": "pantalones",
    "price": 56900,
    "alt": "Pila de jeans azules doblados",
    "desc": "Denim de 12 oz con elastano mínimo para que no se deforme. Tiro alto y pierna recta.",
    "variants": [
      {
        "id": "38",
        "label": "38",
        "stock": 4
      },
      {
        "id": "40",
        "label": "40",
        "stock": 6
      },
      {
        "id": "42",
        "label": "42",
        "stock": 5
      },
      {
        "id": "44",
        "label": "44",
        "stock": 2
      }
    ],
    "variantLabel": "Talle",
    "details": [
      [
        "Composición",
        "98% algodón, 2% elastano"
      ],
      [
        "Cuidado",
        "Lavar del revés en frío, con colores oscuros."
      ],
      [
        "Calce",
        "Tiro alto y pierna recta. Mirá la guía de talles."
      ]
    ],
    "img": "https://images.unsplash.com/photo-1713880453396-aa0493e308ec?w=600&h=750&fit=crop&q=75&fm=jpg",
    "imgLarge": "https://images.unsplash.com/photo-1713880453396-aa0493e308ec?w=900&h=1125&fit=crop&q=80&fm=jpg"
  },
  {
    "id": "jean-mom",
    "name": "Jean mom",
    "tagline": "Celeste lavado",
    "category": "pantalones",
    "price": 59900,
    "alt": "Jeans apilados uno sobre otro",
    "desc": "Lavado suave, cintura marcada y botamanga con dobladillo. Un clásico que sirve todo el año.",
    "variants": [
      {
        "id": "38",
        "label": "38",
        "stock": 2
      },
      {
        "id": "40",
        "label": "40",
        "stock": 5
      },
      {
        "id": "42",
        "label": "42",
        "stock": 7
      },
      {
        "id": "44",
        "label": "44",
        "stock": 3
      }
    ],
    "variantLabel": "Talle",
    "details": [
      [
        "Composición",
        "100% algodón"
      ],
      [
        "Cuidado",
        "Lavar del revés en frío. No usar secadora."
      ],
      [
        "Calce",
        "Cintura marcada, cadera holgada y botamanga con dobladillo."
      ]
    ],
    "img": "https://images.unsplash.com/photo-1721637222188-fa7bf56ceaf5?w=600&h=750&fit=crop&q=75&fm=jpg",
    "imgLarge": "https://images.unsplash.com/photo-1721637222188-fa7bf56ceaf5?w=900&h=1125&fit=crop&q=80&fm=jpg"
  },
  {
    "id": "polera-lana",
    "name": "Polera tejida",
    "tagline": "Lana merino, gris topo",
    "category": "abrigos",
    "price": 74900,
    "badge": "Últimas unidades",
    "alt": "Persona con una polera tejida gris",
    "desc": "Mezcla de lana merino y algodón, cuello alto y punto grueso. Abriga sin pesar.",
    "variants": [
      {
        "id": "s",
        "label": "S",
        "stock": 2
      },
      {
        "id": "m",
        "label": "M",
        "stock": 0
      },
      {
        "id": "l",
        "label": "L",
        "stock": 2
      }
    ],
    "variantLabel": "Talle",
    "details": [
      [
        "Composición",
        "60% lana merino, 40% algodón"
      ],
      [
        "Cuidado",
        "Lavar a mano en agua fría con jabón neutro. Secar apoyada, sin colgar."
      ],
      [
        "Calce",
        "Ajustada al cuello, suelta en el cuerpo."
      ]
    ],
    "img": "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=600&h=750&fit=crop&q=75&fm=jpg",
    "imgLarge": "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=900&h=1125&fit=crop&q=80&fm=jpg"
  },
  {
    "id": "cardigan-gris",
    "name": "Cárdigan abotonado",
    "tagline": "Punto grueso, gris",
    "category": "abrigos",
    "price": 69900,
    "alt": "Persona con un cárdigan tejido gris abotonado",
    "desc": "Punto grueso con botones al tono y bolsillos al frente. Se usa abierto sobre una remera o cerrado como abrigo liviano.",
    "variants": [
      {
        "id": "s",
        "label": "S",
        "stock": 5
      },
      {
        "id": "m",
        "label": "M",
        "stock": 6
      },
      {
        "id": "l",
        "label": "L",
        "stock": 3
      },
      {
        "id": "xl",
        "label": "XL",
        "stock": 1
      }
    ],
    "variantLabel": "Talle",
    "details": [
      [
        "Composición",
        "70% algodón, 30% lana"
      ],
      [
        "Cuidado",
        "Lavar a mano o ciclo lana en frío. Secar apoyado."
      ],
      [
        "Calce",
        "Holgado, pensado para usar sobre otra capa."
      ]
    ],
    "img": "https://images.unsplash.com/photo-1579206464424-7e43a81cadc1?w=600&h=750&fit=crop&q=75&fm=jpg",
    "imgLarge": "https://images.unsplash.com/photo-1579206464424-7e43a81cadc1?w=900&h=1125&fit=crop&q=80&fm=jpg"
  },
  {
    "id": "remera-basica",
    "name": "Remera básica",
    "tagline": "Algodón peinado",
    "category": "remeras",
    "price": 19900,
    "alt": "Remera blanca de cuello redondo",
    "desc": "Algodón peinado de 160 g, cuello redondo reforzado. La base de todo placard.",
    "variants": [
      {
        "id": "s",
        "label": "S",
        "stock": 12
      },
      {
        "id": "m",
        "label": "M",
        "stock": 15
      },
      {
        "id": "l",
        "label": "L",
        "stock": 2
      },
      {
        "id": "xl",
        "label": "XL",
        "stock": 9
      }
    ],
    "variantLabel": "Talle",
    "details": [
      [
        "Composición",
        "100% algodón peinado, 160 g"
      ],
      [
        "Cuidado",
        "Lavar a máquina hasta 40 °C. Se puede planchar del revés."
      ],
      [
        "Calce",
        "Regular, cuello redondo reforzado."
      ]
    ],
    "img": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=750&fit=crop&q=75&fm=jpg",
    "imgLarge": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900&h=1125&fit=crop&q=80&fm=jpg"
  }
];
