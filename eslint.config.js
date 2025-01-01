// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  formatters: {
    /**
     * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
     * By default uses Prettier
     */
    css: true,
    /**
     * Format HTML files
     * By default uses Prettier
     */
    html: true,
    /**
     * Format Markdown files
     * Supports Prettier and dprint
     * By default uses Prettier
     */
  },
  ignores: [
    '**/*.md',
  ],
}, {
  rules: {
    // 允许 JSX 使用的变量不被标记为未使用
    'react/jsx-uses-react': 'off', // React 17+ 不需要显式引入 React
    'react/react-in-jsx-scope': 'off', // React 17+ JSX 不需要 React 在作用域中
    'react/jsx-uses-vars': 'warn', // 避免 no-unused-vars 的误报
    'antfu/top-level-function': 'off',
    'no-console': ['warn'],
    // 自定义 brace-style 规则
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    // 列表最后是否要有逗号
    // 'style/comma-dangle': ['error', 'never']
    '@typescript-eslint/consistent-type-definitions': 'off',
    'style/max-len': ['error', { code: 100, ignoreStrings: true, ignoreUrls: true, ignoreComments: true }],
    '@eslint-react/prefer-destructuring-assignment': 'off',
  },
})
