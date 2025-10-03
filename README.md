Calculator

This is a small HTML/CSS/JS calculator implemented using a safe expression evaluator.

Files:
- index.html — main page
- css/style.css — styles
- js/calculator-core.js — tokenizer/parser/evaluator exposed as evaluateExpression
- js/script.js — UI wiring and keyboard support

Open index.html in your browser to use.

Node testing

You can run a quick test using Node (Windows PowerShell):

node -e "console.log(require('./js/calculator-core.js').evaluateExpression('1+2*3'))"