const STORAGE_KEYS = {
  QUOTES: 'quotes',
  CLIENTS: 'clients',
  PRODUCTS: 'products',
  SETTINGS: 'settings',
  LAST_QUOTE_NUMBER: 'lastQuoteNumber'
};

// Seed data for first load
const seedData = () => {
  const defaultSettings = {
    company: {
      name: 'Your Company',
      logo: '',
      email: 'contact@company.com',
      phone: '+971 4 123 4567',
      address: 'Business Bay',
      city: 'Dubai',
      country: 'UAE',
      registrationNumber: '',
      taxNumber: ''
    },
    quote: {
      prefix: 'QT-',
      startingNumber: 1,
      defaultValidityDays: 30,
      defaultTaxRate: 5,
      taxLabel: 'VAT',
      currency: 'AED'
    },
    terms: 'Payment terms: Net 30 days from date of invoice.\nAll prices are subject to change without prior notice.\nThis quote is valid for the specified validity period.',
    template: 'classic',
    customTemplates: []
  };

  const sampleClients = [
    {
      id: 'client-1',
      name: 'Ahmed Hassan',
      company: 'Hassan Trading LLC',
      email: 'ahmed@hassantrading.ae',
      phone: '+971 50 123 4567',
      address: 'Sheikh Zayed Road',
      city: 'Dubai',
      country: 'UAE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'client-2',
      name: 'Sarah Johnson',
      company: 'Johnson Consulting',
      email: 'sarah@johnsonconsult.com',
      phone: '+971 55 987 6543',
      address: 'DIFC',
      city: 'Dubai',
      country: 'UAE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'client-3',
      name: 'Mohammed Al Falasi',
      company: 'Al Falasi Group',
      email: 'mohammed@alfalasi.ae',
      phone: '+971 4 567 8901',
      address: 'Al Quoz Industrial Area',
      city: 'Dubai',
      country: 'UAE',
      createdAt: new Date().toISOString()
    }
  ];

  const sampleProducts = [
    {
      id: 'prod-1',
      name: 'Web Development',
      description: 'Custom website development with responsive design',
      defaultPrice: 5000,
      unit: 'per project'
    },
    {
      id: 'prod-2',
      name: 'Consulting Hours',
      description: 'Professional IT consulting services',
      defaultPrice: 350,
      unit: 'per hour'
    },
    {
      id: 'prod-3',
      name: 'UI/UX Design',
      description: 'User interface and experience design',
      defaultPrice: 2500,
      unit: 'per project'
    },
    {
      id: 'prod-4',
      name: 'Hosting Package',
      description: 'Annual hosting with SSL certificate',
      defaultPrice: 800,
      unit: 'per year'
    },
    {
      id: 'prod-5',
      name: 'Maintenance',
      description: 'Monthly website maintenance and updates',
      defaultPrice: 400,
      unit: 'per month'
    }
  ];

  const sampleQuotes = [
    {
      id: 'quote-1',
      quoteNumber: 'QT-0001',
      clientId: 'client-1',
      clientSnapshot: {
        name: 'Ahmed Hassan',
        email: 'ahmed@hassantrading.ae',
        phone: '+971 50 123 4567',
        company: 'Hassan Trading LLC',
        address: 'Sheikh Zayed Road, Dubai, UAE'
      },
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Approved',
      items: [
        { id: 'item-1', productName: 'Web Development', description: 'E-commerce website', qty: 1, unitPrice: 5000, total: 5000 },
        { id: 'item-2', productName: 'Hosting Package', description: 'Annual hosting', qty: 1, unitPrice: 800, total: 800 }
      ],
      subtotal: 5800,
      taxLabel: 'VAT',
      taxRate: 5,
      taxAmount: 290,
      grandTotal: 6090,
      currency: 'AED',
      notes: 'Thank you for your business!',
      terms: 'Payment terms: Net 30 days from date of invoice.',
      statusHistory: [
        { status: 'Draft', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { status: 'Pending', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { status: 'Approved', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    },
    {
      id: 'quote-2',
      quoteNumber: 'QT-0002',
      clientId: 'client-2',
      clientSnapshot: {
        name: 'Sarah Johnson',
        email: 'sarah@johnsonconsult.com',
        phone: '+971 55 987 6543',
        company: 'Johnson Consulting',
        address: 'DIFC, Dubai, UAE'
      },
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Pending',
      items: [
        { id: 'item-1', productName: 'Consulting Hours', description: 'Strategy consultation', qty: 10, unitPrice: 350, total: 3500 },
        { id: 'item-2', productName: 'UI/UX Design', description: 'Mobile app design', qty: 1, unitPrice: 2500, total: 2500 }
      ],
      subtotal: 6000,
      taxLabel: 'VAT',
      taxRate: 5,
      taxAmount: 300,
      grandTotal: 6300,
      currency: 'AED',
      notes: 'Looking forward to working with you.',
      terms: 'Payment terms: Net 30 days from date of invoice.',
      statusHistory: [
        { status: 'Draft', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { status: 'Pending', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    }
  ];

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(sampleClients));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(sampleProducts));
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(sampleQuotes));
  localStorage.setItem(STORAGE_KEYS.LAST_QUOTE_NUMBER, '2');
};

// Initialize data on first load
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    seedData();
  }
};

// Quotes
export const getQuotes = () => {
  const data = localStorage.getItem(STORAGE_KEYS.QUOTES);
  return data ? JSON.parse(data) : [];
};

export const saveQuote = (quote) => {
  const quotes = getQuotes();
  quotes.push(quote);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  updateLastQuoteNumber(quote.quoteNumber);
};

export const updateQuote = (updatedQuote) => {
  const quotes = getQuotes();
  const index = quotes.findIndex(q => q.id === updatedQuote.id);
  if (index !== -1) {
    quotes[index] = updatedQuote;
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  }
};

export const deleteQuote = (quoteId) => {
  const quotes = getQuotes();
  const filtered = quotes.filter(q => q.id !== quoteId);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(filtered));
};

// Clients
export const getClients = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return data ? JSON.parse(data) : [];
};

export const saveClient = (client) => {
  const clients = getClients();
  clients.push(client);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const updateClient = (updatedClient) => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === updatedClient.id);
  if (index !== -1) {
    clients[index] = updatedClient;
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }
};

export const deleteClient = (clientId) => {
  const clients = getClients();
  const filtered = clients.filter(c => c.id !== clientId);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(filtered));
};

export const getClientById = (clientId) => {
  const clients = getClients();
  return clients.find(c => c.id === clientId);
};

export const getClientQuoteCount = (clientId) => {
  const quotes = getQuotes();
  return quotes.filter(q => q.clientId === clientId).length;
};

// Products
export const getProducts = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const saveProduct = (product) => {
  const products = getProducts();
  products.push(product);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const updateProduct = (updatedProduct) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
};

export const deleteProduct = (productId) => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
};

// Settings
export const getSettings = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : null;
};

export const saveSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Quote Number Generation
const updateLastQuoteNumber = (quoteNumber) => {
  const match = quoteNumber.match(/(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_QUOTE_NUMBER) || '0', 10);
    if (num > current) {
      localStorage.setItem(STORAGE_KEYS.LAST_QUOTE_NUMBER, num.toString());
    }
  }
};

export const generateQuoteNumber = (settings) => {
  const prefix = settings?.quote?.prefix || 'QT-';
  const lastNum = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_QUOTE_NUMBER) || '0', 10);
  const nextNum = lastNum + 1;
  const paddedNum = nextNum.toString().padStart(4, '0');
  return `${prefix}${paddedNum}`;
};
