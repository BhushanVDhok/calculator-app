// Minimal safe expression evaluator for calculator logic
// Exports evaluateExpression for Node and attaches to window for browser.
(function(global){
  function isNumberChar(ch){
    return /[0-9.]/.test(ch);
  }

  // Very small tokenizer and parser that supports + - * / % and parentheses
  function tokenize(s){
    const tokens=[];
    let i=0;
    while(i<s.length){
      const ch=s[i];
      if(/\s/.test(ch)){ i++; continue }
      if(/[0-9.]/.test(ch)){
        let num=ch; i++;
        while(i<s.length && /[0-9.]/.test(s[i])){ num+=s[i++]; }
        tokens.push({type:'number',value:parseFloat(num)});
        continue;
      }
      if(ch==='+'||ch==='-'||ch==='*'||ch==='/'||ch==='%'){
        tokens.push({type:'op',value:ch}); i++; continue;
      }
      if(ch==='('||ch===')'){
        tokens.push({type:ch}); i++; continue;
      }
      // unknown char
      throw new Error('Unexpected character: '+ch);
    }
    return tokens;
  }

  function parseExpression(tokens){
    let pos=0;
    function peek(){ return tokens[pos] }
    function consume(){ return tokens[pos++] }

    function parsePrimary(){
      const t=peek();
      if(!t) throw new Error('Unexpected end');
      if(t.type==='number'){ consume(); return {type:'num',value:t.value} }
      if(t.type==='('){ consume(); const node=parseAddSub(); const next=consume(); if(!next||next.type!==')') throw new Error('Expected )'); return node }
      if(t.type==='op' && t.value==='-'){ // unary minus
        consume(); const node=parsePrimary(); return {type:'neg',child:node}
      }
      throw new Error('Unexpected token in primary');
    }

    function parseMulDiv(){
      let node=parsePrimary();
      while(peek() && peek().type==='op' && (peek().value==='*' || peek().value==='/' || peek().value==='%')){
        const op=consume().value; const right=parsePrimary(); node={type:'bin',op, left:node, right};
      }
      return node;
    }

    function parseAddSub(){
      let node=parseMulDiv();
      while(peek() && peek().type==='op' && (peek().value==='+' || peek().value==='-')){
        const op=consume().value; const right=parseMulDiv(); node={type:'bin',op,left:node,right};
      }
      return node;
    }

    const ast=parseAddSub(); if(pos<tokens.length) throw new Error('Unexpected token after expression'); return ast;
  }

  function evalAst(node){
    switch(node.type){
      case 'num': return node.value;
      case 'neg': return -evalAst(node.child);
      case 'bin':{
        const a=evalAst(node.left); const b=evalAst(node.right);
        switch(node.op){
          case '+': return a+b;
          case '-': return a-b;
          case '*': return a*b;
          case '/': if(b===0) throw new Error('Division by zero'); return a/b;
          case '%': return a % b;
        }
      }
    }
    throw new Error('Invalid AST node');
  }

  function evaluateExpression(input){
    if(input==null) return 0;
    // sanitize: allow only digits, operators, parens, decimal and whitespace
    if(/[^0-9+\-*/%().\s]/.test(input)) throw new Error('Invalid characters in expression');
    const tokens=tokenize(input);
    const ast=parseExpression(tokens);
    const val=evalAst(ast);
    // trim floating inaccuracies
    const rounded=Math.round((val+Number.EPSILON)*1e12)/1e12;
    return rounded;
  }

  if(typeof module!=='undefined' && module.exports){ module.exports={evaluateExpression} }
  if(typeof global!=='undefined') global.evaluateExpression=evaluateExpression;
})(typeof window!=='undefined'?window:global);