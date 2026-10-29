(() => {
'use strict';
const $=id=>document.getElementById(id);
const C=window.NOMIAPC_CONTENT;
const P=window.NomiaJudge.problems;
const KEY='nomiapc-invite-progress-v2';
const initial={stage:'home',solved:0,attempts:0,giftOpened:false,inviteOpened:false};
let state={...initial};try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');if(stored&&typeof stored==='object'&&['home','contest','prize','invite'].includes(stored.stage))state={...initial,...stored,solved:Math.max(0,Math.min(3,Number(stored.solved)||0))};}catch(e){}
function store(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function show(stage){if(stage==='contest'&&state.solved>=3)stage='prize';state.stage=stage;store();document.querySelectorAll('.screen').forEach(el=>{el.classList.toggle('is-active',el.id==='screen-'+stage)});window.scrollTo({top:0,behavior:'instant'});if(stage==='contest')renderProblem();if(stage==='prize')renderPrize();if(stage==='invite')renderInvite();}
function toast(msg){const el=$('mascot-toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2800);}
function confetti(amount=72){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const layer=document.querySelector('.particles');const colors=['#76f1d3','#ff8ebe','#ffdaa8','#b1a1ff','#e9faf9'];for(let i=0;i<amount;i++){const el=document.createElement('i');el.className='sparkle';el.style.left=(Math.random()*100)+'%';el.style.top=(12+Math.random()*48)+'%';el.style.background=colors[i%colors.length];el.style.setProperty('--dx',(Math.random()*450-225)+'px');el.style.setProperty('--dy',(Math.random()*400-200)+'px');el.style.animationDelay=(Math.random()*.42)+'s';layer.appendChild(el);setTimeout(()=>el.remove(),2100);}}
$('hero-lede').textContent=C.welcomeSubtitle;
$('prize-msg').textContent=C.prizeMessage;
$('invite-title').textContent=C.invitationHeading;
$('sign-name').textContent=C.signature;
$('invite-ps').textContent=C.invitationPostscript;
const paragraphRoot=$('invite-paragraphs');paragraphRoot.textContent='';C.invitationParagraphs.forEach(text=>{const p=document.createElement('p');p.textContent=text;paragraphRoot.appendChild(p);});
$('start-btn').onclick=()=>show(state.solved===3?'prize':'contest');
$('home-link').onclick=e=>{e.preventDefault();show('home')};
$('soundless').onclick=()=>toast('🔇 Нууц даалгавар: энэ сайт ямар ч дуу гаргахгүй.');
let currentIndex=-1;
function renderProblem(){
  const idx=Math.min(state.solved,2),p=P[idx];
  if(currentIndex===idx)return;
  currentIndex=idx;
  $('problem-letter').textContent=p.id;$('difficulty').textContent=p.points;$('contest-heading').textContent=p.title;
  $('problem-story').textContent=p.story;$('problem-description').textContent=p.description;
  $('problem-input').textContent=p.args;$('function-args').textContent=p.args;
  $('progress-num').textContent=String(idx+1).padStart(2,'0');$('progress-fill').style.width=(state.solved/3*100)+'%';
  $('example-list').textContent='';p.samples.forEach(([input,output])=>{const el=document.createElement('div');el.className='example';const left=document.createElement('div');left.innerHTML='<small>INPUT</small>';const leftCode=document.createElement('code');leftCode.textContent=input;left.appendChild(leftCode);const right=document.createElement('div');right.innerHTML='<small>OUTPUT</small>';const rightCode=document.createElement('code');rightCode.textContent=output;right.appendChild(rightCode);el.append(left,right);$('example-list').appendChild(el);});
  $('answer').value='';$('hint-box').hidden=true;$('hint-box').textContent=p.hint;$('judge-result').className='judge-result';$('judge-result').innerHTML='<span class="result-idle">_ verdict pending ...</span>';
  $('next-btn').hidden=true;$('submit-btn').disabled=false;$('run-counter').textContent='SUBMISSIONS: '+state.attempts;
}
$('hints-btn').onclick=()=>{$('hint-box').hidden=!$('hint-box').hidden;};
const sarcasm=['EGOI Queen хаачив аа? 🤨 Дахиад нэг try.','Бүр cake хүртэл WA өгчих гэж… 😭','ICPC-д medal авах хүн маань энийг яах гэж байна? 😌','За за, test case-г буруутгаж болно. Нэг л удаа.'];
$('submit-btn').onclick=()=>{
  const p=P[state.solved];if(!p)return;
  state.attempts++;store();$('run-counter').textContent='SUBMISSIONS: '+state.attempts;
  const result=window.NomiaJudge.judge(p,$('answer').value);
  const box=$('judge-result');box.className='judge-result';box.textContent='';
  const group=document.createElement('div');const heading=document.createElement('strong');const details=document.createElement('small');
  group.append(heading,details);box.appendChild(group);
  if(result.verdict==='AC'){
    box.classList.add('is-ac');heading.textContent='✓ ACCEPTED · '+result.count+' / '+result.count+' TESTS PASSED';details.textContent=state.solved===2?'Too easy for the EGOI Queen. Prize unlocked! ♡':'Мэдэж байсан аа! AC авахад чинь бүр гоё харагддаг шүү. ✨';
    state.solved++;store();$('progress-fill').style.width=(state.solved/3*100)+'%';$('submit-btn').disabled=true;$('next-btn').hidden=false;$('next-btn').innerHTML=state.solved===3?'UNLOCK YOUR PRIZE <span>→</span>':'NEXT PROBLEM <span>→</span>';confetti(56);
  } else if(result.verdict==='WA'){
    box.classList.add('is-wa','shake');heading.textContent='✗ WRONG ANSWER · TEST '+result.at+' / '+p.cases.length;details.textContent=sarcasm[(state.attempts-1)%sarcasm.length];
  } else {
    box.classList.add('is-ce');heading.textContent=result.verdict==='RE'?'⚠ RUNTIME ERROR':'⚠ COMPILATION ERROR';details.textContent=result.message+' · Only a single supported integer expression works here.';
  }
};
$('answer').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();if(!$('submit-btn').disabled)$('submit-btn').click();}});
$('next-btn').onclick=()=>{if(state.solved===3)show('prize');else{currentIndex=-1;renderProblem();}};
function renderPrize(){if(state.giftOpened){$('gift-box').classList.add('opened');$('prize-note').hidden=false;$('gift-instruction').textContent='GIFT UNLOCKED ✓';}}
$('gift-box').onclick=()=>{if(state.giftOpened)return;state.giftOpened=true;store();$('gift-box').classList.add('opened');$('gift-instruction').textContent='GIFT UNLOCKED ✓';setTimeout(()=>{$('prize-note').hidden=false;$('prize-note').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});},480);confetti(85);};
$('gift-received').onclick=()=>show('invite');
function renderInvite(){if(state.inviteOpened){$('envelope').classList.add('opened');$('letter-card').hidden=false;$('envelope-hint').textContent='INVITATION OPENED ♡';}}
$('envelope').onclick=()=>{if(state.inviteOpened)return;state.inviteOpened=true;store();$('envelope').classList.add('opened');$('envelope-hint').textContent='INVITATION OPENED ♡';setTimeout(()=>{$('letter-card').hidden=false;$('letter-card').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});},700);};
$('accept-invite').onclick=()=>{$('reply-feedback').textContent=C.acceptMessage;confetti(110);};
$('later-invite').onclick=()=>{$('reply-feedback').textContent=C.laterMessage;};
$('restart').onclick=()=>{state={...initial};store();currentIndex=-1;$('gift-box').classList.remove('opened');$('prize-note').hidden=true;$('gift-instruction').textContent='↑ TAP TO UNWRAP YOUR PRIZE ↑';$('envelope').classList.remove('opened');$('letter-card').hidden=true;$('envelope-hint').textContent='PRESS TO OPEN THE INVITATION';$('reply-feedback').textContent='';show('home');};
show(state.stage);
})();
