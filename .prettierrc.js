// .prettierrc.js
module.exports = {
  semi: false, // No semicolons at the end of statements
  singleQuote: true, // Use single quotes instead of double quotes
  trailingComma: "es5", // Trailing commas wherever valid in ES5 (objects, arrays, etc.)
  bracketSpacing: true, // Print spaces between brackets in object literals
  arrowParens: "avoid", // Omit parentheses when possible for single-argument arrow functions
  endOfLine: "lf", // Use line feed only (\n) for end of line
  printWidth: 100, // Wrap lines that exceed 100 characters
  tabWidth: 2, // Set the number of spaces per indentation level
  useTabs: false, // Use spaces instead of tabs
  htmlWhitespaceSensitivity: "css", // Respect the CSS display property for HTML whitespace sensitivity
  vueIndentScriptAndStyle: true, // Indent <script> and <style> tags in Vue files
  // Additional settings to match VSCode configuration
  proseWrap: "always", // Wrap prose if it exceeds the print width
  insertPragma: false, // Do not insert a special @format marker at the top of formatted files
  requirePragma: false, // Do not restrict formatting to files that have a special @format marker
  jsxSingleQuote: true, // Use single quotes instead of double quotes in JSX
  jsxBracketSameLine: false, // Put the closing `>` of a multiline JSX element at the end of the last line
  embeddedLanguageFormatting: "auto" // Format embedded code if Prettier can automatically identify it
}
