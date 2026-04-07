export type FieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean' | 'json';

export interface FieldOption {
  label: string;
  value: string;
}

export interface ActorParamField {
  key: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  default?: string | number | boolean;
  min?: number;
  max?: number;
  advanced?: boolean;
  description?: string;
}

export interface ApifyActor {
  id: string;
  name: string;
  description: string;
  category: ActorCategory;
  icon: string;
  color: string;
  inputSchema: ActorParamField[];
  outputFields: string[];
  pricingInfo: string;
  isCustom?: boolean;
  customId?: string;
}

export type ActorCategory = 'search-engines' | 'social-media' | 'ecommerce' | 'real-estate' | 'reviews' | 'general' | 'brazil-data' | 'custom';

export const categoryLabels: Record<ActorCategory, string> = {
  'search-engines': 'Motores de Busca',
  'social-media': 'Redes Sociais',
  'ecommerce': 'E-commerce',
  'real-estate': 'Imóveis',
  'reviews': 'Avaliações',
  'general': 'Geral',
  'brazil-data': 'Dados Brasil',
  'custom': 'Meus Atores',
};

export const categoryIcons: Record<ActorCategory, string> = {
  'search-engines': 'Search',
  'social-media': 'Users',
  'ecommerce': 'ShoppingCart',
  'real-estate': 'Home',
  'reviews': 'Star',
  'general': 'Globe',
  'brazil-data': 'Building2',
  'custom': 'Plus',
};

export const apifyActors: ApifyActor[] = [
  {
    id: 'nFJinFCYlBibjFgbW',
    name: 'Google Search Scraper',
    description: 'Extraia resultados de busca do Google incluindo títulos, links, descrições e dados estruturados.',
    category: 'search-engines',
    icon: 'Search',
    color: '#4285F4',
    inputSchema: [
      { key: 'query', type: 'text', label: 'Consulta de Busca', placeholder: 'Ex: melhores restaurantes em SP', required: true },
      { key: 'maxResults', type: 'number', label: 'Máximo de Resultados', default: 20, min: 1, max: 200 },
      { key: 'language', type: 'select', label: 'Idioma', default: 'pt', options: [
        { label: 'Português', value: 'pt' }, { label: 'Inglês', value: 'en' }, { label: 'Espanhol', value: 'es' }, { label: 'Francês', value: 'fr' }
      ]},
      { key: 'country', type: 'select', label: 'País', default: 'br', options: [
        { label: 'Brasil', value: 'br' }, { label: 'EUA', value: 'us' }, { label: 'Reino Unido', value: 'uk' }, { label: 'Argentina', value: 'ar' }
      ]},
      { key: 'type', type: 'select', label: 'Tipo de Busca', default: 'web', options: [
        { label: 'Web', value: 'web' }, { label: 'Imagens', value: 'images' }, { label: 'Notícias', value: 'news' }, { label: 'Vídeos', value: 'videos' }
      ]},
      { key: 'csvFriendly', type: 'boolean', label: 'Formato CSV Amigável', default: false, advanced: true },
    ],
    outputFields: ['title', 'url', 'description', 'position', 'type', 'domain', 'snippet'],
    pricingInfo: '$3 por 1000 resultados',
  },
  {
    id: 'puQ9JnfPApROKFxAn',
    name: 'Google Maps Scraper',
    description: 'Extraia informações de estabelecimentos do Google Maps incluindo avaliações, contatos e horários.',
    category: 'search-engines',
    icon: 'MapPin',
    color: '#34A853',
    inputSchema: [
      { key: 'searchQueries', type: 'textarea', label: 'Consultas de Busca', placeholder: 'Um por linha:\npizzarias em São Paulo\nhotéis no Rio', required: true },
      { key: 'maxReviews', type: 'number', label: 'Máximo de Avaliações', default: 5, min: 0, max: 100, advanced: true },
      { key: 'language', type: 'select', label: 'Idioma', default: 'pt', options: [
        { label: 'Português', value: 'pt' }, { label: 'Inglês', value: 'en' }, { label: 'Espanhol', value: 'es' }
      ]},
      { key: 'maxItems', type: 'number', label: 'Máximo de Itens', default: 20, min: 1, max: 999 },
      { key: 'includeHours', type: 'boolean', label: 'Incluir Horários', default: true, advanced: true },
    ],
    outputFields: ['title', 'address', 'phone', 'website', 'rating', 'reviewsCount', 'category', 'lat', 'lng', 'hours'],
    pricingInfo: '$5 por 1000 estabelecimentos',
  },
  {
    id: 'apify/instagram-scraper',
    name: 'Instagram Scraper',
    description: 'Extraia posts, stories, reels e perfis do Instagram com dados detalhados de engajamento.',
    category: 'social-media',
    icon: 'Camera',
    color: '#E1306C',
    inputSchema: [
      { key: 'usernames', type: 'textarea', label: 'Nomes de Usuário', placeholder: 'Um por linha:\nnasa\nnatgeo', required: true },
      { key: 'resultsType', type: 'select', label: 'Tipo de Resultados', default: 'posts', options: [
        { label: 'Posts', value: 'posts' }, { label: 'Stories', value: 'stories' }, { label: 'Reels', value: 'reels' }, { label: 'Perfil', value: 'profile' }
      ]},
      { key: 'resultsLimit', type: 'number', label: 'Limite de Resultados', default: 20, min: 1, max: 200 },
    ],
    outputFields: ['id', 'username', 'type', 'caption', 'likes', 'comments', 'timestamp', 'url', 'imageUrl', 'videoUrl'],
    pricingInfo: '$3 por 1000 posts',
  },
  {
    id: 'apify/twitter-scraper',
    name: 'Twitter/X Scraper',
    description: 'Colete tweets, perfis e dados de tendências do Twitter/X com filtros avançados.',
    category: 'social-media',
    icon: 'MessageCircle',
    color: '#1DA1F2',
    inputSchema: [
      { key: 'query', type: 'text', label: 'Consulta', placeholder: 'Ex: #tecnologia OR from:usuario', required: true },
      { key: 'tweetsDesired', type: 'number', label: 'Tweets Desejados', default: 50, min: 1, max: 500 },
      { key: 'includeRetweets', type: 'boolean', label: 'Incluir Retweets', default: false },
      { key: 'language', type: 'select', label: 'Idioma', default: 'pt', options: [
        { label: 'Português', value: 'pt' }, { label: 'Inglês', value: 'en' }, { label: 'Todos', value: 'all' }
      ]},
    ],
    outputFields: ['id', 'text', 'author', 'createdAt', 'likes', 'retweets', 'replies', 'views', 'hashtags', 'urls'],
    pricingInfo: '$2 por 1000 tweets',
  },
  {
    id: 'hermes/amazon-product-scraper',
    name: 'Amazon Product Scraper',
    description: 'Extraia dados de produtos da Amazon incluindo preços, avaliações, descrições e ranking.',
    category: 'ecommerce',
    icon: 'ShoppingCart',
    color: '#FF9900',
    inputSchema: [
      { key: 'keyword', type: 'text', label: 'Palavra-chave ou ASIN', placeholder: 'Ex: fone bluetooth ou B09V3KXJPB', required: true },
      { key: 'maxItems', type: 'number', label: 'Máximo de Itens', default: 20, min: 1, max: 100 },
      { key: 'domain', type: 'select', label: 'Domínio', default: 'com', options: [
        { label: 'Amazon.com', value: 'com' }, { label: 'Amazon.com.br', value: 'com.br' }, { label: 'Amazon.es', value: 'es' }, { label: 'Amazon.mx', value: 'com.mx' }
      ]},
      { key: 'includeReviews', type: 'boolean', label: 'Incluir Avaliações', default: true, advanced: true },
    ],
    outputFields: ['title', 'asin', 'price', 'rating', 'reviewsCount', 'url', 'imageUrl', 'description', 'category', 'rank'],
    pricingInfo: '$5 por 1000 produtos',
  },
  {
    id: 'apify/web-scraper',
    name: 'Web Scraper',
    description: 'Extraia dados de qualquer site com seletores CSS personalizados e funções de processamento.',
    category: 'general',
    icon: 'Globe',
    color: '#00BCD4',
    inputSchema: [
      { key: 'startUrls', type: 'textarea', label: 'URLs Iniciais', placeholder: 'Uma por linha:\nhttps://exemplo.com\nhttps://exemplo.com/pagina2', required: true },
      { key: 'selectors', type: 'json', label: 'Seletores (JSON)', placeholder: '{"title": "h1", "description": "p.desc", "links": "a@href"}', description: 'Defina seletores CSS para extrair dados' },
      { key: 'pageFunction', type: 'json', label: 'Função de Processamento (JSON)', placeholder: 'Configuração avançada em JSON', advanced: true },
    ],
    outputFields: ['url', 'title', 'description', 'content', 'links', 'images'],
    pricingInfo: '$2 por 1000 páginas',
  },
  {
    id: 'apify/linkedin-profile-scraper',
    name: 'LinkedIn Scraper',
    description: 'Extraia perfis e dados profissionais do LinkedIn incluindo experiência e habilidades.',
    category: 'social-media',
    icon: 'Briefcase',
    color: '#0077B5',
    inputSchema: [
      { key: 'profileUrls', type: 'textarea', label: 'URLs de Perfis', placeholder: 'Uma por linha:\nhttps://linkedin.com/in/perfil1', required: true },
      { key: 'skills', type: 'boolean', label: 'Incluir Habilidades', default: true },
      { key: 'experience', type: 'boolean', label: 'Incluir Experiência', default: true },
    ],
    outputFields: ['fullName', 'headline', 'location', 'connections', 'skills', 'experience', 'education', 'url'],
    pricingInfo: '$10 por 100 perfis',
  },
  {
    id: 'apify/youtube-scraper',
    name: 'YouTube Scraper',
    description: 'Extraia vídeos, canais e dados do YouTube incluindo visualizações e comentários.',
    category: 'social-media',
    icon: 'Youtube',
    color: '#FF0000',
    inputSchema: [
      { key: 'query', type: 'text', label: 'Consulta ou URL do Canal', placeholder: 'Ex: tutorial de programação ou URL do canal', required: true },
      { key: 'maxVideos', type: 'number', label: 'Máximo de Vídeos', default: 20, min: 1, max: 200 },
    ],
    outputFields: ['title', 'url', 'channel', 'views', 'likes', 'comments', 'duration', 'publishedAt', 'description', 'thumbnail'],
    pricingInfo: '$3 por 1000 vídeos',
  },
  {
    id: 'nGjqoY8gJBwT7iMBj',
    name: 'TripAdvisor Scraper',
    description: 'Extraia avaliações e dados de estabelecimentos do TripAdvisor.',
    category: 'reviews',
    icon: 'Plane',
    color: '#34E0A1',
    inputSchema: [
      { key: 'locationId', type: 'text', label: 'ID da Localização', placeholder: 'ID do TripAdvisor do estabelecimento', required: true },
      { key: 'maxReviews', type: 'number', label: 'Máximo de Avaliações', default: 20, min: 1, max: 200 },
      { key: 'language', type: 'select', label: 'Idioma', default: 'pt', options: [
        { label: 'Português', value: 'pt' }, { label: 'Inglês', value: 'en' }, { label: 'Espanhol', value: 'es' }
      ]},
    ],
    outputFields: ['title', 'text', 'rating', 'date', 'author', 'helpfulVotes', 'stayDate'],
    pricingInfo: '$5 por 1000 avaliações',
  },
  {
    id: 'jimmyp82/zillow-scraper',
    name: 'Zillow Scraper',
    description: 'Extraia listagens de imóveis do Zillow incluindo preços, fotos e detalhes.',
    category: 'real-estate',
    icon: 'Home',
    color: '#006AFF',
    inputSchema: [
      { key: 'searchLocation', type: 'text', label: 'Localização', placeholder: 'Ex: Miami, FL ou código postal', required: true },
      { key: 'listingType', type: 'select', label: 'Tipo de Listagem', default: 'sale', options: [
        { label: 'Venda', value: 'sale' }, { label: 'Aluguel', value: 'rent' }
      ]},
      { key: 'maxItems', type: 'number', label: 'Máximo de Itens', default: 30, min: 1, max: 200 },
    ],
    outputFields: ['address', 'price', 'bedrooms', 'bathrooms', 'sqft', 'lotSize', 'yearBuilt', 'type', 'url', 'imageUrl'],
    pricingInfo: '$5 por 1000 listagens',
  },
  {
    id: 'FqlCXDJdKjMwMYOAX',
    name: 'Yelp Scraper',
    description: 'Extraia avaliações e dados de negócios do Yelp com detalhes de contato e classificação.',
    category: 'reviews',
    icon: 'Star',
    color: '#FF1A1A',
    inputSchema: [
      { key: 'searchQuery', type: 'text', label: 'Consulta de Busca', placeholder: 'Ex: restaurante italiano', required: true },
      { key: 'location', type: 'text', label: 'Localização', placeholder: 'Ex: São Paulo, SP', required: true },
      { key: 'maxResults', type: 'number', label: 'Máximo de Resultados', default: 20, min: 1, max: 100 },
    ],
    outputFields: ['name', 'rating', 'reviewCount', 'phone', 'address', 'category', 'priceRange', 'url', 'imageUrl'],
    pricingInfo: '$3 por 1000 negócios',
  },
  {
    id: 'hGL4pVQE8SBL53ENa',
    name: 'Google Reviews Scraper',
    description: 'Extraia avaliações do Google para qualquer estabelecimento usando o Place ID.',
    category: 'reviews',
    icon: 'MessageSquare',
    color: '#FBBC04',
    inputSchema: [
      { key: 'placeId', type: 'text', label: 'Place ID do Google', placeholder: 'Ex: ChIJN1t_tDeuEmsRUsoyG83frY4', required: true },
      { key: 'maxReviews', type: 'number', label: 'Máximo de Avaliações', default: 20, min: 1, max: 200 },
      { key: 'language', type: 'select', label: 'Idioma', default: 'pt', options: [
        { label: 'Português', value: 'pt' }, { label: 'Inglês', value: 'en' }, { label: 'Espanhol', value: 'es' }
      ]},
    ],
    outputFields: ['author', 'rating', 'text', 'date', 'likesCount', 'reviewerUrl'],
    pricingInfo: '$5 por 1000 avaliações',
  },
  {
    id: 'apify/email-scraper',
    name: 'Email Scraper',
    description: 'Extraia endereços de email de sites com rastreamento profundo e filtragem inteligente.',
    category: 'general',
    icon: 'Mail',
    color: '#9C27B0',
    inputSchema: [
      { key: 'startUrls', type: 'textarea', label: 'URLs Iniciais', placeholder: 'Uma por linha:\nhttps://exemplo.com\nhttps://empresa.com', required: true },
      { key: 'maxDepth', type: 'number', label: 'Profundidade Máxima', default: 3, min: 1, max: 10, advanced: true },
      { key: 'resultsLimit', type: 'number', label: 'Limite de Resultados', default: 100, min: 1, max: 1000 },
    ],
    outputFields: ['email', 'url', 'sourcePage', 'type', 'context'],
    pricingInfo: '$3 por 1000 emails',
  },
  {
    id: 'ecommerce/scraper',
    name: 'E-commerce Scraper',
    description: 'Extraia dados de produtos de qualquer loja online com suporte a múltiplas plataformas.',
    category: 'ecommerce',
    icon: 'Package',
    color: '#FF5722',
    inputSchema: [
      { key: 'urls', type: 'textarea', label: 'URLs dos Produtos', placeholder: 'Uma por linha:\nhttps://loja.com/produto1\nhttps://loja.com/produto2', required: true },
      { key: 'maxItems', type: 'number', label: 'Máximo de Itens', default: 20, min: 1, max: 200 },
    ],
    outputFields: ['title', 'price', 'currency', 'availability', 'description', 'imageUrl', 'url', 'brand', 'category'],
    pricingInfo: '$4 por 1000 produtos',
  },
  {
    id: 'apify/rss-feed-scraper',
    name: 'RSS Feed Reader',
    description: 'Leia e organize feeds RSS de múltiplas fontes em dados estruturados.',
    category: 'general',
    icon: 'Rss',
    color: '#FF6F00',
    inputSchema: [
      { key: 'feedUrls', type: 'textarea', label: 'URLs dos Feeds RSS', placeholder: 'Uma por linha:\nhttps://site.com/feed\nhttps://blog.com/rss', required: true },
      { key: 'maxItems', type: 'number', label: 'Máximo de Itens', default: 50, min: 1, max: 500 },
    ],
    outputFields: ['title', 'link', 'pubDate', 'author', 'summary', 'content', 'categories', 'feedTitle'],
    pricingInfo: '$1 por 1000 itens',
  },
  // Brazilian Public Data Sources
  {
    id: 'trudes/bs2-cnpj-scraper',
    name: 'CNPJ Scraper (Receita Federal)',
    description: 'Consulte dados de empresas brasileiras pelo CNPJ: razão social, endereço, situação, CNAE, sócios e mais.',
    category: 'brazil-data',
    icon: 'Building2',
    color: '#009C3B',
    inputSchema: [
      { key: 'cnpjs', type: 'textarea', label: 'CNPJs', placeholder: 'Um por linha:\n11.111.111/0001-11\n22.222.222/0002-22', required: true },
      { key: 'includePartners', type: 'boolean', label: 'Incluir Sócios', default: true },
      { key: 'includeActivities', type: 'boolean', label: 'Incluir Atividades (CNAE)', default: true },
    ],
    outputFields: ['cnpj', 'razaoSocial', 'nomeFantasia', 'situacao', 'endereco', 'cidade', 'uf', 'cnaes', 'socios', 'capitalSocial', 'naturezaJuridica', 'dataAbertura'],
    pricingInfo: 'Varia pelo plano Apify',
  },
  {
    id: 'grazianomac/cnpj-data',
    name: 'Dados CNPJ Completo',
    description: 'Extraia dados completos de empresas pelo CNPJ via BrasilAPI e ReceitaWS. Inclui sócios, CNAE, faturamento estimado.',
    category: 'brazil-data',
    icon: 'FileSearch',
    color: '#FFDF00',
    inputSchema: [
      { key: 'cnpj', type: 'text', label: 'CNPJ', placeholder: 'Ex: 11222333000181 (apenas números)', required: true },
    ],
    outputFields: ['cnpj', 'razaoSocial', 'fantasia', 'situacao', 'tipo', 'porte', 'abertura', 'endereco', 'uf', 'municipio', 'cnaePrincipal', 'cnaesSecundarios', 'socios', 'naturezaJuridica', 'capitalSocial'],
    pricingInfo: 'Gratuito via BrasilAPI',
  },
  {
    id: 'epctools/b3-data-scraper',
    name: 'B3 - Dados de Ações',
    description: 'Extraia dados da B3 (Bolsa de Valores brasileira): cotações, volume, variação, indicadores fundamentalistas de ações.',
    category: 'brazil-data',
    icon: 'TrendingUp',
    color: '#005AA0',
    inputSchema: [
      { key: 'tickers', type: 'textarea', label: 'Tickers', placeholder: 'Um por linha:\nPETR4\nVALE3\nITUB4\nBBDC4', required: true },
      { key: 'period', type: 'select', label: 'Período', default: '1m', options: [
        { label: '1 Dia', value: '1d' }, { label: '1 Semana', value: '1w' },
        { label: '1 Mês', value: '1m' }, { label: '3 Meses', value: '3m' },
        { label: '6 Meses', value: '6m' }, { label: '1 Ano', value: '1y' },
      ]},
      { key: 'includeFundamentals', type: 'boolean', label: 'Incluir Fundamentalistas', default: false, advanced: true },
    ],
    outputFields: ['ticker', 'nome', 'setor', 'cotacao', 'variacao', 'variacaoAno', 'volume', 'marketCap', 'pvp', 'pvl', 'dividendYield', 'roe', 'roic', 'dataAtualizacao'],
    pricingInfo: 'Varia pelo plano Apify',
  },
  {
    id: 'grazianomac/brasil-fii-scraper',
    name: 'FIIs - Fundos Imobiliários',
    description: 'Consulte dados de Fundos Imobiliários brasileiros: cotização, rendimento mensal, dividend yield, vacância, patrimônio.',
    category: 'brazil-data',
    icon: 'Building',
    color: '#1B6B3A',
    inputSchema: [
      { key: 'tickers', type: 'textarea', label: 'Tickers dos FIIs', placeholder: 'Um por linha:\nHGLG11\nMXRF11\nXPML11\nKNRI11', required: true },
      { key: 'includeHistory', type: 'boolean', label: 'Incluir Histórico de Rendimentos', default: true, advanced: true },
    ],
    outputFields: ['ticker', 'nome', 'segmento', 'cotacao', 'dividendYield12m', 'dyMes', 'vacanciaFisica', 'pvp', 'patrimonioLiquido', 'quantidadeAtivos', 'dataAtualizacao', 'rendimentos'],
    pricingInfo: 'Varia pelo plano Apify',
  },
  {
    id: 'epctools/bacen-indicators',
    name: 'Banco Central - Indicadores',
    description: 'Extraia indicadores econômicos do Banco Central do Brasil: Selic, IPCA, IGPM, câmbio, PIB, reservas internacionais.',
    category: 'brazil-data',
    icon: 'Landmark',
    color: '#2D7D46',
    inputSchema: [
      { key: 'indicators', type: 'multiselect', label: 'Indicadores', required: true, options: [
        { label: 'Selic (Taxa Básica)', value: 'selic' },
        { label: 'IPCA (Inflação)', value: 'ipca' },
        { label: 'Câmbio (USD/BRL)', value: 'cambio' },
        { label: 'IGP-M', value: 'igpm' },
        { label: 'PIB', value: 'pib' },
        { label: 'Reservas Internacionais', value: 'reservas' },
        { label: 'Dívida Pública', value: 'divida' },
        { label: 'Balança Comercial', value: 'balanca' },
      ]},
      { key: 'startDate', type: 'text', label: 'Data Início', placeholder: 'Ex: 01/01/2024' },
      { key: 'endDate', type: 'text', label: 'Data Fim', placeholder: 'Ex: 31/12/2024' },
    ],
    outputFields: ['indicador', 'data', 'valor', 'variacao', 'acumulado12m', 'unidade'],
    pricingInfo: 'Gratuito via API BC',
  },
];

export function getActorsByCategory(category: ActorCategory): ApifyActor[] {
  return apifyActors.filter((a) => a.category === category);
}

export function getActorById(id: string): ApifyActor | undefined {
  return apifyActors.find((a) => a.id === id);
}

export function getCategories(): ActorCategory[] {
  return ['search-engines', 'social-media', 'ecommerce', 'real-estate', 'reviews', 'general', 'brazil-data', 'custom'];
}
