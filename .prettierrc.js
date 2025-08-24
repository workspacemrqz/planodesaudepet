module.exports = {
  // Configurações básicas
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  rangeStart: 0,
  rangeEnd: Infinity,
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  endOfLine: 'lf',
  embeddedLanguageFormatting: 'auto',
  
  // Configurações específicas do TypeScript
  overrides: [
    {
      files: '*.ts',
      options: {
        parser: 'typescript'
      }
    },
    {
      files: '*.tsx',
      options: {
        parser: 'typescript',
        jsxSingleQuote: true
      }
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        printWidth: 80
      }
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 80,
        proseWrap: 'always'
      }
    },
    {
      files: '*.css',
      options: {
        parser: 'css'
      }
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss'
      }
    },
    {
      files: '*.html',
      options: {
        parser: 'html',
        htmlWhitespaceSensitivity: 'strict'
      }
    },
    {
      files: '*.yaml',
      options: {
        parser: 'yaml',
        singleQuote: true
      }
    },
    {
      files: '*.yml',
      options: {
        parser: 'yaml',
        singleQuote: true
      }
    }
  ],
  
  // Configurações de plugins
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports'
  ],
  
  // Configurações de importação
  importOrder: [
    '^react$',
    '^react-(.*)$',
    '^@/(.*)$',
    '^@components/(.*)$',
    '^@pages/(.*)$',
    '^@hooks/(.*)$',
    '^@utils/(.*)$',
    '^@types/(.*)$',
    '^@styles/(.*)$',
    '^@assets/(.*)$',
    '^@lib/(.*)$',
    '^@config/(.*)$',
    '^@shared/(.*)$',
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  
  // Configurações específicas do Tailwind
  tailwindConfig: './tailwind.config.ts',
  tailwindFunctions: ['clsx', 'cn', 'tw'],
  
  // Configurações de formatação condicional
  ...(process.env.NODE_ENV === 'production' && {
    // Configurações mais restritivas para produção
    printWidth: 80,
    semi: true,
    singleQuote: true,
    trailingComma: 'none'
  }),
  
  // Configurações de formatação específicas
  ...(process.env.NODE_ENV === 'development' && {
    // Configurações mais flexíveis para desenvolvimento
    printWidth: 120,
    semi: true,
    singleQuote: true,
    trailingComma: 'es5'
  })
};
