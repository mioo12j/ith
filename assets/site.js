'use strict';
(() => {
 const root=document.documentElement, reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const themeButtons=[...document.querySelectorAll('.theme-toggle')];
 function setTheme(dark){root.classList.toggle('dark',dark);root.style.colorScheme=dark?'dark':'light';themeButtons.forEach(b=>{b.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);b.setAttribute('aria-pressed',String(dark));});}
 /* Theme is set before paint by world-theme.js. */
 themeButtons.forEach(b=>b.addEventListener('click',()=>{const dark=!root.classList.contains('dark');setTheme(dark);try{localStorage.setItem('inspire-theme-v2',dark?'dark':'light');}catch{}}));
 const menu=document.querySelector('#mobile-nav-menu'), toggle=document.querySelector('#menu-toggle');
 function closeMenu(){if(!menu)return;menu.hidden=true;toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open navigation');}
 toggle?.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
 menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu&&!menu.hidden){closeMenu();toggle.focus();}});
 document.addEventListener('click',e=>{if(menu&&!menu.hidden&&!menu.contains(e.target)&&!toggle.contains(e.target))closeMenu();});
 matchMedia('(min-width:1280px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
 // The archive's original hero parallax factors, with a passive, single-frame scroll update.
 const hero=document.querySelector('#home'), photos=[...document.querySelectorAll('[data-parallax-rate]')];
 const background=hero?.querySelector('img[src="assets/school-doodles.png"]')?.parentElement;
 let scrollFrame=0;
 function updateScroll(){scrollFrame=0;if(!hero)return;const y=reduced.matches?0:Math.max(0,scrollY-hero.offsetTop);photos.forEach(p=>{p.style.transform=`translate3d(0, ${y*Number(p.dataset.parallaxRate||0)}px, 0)`;});if(background)background.style.transform=`translate3d(-50%, ${y*.4}px, 0)`;}
 addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});addEventListener('resize',updateScroll);reduced.addEventListener('change',updateScroll);updateScroll();
 photos.forEach(p=>{const inner=p.firstElementChild,frame=inner?.firstElementChild;if(!frame)return;frame.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'||reduced.matches)return;const left=!!p.closest('.hero-photos-left');inner.style.transform=`translateX(${left?140:-140}px) translateY(${parseFloat(p.style.top)<450?40:-40}px)`;});frame.addEventListener('pointerleave',()=>inner.style.transform='none');});
 // Two independent, seamless arena tracks. Pause on hover, keyboard focus, or explicit control.
 const tracks=[...document.querySelectorAll('.carousel-track')];let manualPause=false;

 const states=tracks.map((track,i)=>{const originals=[...track.children];originals.forEach(card=>{const clone=card.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.querySelectorAll('a').forEach(a=>a.tabIndex=-1);track.append(clone);});let paused=false;track.addEventListener('pointerenter',()=>paused=true);track.addEventListener('pointerleave',()=>paused=false);return{track,index:i,x:0,paused:()=>paused||track.contains(document.activeElement)};});
 let last=0;function animate(time){const dt=Math.min((time-last)||0,40);last=time;states.forEach(st=>{const rect=st.track.getBoundingClientRect();if(reduced.matches||manualPause||st.paused()||rect.bottom<0||rect.top>innerHeight)return;const half=(st.track.scrollWidth+20)/2;st.x=(st.x+dt*.025)%half;st.track.style.transform=`translateX(${st.index%2?st.x-half:-st.x}px)`;});if(states.length)requestAnimationFrame(animate);}if(states.length)requestAnimationFrame(animate);
 const dialog=document.querySelector('#photo-dialog');document.querySelector('.gallery-photo')?.addEventListener('click',()=>dialog.showModal());dialog?.querySelector('.close-dialog')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 const search=document.querySelector('#arena-search');function filter(){if(!search)return;const q=search.value.trim().toLowerCase();let count=0;document.querySelectorAll('.arena-detail').forEach(card=>{card.hidden=!card.dataset.search.includes(q);if(!card.hidden)count++;});document.querySelector('#search-count').textContent=`${count} ${count===1?'arena':'arenas'}`;document.querySelector('#no-results').hidden=count>0;}search?.addEventListener('input',filter);document.querySelector('#clear-search')?.addEventListener('click',()=>{search.value='';filter();search.focus();});
})();
