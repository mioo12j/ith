(()=>{
 /* ---------------------------------------------------------------
  * Sticker / Join flow.
  * Step 1-2: details + address (validated client-side).
  * Final submit: the address is sent to Inspire Talent Hub via
  * FormSubmit (no application server needed), then the visitor is
  * shown the fixed shipping contribution of Rs 47.50 and a secure
  * Razorpay payment.
  *
  * CONFIG — set RAZORPAY_BUTTON_ID to the Payment Button you create
  * in the Razorpay Dashboard (Payment Button, fixed amount Rs 47.50).
  * Dashboard -> Payment Button -> create -> copy the id (pl_XXXXXXXX).
  * While it is empty, the request is still captured and the visitor
  * is told a secure payment link will be emailed.
  * ------------------------------------------------------------- */
 const RAZORPAY_BUTTON_ID='';
 const ENDPOINT='https://formsubmit.co/ajax/info@inspiretalenthub.in';
 const CONTACT='info@inspiretalenthub.in';
 const AMOUNT='₹47.50';

 const form=document.querySelector('#sticker-form');if(!form)return;
 let step=0;const panels=[...form.querySelectorAll('fieldset')];
 function show(n){step=n;panels.forEach((p,i)=>p.hidden=i!==n);document.querySelectorAll('.step-progress span').forEach((p,i)=>p.classList.toggle('active',i<=n));if(n===2){const review=document.querySelector('#signup-review');review.replaceChildren();for(const [key,value]of new FormData(form)){if(key.startsWith('_')||['Consent','Competition updates'].includes(key))continue;const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;review.append(dt,dd);}}panels[n].querySelector('input,button')?.focus({preventScroll:true});form.querySelector('.character-scene')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 form.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>{const fields=[...panels[step].querySelectorAll('input,select')];if(fields.every(f=>f.reportValidity()))show(step+1);});
 form.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show(step-1));

 function paymentNode(){
  const wrap=document.createElement('div');wrap.className='sticker-payment';
  if(RAZORPAY_BUTTON_ID){
   const p=document.createElement('p');p.textContent='Shipping contribution: '+AMOUNT+' ($0.50). Pay securely below — cards, UPI and net-banking, international cards accepted.';wrap.append(p);
   const payForm=document.createElement('form');
   const s=document.createElement('script');s.src='https://cdn.razorpay.com/static/widget/payment-button.js';s.async=true;s.setAttribute('data-payment_button_id',RAZORPAY_BUTTON_ID);
   payForm.append(s);wrap.append(payForm);
  }else{
   const p=document.createElement('p');p.innerHTML='Shipping contribution: <strong>'+AMOUNT+'</strong> ($0.50; Inspire Talent Hub covers the rest). We will email a secure Razorpay payment link to the address you entered. Stickers ship worldwide once the contribution is received; tracking is shared after dispatch.';wrap.append(p);
   const a=document.createElement('a');a.className='primary-action';a.href='mailto:'+CONTACT+'?subject='+encodeURIComponent('Sticker contribution – payment link request');a.textContent='Email us for the payment link ↗';wrap.append(a);
  }
  return wrap;
 }

 let sending=false;
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(step!==2)return;
  const invalid=[...form.querySelectorAll('input')].find(f=>!f.validity.valid);
  if(invalid){show(panels.indexOf(invalid.closest('fieldset')));invalid.reportValidity();return;}
  if(sending)return;sending=true;
  const submitBtn=form.querySelector('[type="submit"]');if(submitBtn){submitBtn.disabled=true;submitBtn.dataset.label=submitBtn.textContent;submitBtn.textContent='Sending…';}
  let status=form.querySelector('.signup-status');
  if(!status){status=document.createElement('p');status.className='signup-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');panels[2].append(status);}
  status.textContent='Recording your request…';
  const data=new FormData(form);
  if(!data.get('_subject'))data.set('_subject','Inspire Talent Hub - sticker signup request');
  data.set('_captcha','false');data.set('Shipping contribution',AMOUNT);
  try{
   const res=await fetch(ENDPOINT,{method:'POST',body:data,headers:{'Accept':'application/json'}});
   let payload={};try{payload=await res.json();}catch(_){}
   if(!(res.ok&&(payload.success==='true'||payload.success===true||res.status<300)))throw new Error('submit failed');
   const done=document.createElement('div');done.className='signup-complete';
   const star=document.createElement('div');star.className='celebration-star';star.textContent='✦';
   const h=document.createElement('h2');h.textContent='Request received — thank you!';
   const intro=document.createElement('p');intro.textContent='Your sticker request and shipping address are on their way to our team. Last step: the shipping contribution.';
   done.append(star,h,intro,paymentNode());
   const link=document.createElement('a');link.className='secondary-action';link.href='competition.html';link.textContent='Explore the competitions ↗';done.append(link);
   form.replaceWith(done);done.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }catch(err){
   status.replaceChildren();
   status.append(document.createTextNode('We couldn’t send that just now — your details are still here. Please try again, or email '));
   const a=document.createElement('a');a.href='mailto:'+CONTACT+'?subject='+encodeURIComponent('Sticker signup request');a.textContent=CONTACT;status.append(a,document.createTextNode('.'));
   if(submitBtn){submitBtn.disabled=false;submitBtn.textContent=submitBtn.dataset.label||'Submit';}
   sending=false;
  }
 });
})();
