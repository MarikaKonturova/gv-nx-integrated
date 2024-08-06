module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'subject-case': [0],
      'type-enum': [
        2,
        'always',
        [
          'build',
          'chore',
          'ci',
          'docs',
          'feature',
          'bugfix',
          'hotfix',
          'refactor',
          'revert',
          'test',
        ],
      ],
    },
  };
  