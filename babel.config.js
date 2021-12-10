module.exports = {
  presets: [
    ['@babel/env', {
      useBuiltIns: 'usage',
      corejs: 3,
    }],
    ['@babel/react', {
      runtime: 'automatic',
      importSource: 'preact',
    }],
  ],
};
