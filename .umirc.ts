import { defineConfig } from 'dumi';
import WebpackChain from 'webpack-chain';
import ESLintWebpackPlugin from 'eslint-webpack-plugin';
import StyleLintWebpackPlugin from 'stylelint-webpack-plugin';

export default defineConfig({
  base: '/vt/',
  publicPath: '/vt/',
  title: 'virtual-table',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  mode: 'site',
  chainWebpack(memo: WebpackChain) {
    memo.plugin('eslint').use(ESLintWebpackPlugin, [
      {
        extensions: ['ts', 'tsx', 'js', 'jsx'],
      },
    ]);

    memo.plugin('style-lint').use(StyleLintWebpackPlugin, [
      {
        extensions: ['css', 'less'],
        emitError: true,
        emitWarning: true,
        failOnError: true,
        allowEmptyInput: true,
      },
    ] as any);
  },
  extraBabelPlugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }, 'antd'],
  ],
  resolve: {
    includes: ['docs', 'components'],
    excludes: ['es', 'lib'],
  },
  analyze: {
    analyzerMode: 'server',
    analyzerPort: 8888,
    openAnalyzer: true,
    // generate stats file while ANALYZE_DUMP exist
    generateStatsFile: false,
    statsFilename: 'stats.json',
    logLevel: 'info',
    defaultSizes: 'parsed', // stat  // gzip
  },
  targets: {
    chrome: 43,
  },
  dynamicImport: {},
  // more config: https://d.umijs.org/config
});
