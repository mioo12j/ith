(()=>{
 const ENDPOINT='https://formsubmit.co/ajax/info@inspiretalenthub.in';
 const CONTACT='info@inspiretalenthub.in';
 document.querySelectorAll('.preview-form').forEach(form=>{
  if(form.dataset.wired)return; form.dataset.wired='1';
  const status=form.querySelector('.preview-status');
  const submitBtn=form.querySelector('[type="submit"],button:not([type])');
  form.addEventListener('submit',async e=>{
   e.preventDefault();
   if(!form.reportValidity())return;
   if(status){status.replaceChildren();status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent='Sending…';}
   if(submitBtn)submitBtn.disabled=true;
   const subject=form.querySelector('[name="_subject"]')?.value||form.getAttribute('aria-label')||document.title;
   const data=new FormData(form);
   if(!data.get('_subject'))data.set('_subject',subject);
   data.set('_captcha','false');
   try{
    const res=await fetch(ENDPOINT,{method:'POST',body:data,headers:{'Accept':'application/json'}});
    const ok=res.ok;let payload={};try{payload=await res.json();}catch(_){}
    if(ok&&(payload.success==='true'||payload.success===true||res.status<300)){
     if(status){status.replaceChildren();status.textContent='Thank you — your message has been sent. We’ll reply from '+CONTACT+'.';}
     form.reset();
    }else{throw new Error('submit failed');}
   }catch(err){
    if(status){
     status.replaceChildren();
     status.append(document.createTextNode('We couldn’t send that automatically. Please email us directly: '));
     const link=document.createElement('a');link.textContent=CONTACT+' ↗';
     const body=[...new FormData(form)].filter(([k])=>!k.startsWith('_')).map(([k,v])=>k+': '+v).join('\n');
     link.href='mailto:'+CONTACT+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
     status.append(link);
    }
   }finally{if(submitBtn)submitBtn.disabled=false;}
  });
 });
 document.querySelectorAll('.gallery-filters[data-target]').forEach(group=>{const target=document.getElementById(group.dataset.target);if(!target)return;group.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{group.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));target.querySelectorAll('[data-category]').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);}));});
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(items=>items.forEach(i=>{if(i.isIntersecting){i.target.animate([{opacity:.15,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{duration:500,easing:'ease-out'});observer.unobserve(i.target);}}),{threshold:.08});document.querySelectorAll('.footer-content>section').forEach(s=>observer.observe(s));}
})();
