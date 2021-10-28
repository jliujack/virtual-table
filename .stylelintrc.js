module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/stylelint')],
  plugins: ['stylelint-order'],
  rules: {
    'no-empty-source': null,
    'order/properties-order': [[], { severity: 'warning' }],
  },
};
