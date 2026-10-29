(function(){
'use strict';
const c=window.NOMIA_CONTENT;
const $=id=>document.getElementById(id);
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const setText=(id,text)=>{if($(id))$(id).textContent=text;};
const moods={
 idle:{message:'Одоогоор 0% stress, 100% birthday mode.',text:'tap me! ↗'},
 ac:{message:'Accepted! Номиагийн инээмсэглэл автоматаар идэвхжлээ. ✓',text:'AC! ♡'},
 wa:{message:'Wrong Answer... Компьютер л буруу байх. (Магадгүй.)',text:'WA?!'},
 cake:{message:'Cake > Code. Үүнийг шинжлэх ухаан батлаагүй ч үнэн.',text:'cake! 🎂'}
};
function mascotSVG(mood='idle',small=false){
 const wa=mood==='wa',ac=mood==='ac',cake=mood==='cake';
 const mouth=wa?'<path d="M97 137q10 -13 20 0" fill="none" stroke="#302830" stroke-width="4" stroke-linecap="round"/>':ac?'<path d="M85 126q18 22 34 0" fill="none" stroke="#302830" stroke-width="4" stroke-linecap="round"/><path d="M98 139q5 9 10 0" fill="#ef788e" stroke="#302830" stroke-width="2"/>':'<path d="M90 126q8 13 17 2q4 -5 10 0" fill="none" stroke="#302830" stroke-width="4.5" stroke-linecap="round"/><path d="M108 131q10 1 7 10q-7 7 -11 -4z" fill="#f96f74" stroke="#302830" stroke-width="2"/>';
 return `<svg viewBox="0 0 200 240" role="img" aria-label="Cute pink-cheeked birthday doodle${wa?', confused':''}">
 <g fill="none" stroke="#302830" stroke-width="5" stroke-linecap="round"><path d="M49 27l-13 -12M79 16l-2 -14M123 17l5 -14M151 29l13 -12"/></g>
 ${cake?'<path d="M81 43L105 -9 129 43Z" fill="#ffc6d6" stroke="#302830" stroke-width="3"/><path d="M105 3v12" stroke="#fff" stroke-width="5"/>':''}
 <path d="M65 176q-9 43 11 50q8 5 18 0q6 6 13 1q26-4 17-51" fill="#fff" stroke="#302830" stroke-width="5"/>
 <path d="M74 220q-4 16 11 17q9 0 10-11M106 226q1 13 11 11q13-2 8-19" fill="#fff" stroke="#302830" stroke-width="5" stroke-linecap="round"/>
 <path d="M31 103Q12 91 14 111Q15 128 34 124M169 103Q188 91 188 111Q186 127 167 124" fill="#fff" stroke="#302830" stroke-width="5"/>
 <path d="M101 40C148 39 170 74 170 118C170 158 143 182 100 182C56 182 29 156 30 117C31 74 54 40 101 40Z" fill="#fff" stroke="#302830" stroke-width="5.5"/>
 <path d="M79 77q5 -4 10 -1M115 74q5 -3 9 0" fill="none" stroke="#302830" stroke-width="4" stroke-linecap="round"/>
 ${wa?'<path d="M86 97l-5 12m0 -12l5 12M119 97l-5 12m0 -12l5 12" fill="none" stroke="#302830" stroke-width="4" stroke-linecap="round"/>':'<path d="M86 99v13M116 99v13" fill="none" stroke="#302830" stroke-width="5" stroke-linecap="round"/>'}
 <ellipse cx="64" cy="128" rx="16" ry="7" fill="#ee82be" stroke="#302830" stroke-width="2"/>
 <ellipse cx="140" cy="128" rx="16" ry="7" fill="#ee82be" stroke="#302830" stroke-width="2"/>
 ${mouth}
 <path d="M76 181q-15 -5 -15-18q0-14 13-13q14 0 17 19M122 181q15 -5 15 -18q0-14 -13-13q-14 0 -17 19" fill="#fff" stroke="#302830" stroke-width="5" stroke-linecap="round"/>
 ${ac?'<text x="155" y="77" font-size="25" fill="#e878a2">✦</text>':''}
 ${wa?'<text x="145" y="60" font-family="sans-serif" font-weight="900" font-size="25" fill="#e878a2">?</text>':''}
 </svg>`;
}
const getRandom=(arr)=>arr[Math.floor(Math.random()*arr.length)];
let toastTimer=0;
function toast(text){const t=$('toast');t.textContent=text;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,2700);}
function confetti(n=70){if(reduced)return;const host=$('confetti');const colors=['#e76b99','#ffd89b','#cbb7fa','#99d9bf','#fff','#fa91c5'];for(let i=0;i<n;i++){
 const span=document.createElement('span');span.className='confetti-piece';span.style.left=Math.random()*100+'%';span.style.background=colors[i%colors.length];span.style.setProperty('--duration',(1.8+Math.random()*2.1)+'s');span.style.setProperty('--x',(Math.random()*220-110)+'px');span.style.setProperty('--r',(Math.random()*1440-720)+'deg');span.style.animationDelay=(Math.random()*.5)+'s';host.append(span);setTimeout(()=>span.remove(),4900);
}}
function initContent(){
 setText('hero-title',c.heroTitle); // replace with designed multi-line headline below preserving typography
 $('hero-title').innerHTML='<span class="hello-word">hello,</span><br><span class="nomia-word">Nomia<span class="squiggle">~</span></span><span class="hero-heart">♥</span>';
 setText('hero-description',c.heroSubtitle);
 setText('hero-footnote',c.introNote);
 setText('queen-copy',c.queenCopy);
 setText('study-copy',c.studyCopy);
 setText('letter-sender',c.sender);
 c.letter.forEach(p=>{const el=document.createElement('p');el.textContent=p;$('letter-content').append(el);});
 $('passport-mascot').innerHTML=mascotSVG('idle',true);
 $('hero-mascot').innerHTML=mascotSVG();
 $('mood-mascot').innerHTML=mascotSVG();
}
function initMascot(){let taps=0;
 $('hero-mascot-btn').addEventListener('click',()=>{
  taps++;const mood=['ac','cake','wa','ac'][taps%4];$('hero-mascot').innerHTML=mascotSVG(mood);
  const quips=['Намайг дахиад дарна аа? 😌','AC боллоо! Одоо бялуу идэж болно.','WA? За энэ ч арай л...','Би чинь Номиагийн хамгаалагч шүү. ♡'];
  $('hero-mascot-talk').textContent=quips[(taps-1)%quips.length];
  if(taps%4===2)confetti(24);
 });
 document.querySelectorAll('[data-mood]').forEach(btn=>btn.addEventListener('click',()=>{
 const mood=btn.dataset.mood;$('mood-mascot').innerHTML=mascotSVG(mood);setText('mood-caption',moods[mood].message);
 if(mood==='ac')confetti(32);
 }));
}
function initPuzzle(){let skipped=false;const input=$('code-answer');
 $('hint-code').addEventListener('click',()=>{$('hint-box').hidden=!$('hint-box').hidden;});
 $('skip-code').addEventListener('click',()=>{
   skipped=true;$('code-result').hidden=true;$('code-unlock').hidden=false;
   $('code-unlock').querySelector('h4').textContent='A little birthday surprise ♡';
   $('code-unlock').querySelector('.mono').textContent='BIRTHDAY MODE · NO JUDGMENT';
   toast('Skipped! Birthday happiness is not behind a password. ♡');
 });
 $('submit-code').addEventListener('click',()=>{
   const ans=input.value.trim();
   const result=window.BirthdayPuzzle.judge(ans);const out=$('code-result');out.hidden=false;out.classList.remove('wa','ac','ce');
   if(result.status==='AC'){
     out.classList.add('ac');out.textContent=`✓ Accepted · ${result.checked} test cases passed · 100/100`;
     $('code-unlock').hidden=false;$('code-unlock').querySelector('h4').textContent='EGOI Queen energy!';$('code-unlock').querySelector('.mono').textContent='ACCEPTED · 100/100';
     if(!skipped)confetti(100);
     out.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});
   }else if(result.status==='WA'){
     out.classList.add('wa');out.textContent=`✕ Wrong Answer on test ${result.test}\ninput: ${result.input}\nexpected: ${result.expected}, got: ${result.got}\nДахиад оролдоорой. Queen ч гэсэн WA авдаг!`;
   }else{
     out.classList.add('ce');out.textContent='⚠ Compilation Error: '+result.message+'\nЗөвхөн if доторх C++ нөхцөлөө бичээрэй.';
   }
 });
}
function initGift(){const btn=$('gift-btn');let opened=false;btn.addEventListener('click',()=>{
 if(opened){toast('Энэ хайрцаг одоо хоосон шүү. 😭');return;}
 opened=true;btn.classList.add('open');$('gift-note').hidden=false;setText('gift-note',c.giftMessage);confetti(45);
 });}
function initSecrets(){const host=$('secret-grid');const clicked=new Set();const icons=['✳','♡','✦','✿','✧','♥','★','☼','✺','✶','✽','♧','✧','☻','✳','✿','♡','✦','♥'];
 c.secretNotes.forEach((note,i)=>{
 const btn=document.createElement('button');btn.type='button';btn.className='secret-token reveal';btn.setAttribute('aria-label',`Reveal birthday note ${i+1}`);
 btn.innerHTML=`<span aria-hidden="true">${icons[i]||'✳'}</span><span class="token-num">${String(i+1).padStart(2,'0')}</span>`;
 btn.addEventListener('click',()=>{
   clicked.add(i);btn.classList.add('discovered');btn.setAttribute('aria-label',`Birthday note ${i+1} revealed`);
   $('secret-display').querySelector('span').textContent=icons[i];$('secret-display').querySelector('p').textContent=note;
   setText('secret-count',clicked.size);$('secret-fill').style.width=(clicked.size/19*100)+'%';
   if(clicked.size===19)confetti(100);
   if(!reduced)btn.animate([{transform:'scale(1)'},{transform:'scale(1.23) rotate(10deg)'},{transform:'scale(1)'}],{duration:350,easing:'ease-out'});
 });host.append(btn);
 });
}
function initMemory(){let cards=[],revealed=[],matched=new Set(),locked=false,turn=0;
 const host=$('memory-grid');
 function reset(){host.innerHTML='';cards=['♡','✳','⌘','♡','✳','⌘'].map((val,key)=>({val,key}));for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
 revealed=[];matched.clear();locked=false;turn=0;setText('memory-message','Find the 3 matching pairs!');
 cards.forEach((card,pos)=>{const b=document.createElement('button');b.type='button';b.className='memory-cell';b.setAttribute('aria-label',`Flip card ${pos+1}`);b.textContent='?';b.addEventListener('click',()=>{
 if(locked||matched.has(pos)||revealed.includes(pos))return;
 b.classList.add('flipped');b.textContent=card.val;b.setAttribute('aria-label',`${card.val} flipped`);revealed.push(pos);
 if(revealed.length===2){turn++;const[a,bidx]=revealed;if(cards[a].val===cards[bidx].val){matched.add(a);matched.add(bidx);for(const j of revealed)host.children[j].classList.add('matched');revealed=[];
 if(matched.size===cards.length){setText('memory-message',`All matched in ${turn} turns — AC! ♡`);confetti(60);}
 }else{locked=true;setText('memory-message','Wrong pair — retry!');setTimeout(()=>{for(const j of revealed){host.children[j].textContent='?';host.children[j].classList.remove('flipped');host.children[j].setAttribute('aria-label',`Flip card ${j+1}`);}revealed=[];locked=false;},750);}
 }
 });host.append(b);});}
 $('memory-reset').addEventListener('click',reset);reset();}
function initCandle(){let blown=false;$('candle-button').addEventListener('click',()=>{
 if(blown){toast('Хүсэл чинь аль хэдийн явсан шүү! ✨');return;}
 blown=true;$('candle-flame').classList.add('blown');$('cake-photo').hidden=false;
 setText('wish-message','✓ Wish submitted successfully ✨');$('candle-button').setAttribute('aria-label','Birthday candle blown out');confetti(90);
 });}
function initScroll(){const revealers=[...document.querySelectorAll('.reveal')];
 if(!('IntersectionObserver' in window)){revealers.forEach(x=>x.classList.add('in-view'));return;}
 const obs=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('in-view');obs.unobserve(e.target);}},{threshold:.08,rootMargin:'0px 0px 20px 0px'});revealers.forEach(x=>obs.observe(x));
 const update=()=>{const doc=document.documentElement;const range=Math.max(1,doc.scrollHeight-innerHeight);$('progress-bar').style.width=(Math.max(0,Math.min(100,scrollY/range*100)))+'%';};window.addEventListener('scroll',update,{passive:true});update();
}
function init(){if(!c)return;initContent();initMascot();initPuzzle();initGift();initSecrets();initMemory();initCandle();initScroll();document.body.classList.add('js-ready');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
