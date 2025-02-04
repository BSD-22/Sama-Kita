module.exports = {
  // Use single quotes instead of double quotes
  singleQuote: true,

  // Print trailing commas wherever possible in multi-line lists
  trailingComma: 'all',

  // Include parentheses around a sole arrow function parameter
  arrowParens: 'always',

  // Use spaces instead of tabs for indentation
  useTabs: false,

  // Set the number of spaces per indentation level
  tabWidth: 2,

  // Do not add a semicolon at the end of every statement
  semi: true,

  // Limit the line length to 80 characters (can be adjusted to suit team preference)
  printWidth: 500,

  // Do not use space between function name and parentheses
  spaceBeforeFunctionParen: false,

  // Include a blank line between class members and other parts of the class body
  insertPragma: false,

  // Require parentheses around the object literal when used in JSX
  jsxBracketSameLine: false,

  // Set the quote style for JSX attributes to double quotes
  jsxSingleQuote: false,

  // Ensure that Prettier formats embedded code (HTML, JS, etc.) inside Markdown files
  proseWrap: 'preserve',

  // Specify the line endings to be consistent across different operating systems
  endOfLine: 'lf',

  // Format files in markdown, json, and other formats.
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
      },
    },
  ],
};
