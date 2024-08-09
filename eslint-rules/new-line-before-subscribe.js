/**
 * @fileoverview Rule to require a newline before `.subscribe`
 * @author Marmar
 */
'use strict';

module.exports = {
  meta: {
    type: 'layout',

    docs: {
      description: 'Require a newline before `.subscribe`',
      recommended: false,
    },

    fixable: 'whitespace',
    schema: [],
    messages: {
      unexpected: 'Expected a newline before `.subscribe`.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    function getLineNumberOfTokenBefore(node) {
      const tokenBefore = sourceCode.getTokenBefore(node);

      return tokenBefore ? tokenBefore.loc.end.line : 0;
    }

    function hasNewlineBeforeSubscribe(node) {
      const lineNumNode = node.loc.start.line;
      const dotToken = sourceCode.getTokenBefore(node.callee.property, {
        filter: token => token.value === '.',
      });
      const lineNumTokenBefore = getLineNumberOfTokenBefore(dotToken);

      return dotToken.loc.start.line > lineNumTokenBefore;
    }

    function canFix(node) {
      const tokenBefore = sourceCode.getTokenBefore(node.callee.property);
      const dotToken = sourceCode.getTokenBefore(node.callee.property, {
        filter: token => token.value === '.',
      });

      return tokenBefore && dotToken.loc.end.line === node.loc.start.line;
    }

    function getTokenIndent(token) {
      // Get the start index of the line where the token is located

      // Slice the text from the start of the line to the token's position
      const indentation = sourceCode.text.slice(
        token.range[0] - token.loc.start.column,
        token.range[0]
      );

      // Filter out anything that is not a space, tab, or newline character
      const indentCharacters = indentation.match(/[\t]*/g).join('') || '\n\t\t';

      return indentCharacters;
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'subscribe'
        ) {
          if (!hasNewlineBeforeSubscribe(node)) {
            context.report({
              node,
              messageId: 'unexpected',
              fix(fixer) {
                if (canFix(node)) {
                  const dotToken = sourceCode.getTokenBefore(node.callee.property, {
                    filter: token => token.value === '.',
                  });

                  const tokenBefore = sourceCode.getTokenBefore(dotToken);
                  const lineBeforeDot = sourceCode.getText(tokenBefore); // Get the text before the dot
                  const lineBeforeDot2 = getTokenIndent(dotToken); // Get the text before the dot
                  const indentationMatch = lineBeforeDot.match(/^\s*/); // Match the leading whitespace
                  const indentation = indentationMatch ? indentationMatch[0] : ''; // Extract indentation

                  // Insert a newline followed by the indentation before the dot
                  //   `\n${indentation}`
                  return fixer.insertTextBefore(dotToken, lineBeforeDot2);
                }

                return null;
              },
            });
          }
        }
      },
    };
  },
};
