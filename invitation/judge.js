/* NomiaPC local one-expression C++ mini-judge.
 * It deliberately DOES NOT compile C++ or execute arbitrary user code.
 * Supported: integer literals, integer variables, + - * / %, !, comparison,
 * &&, ||, ternary ?:, parentheses, min/max/abs and std::min/std::max.
 * C++ integer division truncates toward zero. All problems use 32-bit-safe numbers.
 */
(function(root){
  'use strict';
  const tests = {
    A: [[19,4],[10,3],[1,1],[5,8],[100,10],[97,9],[1001,19]],
    B: [[17],[19],[38],[1],[20],[100],[2026]],
    C: [[8,19,12],[5,5,9],[9,2,1],[19,19,19],[0,100,50],[7,7,7],[1,1000,3]]
  };
  const problems = [
    {id:'A',title:'The Sweetest Boxes',points:800,story:'Төрсөн өдөр болж байхад чихэр тоолохгүй бол хэн тоолох юм? 🍬',description:'Номиад n ширхэг амттан бий. Нэг хайрцагт хамгийн ихдээ k ширхэг орно. Бүх амттаныг багтаахад шаардагдах хамгийн цөөн хайрцгийн тоог ол. Нэг мөрийн илэрхийллээр буцаана.',args:'int n, int k',vars:['n','k'],format:'n, k',samples:[['19 4','5'],['10 3','4']],hint:'Хэрэв n нь k-д хуваагдахгүй бол дахиад нэг хайрцаг хэрэгтэй. Integer division ашиглаарай.',cases:tests.A,reference:({n,k})=>Math.ceil(n/k)},
    {id:'B',title:'Lucky Nineteen',points:900,story:'19 бол одоохондоо хамгийн чухал тоо. Санаандгүй зүйл огт биш. 🎂',description:'n гэсэн эерэг бүхэл тооноос эхлээд +1 үйлдлийг хүссэн тоогоор хийж болно. Үр дүнг 19-д хуваагддаг тоо болгоход шаардагдах хамгийн бага үйлдлийн тоог ол. Хэрэв аль хэдийн 19-д хуваагддаг бол 0.',args:'int n',vars:['n'],format:'n',samples:[['17','2'],['19','0']],hint:'n % 19 гэдэг үлдэгдлийг ашигла. 19 дээр аль хэдийн хүрсэн бол 19 биш, 0 буцах ёстой.',cases:tests.B,reference:({n})=>(19-(n%19))%19},
    {id:'C',title:'The Middle Medal',points:1000,story:'Медаль цуглуулах уу? Мэдээж. Гэхдээ эхлээд дундахыг нь ол. 🏅',description:'a, b, c гэсэн гурван бүхэл тоо өгөгдөнө. Эдгээрийг эрэмбэлэхэд дунд байрлах утгыг буцаа. Тоонууд тэнцүү байж болно. Нэг мөрийн илэрхийлэл л бичнэ.',args:'int a, int b, int c',vars:['a','b','c'],format:'a, b, c',samples:[['8 19 12','12'],['5 5 9','5']],hint:'Гурван тооны нийлбэрээс хамгийн их болон хамгийн багыг хасвал юу үлдэх вэ? min/max функцууд нээлттэй.',cases:tests.C,reference:({a,b,c})=>[a,b,c].sort((x,y)=>x-y)[1]}
  ];
  function tokenize(s){
    const pattern=/\s*(\d+|(?:std::)?[A-Za-z_][A-Za-z_0-9]*|&&|\|\||==|!=|<=|>=|[+\-*\/%(),!<>?:])/y;
    const result=[];let i=0;
    while(i<s.length){ if(/^\s+$/.test(s.slice(i))) break;pattern.lastIndex=i;const match=pattern.exec(s);if(!match) throw new Error('Unsupported C++ syntax at character '+(i+1));result.push(match[1]);i=pattern.lastIndex; if(result.length>140)throw new Error('Expression too long'); }
    return result;
  }
  function parse(source){
    let s=String(source).trim();
    if(s.startsWith('return '))s=s.slice(7).trim();
    if(s.endsWith(';'))s=s.slice(0,-1).trim();
    if(!s)throw new Error('Empty expression');
    const t=tokenize(s);let i=0;
    const peek=()=>t[i];const take=x=>peek()===x?(i++,true):false;
    const need=x=>{if(!take(x))throw new Error('Expected '+x+' near '+(peek()||'end of expression'));};
    const binary=(next,ops)=>{let node=next();while(ops.includes(peek())){let op=t[i++];node={type:'op',op,left:node,right:next()};}return node;};
    function primary(){const v=peek();if(take('(')){const inside=conditional();need(')');return inside;}
      if(/^\d+$/.test(v||'')){i++;return{type:'num',value:Number(v)};}
      if(/^(?:std::)?[a-zA-Z_]\w*$/.test(v||'')){i++;if(take('(')){const args=[];if(peek()!==')'){args.push(conditional());while(take(','))args.push(conditional());}need(')');const name=v.replace(/^std::/,'');if(!['max','min','abs'].includes(name))throw new Error('Unsupported function '+name);if(args.length!==(name==='abs'?1:2))throw new Error(name+' has wrong argument count');return{type:'fn',name,args};}
        return{type:'var',name:v};}
      throw new Error('Expected a number, variable or (expression)');}
    function unary(){if(['+','-','!'].includes(peek())){const op=t[i++];return{type:'unary',op,child:unary()};}return primary();}
    const mul=()=>binary(unary,['*','/','%']);const add=()=>binary(mul,['+','-']);const cmp=()=>binary(add,['<','<=','>','>=']);const equal=()=>binary(cmp,['==','!=']);const and=()=>binary(equal,['&&']);const or=()=>binary(and,['||']);
    function conditional(){let n=or();if(take('?')){const yes=conditional();need(':');const no=conditional();n={type:'cond',test:n,yes,no};}return n;}
    const tree=conditional();if(i!==t.length)throw new Error('Unexpected token '+peek());return tree;
  }
  function evaluate(node,vars){
    const ev=(n)=>evaluate(n,vars);let a,b;
    switch(node.type){
      case 'num':return node.value;
      case 'var':if(!(node.name in vars))throw new Error('Unknown variable '+node.name);return vars[node.name];
      case 'unary':a=ev(node.child);return node.op==='-'?-a:node.op==='+'?a:Number(!a);
      case 'fn':a=ev(node.args[0]);if(node.name==='abs')return Math.abs(a);b=ev(node.args[1]);return node.name==='min'?Math.min(a,b):Math.max(a,b);
      case 'cond':return ev(node.test)?ev(node.yes):ev(node.no);
      case 'op':if(node.op==='&&')return Number(Boolean(ev(node.left))&&Boolean(ev(node.right)));
        if(node.op==='||')return Number(Boolean(ev(node.left))||Boolean(ev(node.right)));
        a=ev(node.left);b=ev(node.right);
        switch(node.op){case '+':return a+b;case '-':return a-b;case '*':return a*b;case '/':if(b===0)throw new Error('Division by zero');return Math.trunc(a/b);case '%':if(b===0)throw new Error('Modulo by zero');return a%b;
          case '==':return Number(a===b);case '!=':return Number(a!==b);case '<':return Number(a<b);case '<=':return Number(a<=b);case '>':return Number(a>b);case '>=':return Number(a>=b);}
    }
    throw new Error('Unsupported expression');
  }
  function judge(problem,source){let tree;try{tree=parse(source);}catch(e){return{verdict:'CE',message:e.message};}
    for(let i=0;i<problem.cases.length;i++){
      const entries=problem.cases[i];const vars=Object.fromEntries(problem.vars.map((name,j)=>[name,entries[j]]));
      let actual;try{actual=evaluate(tree,vars);}catch(e){return{verdict:'RE',at:i+1,message:e.message};}
      const expected=problem.reference(vars);
      if(!Number.isSafeInteger(actual)||actual!==expected)return{verdict:'WA',at:i+1,actual,expected,input:entries};
    }
    return{verdict:'AC',count:problem.cases.length};
  }
  root.NomiaJudge={problems,judge,parse,evaluate};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.NomiaJudge;
})(typeof window!=='undefined'?window:globalThis);
