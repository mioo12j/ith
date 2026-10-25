(()=>{
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const voices=[['Pip · your trail guide','fox-point.png','Pip points toward the next chapter'],['Moss · checking the details','turtle-check.png','Moss checks the details'],['Sol · carrying it forward','bird-deliver.png','Sol carries an envelope onward']];
function say(p,text){if(!p)return;p.dispatchEvent(new CustomEvent('guide-speak',{detail:text,bubbles:true}));}
document.querySelectorAll('.journey').forEach(book=>{
 const chapters=[...book.querySelectorAll('.journey-chapter')],guide=book.querySelector('.journey-guide');if(!guide)return;
 const opening=guide.querySelector('p').textContent;let active=-1;
 const custom={
 'To Make Talent':'Imagine the same chance reaching two students in very different places. That is the promise we are following here.',
 'Why We Exist':'A closed door can hide a brilliant idea. This part of the story explains why we wanted to open more of them.',
 'The Values':'Before we go further, these are the principles we carry with us. They should show up in every decision.',
 'How We’re Different':'A promise needs proof. Let’s look at what makes fairness and recognition something you can actually check.',
 'How the Platform':'Here’s the mechanism behind the milestone: the record, the review and the certificate.',
 'What We Promise':'Students, parents and teachers each place their trust here. These are the commitments that trust deserves.',
 'Where We’re Going':'The path continues beyond today. Here’s the future we’re working toward - and what is still being built.',
 'How It Began':'Every journey starts somewhere. Ours began with a question about the students whose talent was going unseen.',
 'Discover, Compete':'Discover a spark, give it a stage, and grow through the experience. That journey is folded into the name.',
 'What We Are Not':'Knowing the boundaries matters too. Let’s be clear about what this platform does - and what it doesn’t promise.',
 'A Standing Invitation':'Now the story reaches you. There is a part for students, teachers, schools and partners to play.',
 'Why Honesty':'The most useful signpost tells the truth. Here is why honest limits matter as much as ambitious plans.',
 'Preparing':'We’ve chosen a direction. Now build your understanding, read the brief and give your idea room to improve.',
 'Taking Part':'This is the moment to put your preparation to work. Check the format and give it your best.',
 'Evaluation':'Your entry now takes a different route: review, consistency checks and an outcome based on the work.',
 'Recognition':'The journey leaves a record you can keep. Here is how your effort becomes a verifiable milestone.'
 };
 const lines=chapters.map((c,i)=>{const title=c.querySelector('h1,h2,h3')?.textContent.trim()||'Our shared promise';const key=Object.keys(custom).find(k=>title.startsWith(k));const who=/trust|fair|judg|evaluat|honest|recogn|certificate|rule|promise|question/i.test(title)?1:/invitation|join|future|vision|going|start|school/i.test(title)?2:0;return {title,who,text:i===0?opening:key?custom[key]:'Let’s look at '+title.toLowerCase()+'. This is another part of the path from a first idea to something you can be proud of.'};});
 function paint(target,line){const v=voices[line.who];target.querySelector('img').src='assets/'+v[1];target.querySelector('img').alt=v[2];target.querySelector('.guide-caption').textContent=v[0];say(target.querySelector('p'),line.text);}
 const mobile=matchMedia('(max-width:767px)');
 chapters.forEach((c,i)=>{c.hidden=false;const mini=guide.cloneNode(true);mini.classList.add('mobile-story-guide');mini.querySelector('p').textContent=lines[i].text;mini.querySelector('p').removeAttribute('aria-live');const v=voices[lines[i].who];mini.querySelector('img').src='assets/'+v[1];mini.querySelector('img').loading='lazy';mini.querySelector('.guide-caption').textContent=v[0];c.prepend(mini);});
 const seen=new Set();const watcher=new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting)return;const i=chapters.indexOf(e.target);if(i<0)return;if(!seen.has(i)){seen.add(i);if(!reduced.matches)e.target.animate([{opacity:.3,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'ease-out'});if(mobile.matches)paint(e.target.querySelector('.mobile-story-guide'),lines[i]);}if(active!==i&&!mobile.matches){active=i;paint(guide,lines[i]);}});},{rootMargin:'-15% 0px -55% 0px',threshold:0});chapters.forEach(c=>watcher.observe(c));
});
const search=document.querySelector('#question-search');if(search){const questions=[...document.querySelectorAll('.official-questions details')],count=document.querySelector('#question-count'),empty=document.querySelector('#question-empty');function filter(){const q=search.value.trim().toLowerCase();let n=0;questions.forEach(el=>{el.hidden=!!q&&!el.textContent.toLowerCase().includes(q);if(!el.hidden)n++;});count.textContent=n+' '+(n===1?'question':'questions');empty.hidden=n!==0;}search.addEventListener('input',filter);filter();}
const scenes=document.querySelectorAll('.page-chapter-guide,.faq-adventure .journey-guide');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const p=e.target.querySelector('.journey-speech');if(p)say(p,p.textContent);observer.unobserve(e.target);}}),{threshold:.3});scenes.forEach(x=>observer.observe(x));
const results=document.querySelector('#portal-results'),portalGuide=document.querySelector('#portal-story');if(results&&portalGuide){new MutationObserver(()=>{let message=results.textContent;if(message.includes('No matching'))say(portalGuide,'That trail didn’t lead to a record. Check the spelling, or try the ID printed on your certificate.');else if(message.includes('at least one'))say(portalGuide,'I need one clue to open the archive: your name, registration number or certificate ID.');else if(message.includes('records match'))say(portalGuide,'More than one trail fits. Add your school or certificate ID so we find the right achievement.');else if(message.includes('popup'))say(portalGuide,'We found your milestone! Open the result, then use the certificate link to keep the official record.');}).observe(results,{childList:true,subtree:true});}
if(!reduced.matches){const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'ease-out',fill:'both'});reveal.unobserve(e.target);}}),{threshold:.15});document.querySelectorAll('.page-chapter-guide,.official-event,.faq-adventure,.journey-tools').forEach(el=>reveal.observe(el));}
})();
