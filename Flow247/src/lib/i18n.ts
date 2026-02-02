import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const en = {
  translation: {
    // Common
    common: {
      login: 'Sign In',
      signup: 'Sign Up',
      logout: 'Sign Out',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      contactUs: 'Contact Us',
      pricing: 'Pricing',
      features: 'Features',
      about: 'About',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      language: 'Language',
    },
    // Landing Pages
    landing: {
      flow247: {
        hero: {
          title: 'AI-Powered Freight Management',
          subtitle: '24/7 intelligent logistics automation',
          description: 'Transform your shipping operations with AI agents that work around the clock. Get instant quotes, real-time tracking, and smart optimization.',
          cta: 'Start Free Trial',
        },
        features: {
          title: 'Why Choose Flow247?',
          ai: {
            title: 'AI Freight Agents',
            description: 'Intelligent agents handle quotes, bookings, and tracking automatically.',
          },
          realtime: {
            title: 'Real-Time Tracking',
            description: 'Track your shipments across all carriers in one unified dashboard.',
          },
          integration: {
            title: 'Seamless Integration',
            description: 'Connect with major carriers and TMS systems effortlessly.',
          },
          analytics: {
            title: 'Smart Analytics',
            description: 'Data-driven insights to optimize your supply chain.',
          },
        },
      },
      amass: {
        hero: {
          title: 'Streamline Your Operations',
          subtitle: 'The operations hub for freight professionals',
          description: 'Access Flow247 operations dashboard with powerful tools for managing shipments, quotes, and carrier relationships.',
          cta: 'Access Operations',
        },
        features: {
          title: 'Operations Features',
          crm: {
            title: 'Customer Management',
            description: 'Manage your customer relationships and communication.',
          },
          tracking: {
            title: 'Container Tracking',
            description: 'Real-time visibility across all your containers.',
          },
          quotes: {
            title: 'Quote Management',
            description: 'Create, send, and manage freight quotes efficiently.',
          },
          team: {
            title: 'Team Collaboration',
            description: 'Work together seamlessly with role-based access.',
          },
        },
      },
      apeGlobal: {
        hero: {
          title: 'Full-Service Logistics',
          subtitle: 'Global freight solutions for your business',
          description: 'End-to-end supply chain management with international freight, customs, warehousing, and distribution services.',
          cta: 'Explore Solutions',
        },
        features: {
          title: 'Our Services',
          ocean: {
            title: 'Ocean Freight',
            description: 'FCL and LCL shipping to ports worldwide.',
          },
          air: {
            title: 'Air Freight',
            description: 'Express and standard air cargo solutions.',
          },
          customs: {
            title: 'Customs Brokerage',
            description: 'Expert customs clearance and compliance.',
          },
          warehouse: {
            title: 'Warehousing',
            description: 'Strategic storage and distribution centers.',
          },
        },
      },
    },
    // Auth
    auth: {
      signIn: 'Sign in to your account',
      signUp: 'Create your account',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      orContinueWith: 'Or continue with',
      google: 'Continue with Google',
      terms: 'By signing up, you agree to our',
      and: 'and',
    },
    // Dashboard
    dashboard: {
      welcome: 'Welcome back',
      overview: 'Overview',
      shipments: 'Shipments',
      quotes: 'Quotes',
      analytics: 'Analytics',
      settings: 'Settings',
      customers: 'Customers',
      billing: 'Billing',
      team: 'Team',
    },
    // Admin
    admin: {
      title: 'Admin Panel',
      users: 'Users',
      subscriptions: 'Subscriptions',
      plans: 'Plans',
      analytics: 'Analytics',
      settings: 'Settings',
    },
  },
};

// Spanish translations
const es = {
  translation: {
    common: {
      login: 'Iniciar Sesión',
      signup: 'Registrarse',
      logout: 'Cerrar Sesión',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      name: 'Nombre',
      submit: 'Enviar',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      getStarted: 'Comenzar',
      learnMore: 'Saber Más',
      contactUs: 'Contáctanos',
      pricing: 'Precios',
      features: 'Características',
      about: 'Nosotros',
      terms: 'Términos de Servicio',
      privacy: 'Política de Privacidad',
      language: 'Idioma',
    },
    landing: {
      flow247: {
        hero: {
          title: 'Gestión de Carga con IA',
          subtitle: 'Automatización logística inteligente 24/7',
          description: 'Transforma tus operaciones de envío con agentes de IA que trabajan las 24 horas. Obtén cotizaciones instantáneas, seguimiento en tiempo real y optimización inteligente.',
          cta: 'Prueba Gratis',
        },
        features: {
          title: '¿Por qué Flow247?',
          ai: {
            title: 'Agentes de Carga IA',
            description: 'Agentes inteligentes manejan cotizaciones, reservas y seguimiento automáticamente.',
          },
          realtime: {
            title: 'Seguimiento en Tiempo Real',
            description: 'Rastrea tus envíos con todos los transportistas en un panel unificado.',
          },
          integration: {
            title: 'Integración Sin Problemas',
            description: 'Conéctate con los principales transportistas y sistemas TMS fácilmente.',
          },
          analytics: {
            title: 'Análisis Inteligente',
            description: 'Información basada en datos para optimizar tu cadena de suministro.',
          },
        },
      },
      amass: {
        hero: {
          title: 'Optimiza Tus Operaciones',
          subtitle: 'El centro de operaciones para profesionales de carga',
          description: 'Accede al panel de operaciones Flow247 con herramientas poderosas para gestionar envíos, cotizaciones y relaciones con transportistas.',
          cta: 'Acceder a Operaciones',
        },
        features: {
          title: 'Características de Operaciones',
          crm: {
            title: 'Gestión de Clientes',
            description: 'Gestiona las relaciones y comunicación con tus clientes.',
          },
          tracking: {
            title: 'Seguimiento de Contenedores',
            description: 'Visibilidad en tiempo real de todos tus contenedores.',
          },
          quotes: {
            title: 'Gestión de Cotizaciones',
            description: 'Crea, envía y gestiona cotizaciones de carga eficientemente.',
          },
          team: {
            title: 'Colaboración de Equipo',
            description: 'Trabaja en equipo con acceso basado en roles.',
          },
        },
      },
      apeGlobal: {
        hero: {
          title: 'Logística de Servicio Completo',
          subtitle: 'Soluciones de carga global para tu negocio',
          description: 'Gestión de cadena de suministro de extremo a extremo con transporte internacional, aduanas, almacenamiento y servicios de distribución.',
          cta: 'Explorar Soluciones',
        },
        features: {
          title: 'Nuestros Servicios',
          ocean: {
            title: 'Carga Marítima',
            description: 'Envíos FCL y LCL a puertos de todo el mundo.',
          },
          air: {
            title: 'Carga Aérea',
            description: 'Soluciones de carga aérea express y estándar.',
          },
          customs: {
            title: 'Agencia Aduanal',
            description: 'Despacho aduanero experto y cumplimiento.',
          },
          warehouse: {
            title: 'Almacenamiento',
            description: 'Centros estratégicos de almacenamiento y distribución.',
          },
        },
      },
    },
    auth: {
      signIn: 'Inicia sesión en tu cuenta',
      signUp: 'Crea tu cuenta',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      orContinueWith: 'O continúa con',
      google: 'Continuar con Google',
      terms: 'Al registrarte, aceptas nuestros',
      and: 'y',
    },
    dashboard: {
      welcome: 'Bienvenido de nuevo',
      overview: 'Resumen',
      shipments: 'Envíos',
      quotes: 'Cotizaciones',
      analytics: 'Análisis',
      settings: 'Configuración',
      customers: 'Clientes',
      billing: 'Facturación',
      team: 'Equipo',
    },
    admin: {
      title: 'Panel de Admin',
      users: 'Usuarios',
      subscriptions: 'Suscripciones',
      plans: 'Planes',
      analytics: 'Análisis',
      settings: 'Configuración',
    },
  },
};

// Portuguese (Brazil) translations
const ptBR = {
  translation: {
    common: {
      login: 'Entrar',
      signup: 'Cadastrar',
      logout: 'Sair',
      email: 'E-mail',
      password: 'Senha',
      name: 'Nome',
      submit: 'Enviar',
      cancel: 'Cancelar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      getStarted: 'Começar',
      learnMore: 'Saiba Mais',
      contactUs: 'Fale Conosco',
      pricing: 'Preços',
      features: 'Recursos',
      about: 'Sobre',
      terms: 'Termos de Serviço',
      privacy: 'Política de Privacidade',
      language: 'Idioma',
    },
    landing: {
      flow247: {
        hero: {
          title: 'Gestão de Frete com IA',
          subtitle: 'Automação logística inteligente 24/7',
          description: 'Transforme suas operações de envio com agentes de IA que trabalham 24 horas. Obtenha cotações instantâneas, rastreamento em tempo real e otimização inteligente.',
          cta: 'Teste Grátis',
        },
        features: {
          title: 'Por que Flow247?',
          ai: {
            title: 'Agentes de Frete IA',
            description: 'Agentes inteligentes gerenciam cotações, reservas e rastreamento automaticamente.',
          },
          realtime: {
            title: 'Rastreamento em Tempo Real',
            description: 'Rastreie seus envios em todas as transportadoras em um painel unificado.',
          },
          integration: {
            title: 'Integração Perfeita',
            description: 'Conecte-se com as principais transportadoras e sistemas TMS facilmente.',
          },
          analytics: {
            title: 'Análise Inteligente',
            description: 'Insights baseados em dados para otimizar sua cadeia de suprimentos.',
          },
        },
      },
      amass: {
        hero: {
          title: 'Simplifique Suas Operações',
          subtitle: 'O hub de operações para profissionais de frete',
          description: 'Acesse o painel de operações Flow247 com ferramentas poderosas para gerenciar envios, cotações e relacionamentos com transportadoras.',
          cta: 'Acessar Operações',
        },
        features: {
          title: 'Recursos de Operações',
          crm: {
            title: 'Gestão de Clientes',
            description: 'Gerencie relacionamentos e comunicação com clientes.',
          },
          tracking: {
            title: 'Rastreamento de Contêineres',
            description: 'Visibilidade em tempo real de todos os seus contêineres.',
          },
          quotes: {
            title: 'Gestão de Cotações',
            description: 'Crie, envie e gerencie cotações de frete eficientemente.',
          },
          team: {
            title: 'Colaboração em Equipe',
            description: 'Trabalhe em equipe com acesso baseado em funções.',
          },
        },
      },
      apeGlobal: {
        hero: {
          title: 'Logística de Serviço Completo',
          subtitle: 'Soluções globais de frete para seu negócio',
          description: 'Gestão de cadeia de suprimentos de ponta a ponta com frete internacional, alfândega, armazenamento e serviços de distribuição.',
          cta: 'Explorar Soluções',
        },
        features: {
          title: 'Nossos Serviços',
          ocean: {
            title: 'Frete Marítimo',
            description: 'Envios FCL e LCL para portos do mundo todo.',
          },
          air: {
            title: 'Frete Aéreo',
            description: 'Soluções de carga aérea express e padrão.',
          },
          customs: {
            title: 'Despacho Aduaneiro',
            description: 'Desembaraço aduaneiro especializado e conformidade.',
          },
          warehouse: {
            title: 'Armazenagem',
            description: 'Centros estratégicos de armazenamento e distribuição.',
          },
        },
      },
    },
    auth: {
      signIn: 'Entre na sua conta',
      signUp: 'Crie sua conta',
      forgotPassword: 'Esqueceu sua senha?',
      noAccount: 'Não tem conta?',
      hasAccount: 'Já tem conta?',
      orContinueWith: 'Ou continue com',
      google: 'Continuar com Google',
      terms: 'Ao se cadastrar, você concorda com nossos',
      and: 'e',
    },
    dashboard: {
      welcome: 'Bem-vindo de volta',
      overview: 'Visão Geral',
      shipments: 'Envios',
      quotes: 'Cotações',
      analytics: 'Análises',
      settings: 'Configurações',
      customers: 'Clientes',
      billing: 'Faturamento',
      team: 'Equipe',
    },
    admin: {
      title: 'Painel Admin',
      users: 'Usuários',
      subscriptions: 'Assinaturas',
      plans: 'Planos',
      analytics: 'Análises',
      settings: 'Configurações',
    },
  },
};

// Chinese (Simplified) translations
const zh = {
  translation: {
    common: {
      login: '登录',
      signup: '注册',
      logout: '退出',
      email: '电子邮件',
      password: '密码',
      name: '姓名',
      submit: '提交',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      getStarted: '开始使用',
      learnMore: '了解更多',
      contactUs: '联系我们',
      pricing: '价格',
      features: '功能',
      about: '关于',
      terms: '服务条款',
      privacy: '隐私政策',
      language: '语言',
    },
    landing: {
      flow247: {
        hero: {
          title: 'AI驱动的货运管理',
          subtitle: '24/7智能物流自动化',
          description: '使用全天候工作的AI代理转变您的运输操作。获取即时报价、实时跟踪和智能优化。',
          cta: '免费试用',
        },
        features: {
          title: '为什么选择Flow247？',
          ai: {
            title: 'AI货运代理',
            description: '智能代理自动处理报价、预订和跟踪。',
          },
          realtime: {
            title: '实时跟踪',
            description: '在统一仪表板中跟踪所有承运商的货物。',
          },
          integration: {
            title: '无缝集成',
            description: '轻松连接主要承运商和TMS系统。',
          },
          analytics: {
            title: '智能分析',
            description: '数据驱动的洞察优化您的供应链。',
          },
        },
      },
      amass: {
        hero: {
          title: '简化您的运营',
          subtitle: '货运专业人士的运营中心',
          description: '访问Flow247运营仪表板，使用强大的工具管理货物、报价和承运商关系。',
          cta: '访问运营',
        },
        features: {
          title: '运营功能',
          crm: {
            title: '客户管理',
            description: '管理客户关系和沟通。',
          },
          tracking: {
            title: '集装箱跟踪',
            description: '所有集装箱的实时可见性。',
          },
          quotes: {
            title: '报价管理',
            description: '高效创建、发送和管理货运报价。',
          },
          team: {
            title: '团队协作',
            description: '基于角色的访问权限无缝协作。',
          },
        },
      },
      apeGlobal: {
        hero: {
          title: '全方位物流服务',
          subtitle: '为您的业务提供全球货运解决方案',
          description: '端到端供应链管理，包括国际货运、海关、仓储和配送服务。',
          cta: '探索解决方案',
        },
        features: {
          title: '我们的服务',
          ocean: {
            title: '海运',
            description: '整箱和拼箱运输到全球港口。',
          },
          air: {
            title: '空运',
            description: '快递和标准航空货运解决方案。',
          },
          customs: {
            title: '报关',
            description: '专业的清关和合规服务。',
          },
          warehouse: {
            title: '仓储',
            description: '战略性存储和配送中心。',
          },
        },
      },
    },
    auth: {
      signIn: '登录您的账户',
      signUp: '创建您的账户',
      forgotPassword: '忘记密码？',
      noAccount: '没有账户？',
      hasAccount: '已有账户？',
      orContinueWith: '或继续使用',
      google: '使用Google继续',
      terms: '注册即表示您同意我们的',
      and: '和',
    },
    dashboard: {
      welcome: '欢迎回来',
      overview: '概览',
      shipments: '货物',
      quotes: '报价',
      analytics: '分析',
      settings: '设置',
      customers: '客户',
      billing: '账单',
      team: '团队',
    },
    admin: {
      title: '管理面板',
      users: '用户',
      subscriptions: '订阅',
      plans: '计划',
      analytics: '分析',
      settings: '设置',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      es,
      'pt-BR': ptBR,
      zh,
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
