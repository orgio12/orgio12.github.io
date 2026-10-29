/*
 * Safe, self-contained restricted C++-style boolean expression checker.
 * No eval(), Function(), compilation, server, or arbitrary code execution.
 * Accepts: s[i], s[i-1], i, integers, 'A', 'W', true/false,
 * !, &&, ||, ==, !=, <, >, <=, >=, +, -, parentheses.
 */
(function (root) {
  'use strict';
  function tokenize(src) {
    if (!src || src.length > 280) throw new Error('Нөхцөлөө 280 тэмдэгтээс бага байлгаарай.');
    const tokens = [], re=/\s*(\&\&|\|\||==|!=|<=|>=|'[AW]'|[()\[\]!<>+\-]|\d+|[A-Za-z_][A-Za-z0-9_]*)/y;
    let at=0;
    while(at<src.length){re.lastIndex=at;const m=re.exec(src);if(!m)throw new Error('Зөвшөөрөгдөөгүй тэмдэг: '+src.slice(at,at+12));tokens.push(m[1]);at=re.lastIndex;if(tokens.length>100)throw new Error('Нөхцөл хэт урт байна.');}
    return tokens;
  }
  function compile(source){
    const tokens=tokenize(source);let ix=0;
    const peek=()=>tokens[ix], eat=t=>{if(peek()===t){ix++;return true;}return false;}, need=t=>{if(!eat(t))throw new Error('`'+t+'` дутуу байна.');};
    const bin=(op,a,b)=>({kind:'binary',op,a,b});
    function parseOr(){let a=parseAnd();while(eat('||'))a=bin('||',a,parseAnd());return a;}
    function parseAnd(){let a=parseEq();while(eat('&&'))a=bin('&&',a,parseEq());return a;}
    function parseEq(){let a=parseRel();while(peek()==='=='||peek()==='!='){const op=tokens[ix++];a=bin(op,a,parseRel());}return a;}
    function parseRel(){let a=parseAdd();while(['<','>','<=','>='].includes(peek())){const op=tokens[ix++];a=bin(op,a,parseAdd());}return a;}
    function parseAdd(){let a=parseUnary();while(peek()==='+'||peek()==='-'){const op=tokens[ix++];a=bin(op,a,parseUnary());}return a;}
    function parseUnary(){if(eat('!'))return{kind:'not',a:parseUnary()};if(eat('-'))return{kind:'neg',a:parseUnary()};return parseAtom();}
    function parseAtom(){
      if(eat('(')){const inner=parseOr();need(')');return inner;}
      const t=tokens[ix++];if(!t)throw new Error('Дутуу бичсэн нөхцөл байна.');
      if(/^\d+$/.test(t))return{kind:'literal',val:Number(t)};
      if(t==="'A'"||t==="'W'")return{kind:'literal',val:t.slice(1,2)};
      if(t==='true'||t==='false')return{kind:'literal',val:t==='true'};
      if(t==='i')return{kind:'index'};
      if(t==='s'){need('[');const arg=parseAdd();need(']');return{kind:'char',arg};}
      throw new Error('Энэ хувилбарт `'+t+'`-г ашиглах боломжгүй.');
    }
    const ast=parseOr();if(ix!==tokens.length)throw new Error('Энд илүү тэмдэг байна: '+tokens.slice(ix).join(' '));
    return ast;
  }
  function evaluate(tree,s,i){
    switch(tree.kind){
      case 'literal':return tree.val;
      case 'index':return i;
      case 'char':{const n=evaluate(tree.arg,s,i);return Number.isInteger(n)&&n>=0&&n<s.length?s[n]:null;}
      case 'neg':return -Number(evaluate(tree.a,s,i));
      case 'not':return !Boolean(evaluate(tree.a,s,i));
      case 'binary':{
        const a=evaluate(tree.a,s,i);
        if(tree.op==='&&')return Boolean(a)&&Boolean(evaluate(tree.b,s,i));
        if(tree.op==='||')return Boolean(a)||Boolean(evaluate(tree.b,s,i));
        const b=evaluate(tree.b,s,i);
        switch(tree.op){case '==':return a===b;case '!=':return a!==b;case '<':return a<b;case '>':return a>b;case '<=':return a<=b;case '>=':return a>=b;case '+':return Number(a)+Number(b);case '-':return Number(a)-Number(b);}
        throw new Error('Unknown operator');
      }
    }
    throw new Error('Unknown expression');
  }
  function expected(s){return (s.match(/W+/g)||[]).length;}
  function getTests(){
    const a=['WWAWWWAWA','A','W','WW','AW','WA','AAAWWW','AWAWAW','WWAAWW','WAWAW','AAAAA','WWWWWW','AAWWAAW'];
    for(let n=1;n<=9;n++)for(let mask=0;mask<2**n;mask++){
      let s='';for(let j=n-1;j>=0;j--)s+=mask&(1<<j)?'W':'A';a.push(s);
    }
    return [...new Set(a)];
  }
  function judge(source){
    let ast;try{ast=compile(String(source||'').trim().replace(/;\s*$/,''));}catch(e){return{status:'CE',message:e.message};}
    const tests=getTests();
    for(let k=0;k<tests.length;k++){
      const s=tests[k];let got=0;
      try{for(let i=0;i<s.length;i++)if(evaluate(ast,s,i))got++;}
      catch(e){return{status:'CE',message:e.message};}
      if(got!==expected(s))return{status:'WA',test:k+1,input:s,expected:expected(s),got,checked:k+1};
    }
    return{status:'AC',checked:tests.length};
  }
  root.BirthdayPuzzle={compile,evaluate,judge};
})(typeof window!=='undefined'?window:globalThis);
