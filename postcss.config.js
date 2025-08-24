module.exports = {
  // Plugins do PostCSS
  plugins: {
    // Tailwind CSS
    'tailwindcss': {},
    
    // Autoprefixer para compatibilidade com navegadores
    'autoprefixer': {
      flexbox: 'no-2009',
      grid: 'autoplace',
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'not ie 11'
      ]
    },
    
    // PostCSS Preset Env para recursos modernos
    'postcss-preset-env': {
      stage: 3,
      features: {
        'custom-properties': true,
        'custom-media-queries': true,
        'nesting-rules': true,
        'media-query-ranges': true,
        'custom-selectors': true,
        'logical-properties-and-values': true,
        'directional-property-shorthands': true,
        'cascade-layers': true,
        'color-function': true,
        'double-position-gradients': true,
        'focus-visible-pseudo-class': true,
        'focus-within-pseudo-class': true,
        'has-pseudo-class': true,
        'is-pseudo-class': true,
        'where-pseudo-class': true,
        'gap-properties': true,
        'overflow-property': true,
        'place-properties': true,
        'prefers-color-scheme-query': true,
        'space-separated-functional-color-values': true,
        'system-ui-font-family': true,
        'text-decoration-shorthand': true,
        'text-underline-offset': true
      }
    },
    
    // CSS Nano para minificação em produção
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: [
          'default',
          {
            discardComments: {
              removeAll: true
            },
            normalizeWhitespace: true,
            colormin: true,
            minifyFontValues: true,
            minifyGradients: true,
            minifyParams: true,
            minifySelectors: true,
            mergeLonghand: true,
            mergeRules: true,
            reduceIdents: false,
            reduceInitial: true,
            reduceTransforms: true,
            uniqueSelectors: true,
            zindex: false
          }
        ]
      }
    } : {}),
    
    // PostCSS Import para importar arquivos CSS
    'postcss-import': {
      path: ['src/styles', 'node_modules']
    },
    
    // PostCSS Nested para aninhamento
    'postcss-nested': {},
    
    // PostCSS Custom Properties para variáveis CSS
    'postcss-custom-properties': {
      preserve: false,
      importFrom: [
        {
          customProperties: {
            '--brand-primary': '#1a5a5c',
            '--brand-secondary': '#277677',
            '--brand-accent': '#E1AC33',
            '--brand-light': '#FBF9F7',
            '--brand-dark': '#0f2a2b',
            '--success-color': '#22c55e',
            '--warning-color': '#f59e0b',
            '--error-color': '#ef4444',
            '--info-color': '#3b82f6'
          }
        }
      ]
    },
    
    // PostCSS Custom Media para media queries customizadas
    'postcss-custom-media': {
      importFrom: [
        {
          customMedia: {
            '--mobile': '(max-width: 767px)',
            '--tablet': '(min-width: 768px) and (max-width: 1023px)',
            '--desktop': '(min-width: 1024px)',
            '--large-desktop': '(min-width: 1440px)',
            '--retina': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
            '--dark': '(prefers-color-scheme: dark)',
            '--light': '(prefers-color-scheme: light)',
            '--reduced-motion': '(prefers-reduced-motion: reduce)',
            '--high-contrast': '(prefers-contrast: high)',
            '--low-contrast': '(prefers-contrast: low)'
          }
        }
      ]
    },
    
    // PostCSS Flexbox para compatibilidade com flexbox
    'postcss-flexbugs-fixes': {},
    
    // PostCSS Object Fit Images para object-fit
    'postcss-object-fit-images': {},
    
    // PostCSS Will Change para otimizações de performance
    'postcss-will-change': {},
    
    // PostCSS Viewport Units para viewport units
    'postcss-viewport-units': {},
    
    // PostCSS Responsive Images para imagens responsivas
    'postcss-responsive-images': {
      sizes: [
        { width: 320, suffix: '-small' },
        { width: 640, suffix: '-medium' },
        { width: 1024, suffix: '-large' },
        { width: 1920, suffix: '-xlarge' }
      ]
    },
    
    // PostCSS Pseudo Elements para pseudo-elementos
    'postcss-pseudo-elements': {},
    
    // PostCSS Pseudo Classes para pseudo-classes
    'postcss-pseudo-classes': {},
    
    // PostCSS Color Function para funções de cor
    'postcss-color-function': {},
    
    // PostCSS Color Hex Alpha para hex com alpha
    'postcss-color-hex-alpha': {},
    
    // PostCSS Color RGBA Fallback para fallback de rgba
    'postcss-color-rgba-fallback': {},
    
    // PostCSS Opacity para fallback de opacity
    'postcss-opacity': {},
    
    // PostCSS Pseudoelements para pseudo-elementos
    'postcss-pseudoelements': {},
    
    // PostCSS Vmin para viewport units
    'postcss-vmin': {},
    
    // PostCSS Pixrem para rem com fallback
    'postcss-pixrem': {
      rootValue: 16,
      unitPrecision: 5,
      propWhiteList: [],
      selectorBlackList: [],
      replace: true,
      mediaQuery: false,
      minPixelValue: 0
    },
    
    // PostCSS Reporter para relatórios
    'postcss-reporter': {
      clearMessages: true,
      throwError: false
    }
  },
  
  // Configurações de parser
  parser: 'postcss-scss',
  
  // Configurações de syntax
  syntax: 'postcss-scss',
  
  // Configurações de map
  map: process.env.NODE_ENV === 'development' ? {
    inline: false,
    annotation: true
  } : false,
  
  // Configurações de from
  from: undefined,
  
  // Configurações de to
  to: undefined
};
