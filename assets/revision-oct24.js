(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;observer.unobserve(e.target);if(!reduce.matches)e.target.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'ease-out'});const p=e.target.matches('[data-say]')?e.target:e.target.querySelector('[data-say]');if(p&&!p.dataset.spoken){p.dataset.spoken="true";p.dispatchEvent(new CustomEvent('guide-speak',{detail:p.textContent,bubbles:true}));}}),{threshold:.15});
 document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));
 document.querySelectorAll('.rev-carousel').forEach(car=>{
  const track=car.querySelector('.rev-track'),cards=[...track.children],count=car.querySelector('[data-slide-count]'),play=car.querySelector('[data-play]');let index=0,paused=reduce.matches,visible=false,hover=false,focused=false;
  function paint(){cards.forEach((c,i)=>c.classList.toggle('is-active',i===index));count.textContent=(index+1)+' / '+cards.length;play.textContent=paused?'Play rotation':'Pause rotation';}
  function go(n){index=(n+cards.length)%cards.length;track.scrollTo({left:cards[index].offsetLeft-track.offsetLeft-(track.clientWidth-cards[index].clientWidth)/2,behavior:reduce.matches?'instant':'smooth'});paint();}
  car.querySelector('[data-prev]').addEventListener('click',()=>go(index-1));car.querySelector('[data-next]').addEventListener('click',()=>go(index+1));play.addEventListener('click',()=>{paused=!paused;if(!paused){focused=false;hover=false;}paint()});
  car.addEventListener('mouseenter',()=>{if(!car.querySelector('.certificate-slide'))hover=true});car.addEventListener('mouseleave',()=>hover=false);car.addEventListener('focusin',()=>focused=true);car.addEventListener('focusout',e=>{if(!car.contains(e.relatedTarget))focused=false});
  let scrollEnd;track.addEventListener('scroll',()=>{clearTimeout(scrollEnd);scrollEnd=setTimeout(()=>{const mid=track.getBoundingClientRect().left+track.clientWidth/2;index=cards.reduce((best,c,i)=>Math.abs(c.getBoundingClientRect().left+c.clientWidth/2-mid)<Math.abs(cards[best].getBoundingClientRect().left+cards[best].clientWidth/2-mid)?i:best,0);paint()},160)});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{threshold:.1}).observe(car);
  setInterval(()=>{if(!paused&&!hover&&!focused&&visible&&!document.hidden)go(index+1)},4200);reduce.addEventListener('change',()=>{paused=reduce.matches;paint()});paint();
 });
 // Give value and commitment groups a readable two-column layout without rewriting their text.
 document.querySelectorAll('.rev-about-section h3').forEach(h=>{const card=h.parentElement;card.classList.add('rev-value-card');if(card.parentElement.querySelectorAll(':scope > .rev-value-card').length>1)card.parentElement.classList.add('value-grid')});
})();

(()=>{const d=document.getElementById("results-announcement");if(!d)return;d.querySelectorAll("button").forEach(b=>b.onclick=()=>d.close());})();
