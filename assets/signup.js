(()=>{
 /* ---------------------------------------------------------------
  * Sticker / Join flow.
  * Steps 0-2: details + address (validated client-side).
  * Final submit mirrors the cart checkout (assets/js/ith-monsoon.js):
  *   capture address via FormSubmit → POST /api/create-order (server
  *   creates the Razorpay order; secret stays server-side) → open
  *   Razorpay Checkout for the fixed Rs 47.50 shipping contribution.
  * ------------------------------------------------------------- */
 const RZP_KEY='rzp_live_Si0l9ROHLTplT2';     // public key id (same as the cart)
 const CREATE_ORDER_URL='/api/create-order';
 const FORMSUBMIT='https://formsubmit.co/ajax/info@inspiretalenthub.in';
 const CONTACT='info@inspiretalenthub.in';
 const AMOUNT_RUPEES=47.5;
 const AMOUNT_LABEL='₹47.50';

 const form=document.querySelector('#sticker-form');if(!form)return;
 let step=0;const panels=[...form.querySelectorAll('fieldset')];
 function show(n){step=n;panels.forEach((p,i)=>p.hidden=i!==n);document.querySelectorAll('.step-progress span').forEach((p,i)=>p.classList.toggle('active',i<=n));if(n===2){const review=document.querySelector('#signup-review');review.replaceChildren();for(const [key,value]of new FormData(form)){if(key.startsWith('_')||['Consent','Competition updates'].includes(key))continue;const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;review.append(dt,dd);}}panels[n].querySelector('input,button')?.focus({preventScroll:true});form.querySelector('.character-scene')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 form.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>{const fields=[...panels[step].querySelectorAll('input,select')];if(fields.every(f=>f.reportValidity()))show(step+1);});
 form.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show(step-1));

 const val=n=>{const f=form.querySelector('[name="'+n+'"]');return f?String(f.value).trim():'';};
 const addressString=()=>[val('Address'),val('City'),val('State'),val('Postal code'),val('Country')].filter(Boolean).join(', ');

 function sendAddressRecord(){
  const data=new FormData(form);
  if(!data.get('_subject'))data.set('_subject','Inspire Talent Hub - sticker signup request');
  data.set('_captcha','false');data.set('Shipping contribution',AMOUNT_LABEL);
  return fetch(FORMSUBMIT,{method:'POST',body:data,headers:{'Accept':'application/json'}}).catch(()=>{});
 }
 function successPanel(ref){
  const done=document.createElement('div');done.className='signup-complete';
  const star=document.createElement('div');star.className='celebration-star';star.textContent='✦';
  const h=document.createElement('h2');h.textContent='Payment received — thank you!';
  const p=document.createElement('p');p.textContent='Your '+AMOUNT_LABEL+' shipping contribution is confirmed and your sticker pack is on its way. Reference: '+ref+'. We’ll email tracking details after dispatch.';
  const a=document.createElement('a');a.className='primary-action';a.href='competition.html';a.textContent='Explore the competitions ↗';
  done.append(star,h,p,a);
  form.replaceWith(done);
  done.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }

 let busy=false;
 form.addEventListener('submit',e=>{
  e.preventDefault();
  if(step!==2)return;
  const invalid=[...form.querySelectorAll('input')].find(f=>!f.validity.valid);
  if(invalid){show(panels.indexOf(invalid.closest('fieldset')));invalid.reportValidity();return;}
  if(busy)return;busy=true;
  const btn=form.querySelector('[type="submit"]');const restore=btn?btn.textContent:'';if(btn){btn.disabled=true;btn.textContent='Securing…';}
  let status=form.querySelector('.signup-status');
  if(!status){status=document.createElement('p');status.className='signup-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');panels[2].append(status);}
  status.textContent='Starting secure payment…';
  const name=val('Name'),email=val('Email');
  if(!window.Razorpay){status.textContent='The payment library didn’t load — please refresh and try again.';if(btn){btn.disabled=false;btn.textContent=restore;}busy=false;return;}
  sendAddressRecord();
  fetch(CREATE_ORDER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    amountToPay:AMOUNT_RUPEES,mode:'sticker',name:name,email:email,
    schoolName:'Sticker request',schoolAddress:addressString().substring(0,120),
    cartSummary:'Inspire Talent Hub sticker pack x1 (shipping contribution)'
  })})
   .then(r=>r.json())
   .then(order=>{
    if(!order||!order.id)throw new Error((order&&order.error)||'Could not start the payment.');
    const rzp=new Razorpay({
     key:RZP_KEY,amount:order.amount,currency:order.currency||'INR',
     name:'Inspire Talent Hub',description:'Sticker pack — shipping contribution ('+AMOUNT_LABEL+')',
     order_id:order.id,prefill:{name:name,email:email},theme:{color:'#4d8dff'},
     handler:function(res){successPanel(res.razorpay_payment_id||order.id||'');},
     modal:{ondismiss:function(){if(btn){btn.disabled=false;btn.textContent=restore;}status.textContent='Payment cancelled — your details are saved. You can try again, or email '+CONTACT+'.';busy=false;}}
    });
    rzp.on('payment.failed',function(resp){status.textContent='Payment failed: '+((resp.error&&resp.error.description)||'please try again.');if(btn){btn.disabled=false;btn.textContent=restore;}busy=false;});
    rzp.open();status.textContent='Complete the payment in the secure window…';
   })
   .catch(()=>{
    status.replaceChildren();
    status.append(document.createTextNode('We’ve saved your details. To complete the '+AMOUNT_LABEL+' shipping contribution, please email '));
    const a=document.createElement('a');a.href='mailto:'+CONTACT+'?subject='+encodeURIComponent('Sticker contribution – payment link request');a.textContent=CONTACT;
    status.append(a,document.createTextNode(' and we’ll send a secure payment link.'));
    if(btn){btn.disabled=false;btn.textContent=restore;}busy=false;
   });
 });
})();
