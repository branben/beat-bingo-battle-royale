module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',      // New feature
        'fix',       // Bug fix
        'docs',      // Documentation changes
        'style',     // Code style changes (formatting, etc.)
        'refactor',  // Code changes that don't fix bugs or add features
        'test',      // Adding or updating tests
        'chore',     // Changes to build process or auxiliary tools
        'ci',        // CI/CD related changes
        'revert',    // Revert a previous commit
        'perf',      // Performance improvements
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'audio',
        'ui',
        'auth',
        'db',
        'test',
        'config',
        'deps',
        'ci',
        'docs',
      ],
    ],
    'subject-case': [
      2,
      'always',
      ['sentence-case', 'start-case', 'pascal-case', 'lower-case'],
    ],
    'subject-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
};
