const base = require('@umijs/fabric/dist/eslint');

module.exports = {
  ...base,
  root: true,
  rules: {
    ...base.rules,
    'arrow-parens': 0,
    'react/no-array-index-key': 0,
    'react/sort-comp': 0,
    '@typescript-eslint/no-explicit-any': 1,
    '@typescript-eslint/no-empty-interface': 1,
    '@typescript-eslint/no-inferrable-types': 0,
    'react/no-find-dom-node': 1,
    'react/require-default-props': 0,
    'no-confusing-arrow': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-named-as-default-member': 0,
    'import/no-unresolved': 0,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'no-trailing-spaces': 1, // 禁用行尾空格
    'eol-last': 2, // 要求或禁止文件末尾存在空行
    'block-spacing': ['error', 'always'], // 禁止或强制在代码块中开括号前和闭括号后有空格
    'arrow-spacing': 2, // 强制箭头函数的箭头前后使用一致的空格
    'key-spacing': 2, // 强制在对象字面量的属性中键和值之间使用一致的间距
    'keyword-spacing': 2, // 强制在关键字前后使用一致的空格
    'space-infix-ops': 2, // 要求操作符周围有空格
    'comma-spacing': 2, // 强制在逗号前后使用一致的空格
    'no-multiple-empty-lines': 2, // 禁止出现多行空行
    'no-multi-spaces': 2, // 禁止使用多个空格
    'space-before-blocks': 2, // 强制在块之前使用一致的空格
    '@typescript-eslint/consistent-type-imports': 0,
    '@typescript-eslint/no-unused-vars': 1,
  },
};
