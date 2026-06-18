/* NOIR shared cart — include on every page with <script src="cart.js"></script> */
(function(){
  const KEY='noir_cart';
  let mem=[];
  function load(){ try{ const v=localStorage.getItem(KEY); return v?JSON.parse(v):[]; }catch(e){ return mem; } }
  function save(c){ try{ localStorage.setItem(KEY, JSON.stringify(c)); }catch(e){ mem=c; } }
  let cart=load();

  const css=`
  .noir-cart-btn{position:fixed;right:18px;bottom:18px;z-index:60;background:#100C0A;color:#F3ECE1;border:none;cursor:pointer;width:60px;height:60px;border-radius:50%;font-size:24px;box-shadow:0 10px 30px rgba(16,12,10,.35);display:flex;align-items:center;justify-content:center;transition:transform .18s}
  .noir-cart-btn:hover{transform:translateY(-2px)}
  .noir-cart-badge{position:absolute;top:-3px;right:-3px;background:#7E5435;color:#fff;font-size:12px;font-weight:700;min-width:22px;height:22px;border-radius:11px;display:flex;align-items:center;justify-content:center;padding:0 6px;font-family:'Nunito',sans-serif}
  .noir-ov{position:fixed;inset:0;background:rgba(16,12,10,.45);z-index:70;opacity:0;pointer-events:none;transition:opacity .25s}
  .noir-ov.open{opacity:1;pointer-events:auto}
  .noir-dr{position:fixed;top:0;right:0;height:100%;width:min(400px,92vw);background:#F3ECE1;z-index:80;transform:translateX(100%);transition:transform .3s cubic-bezier(.2,.7,.2,1);display:flex;flex-direction:column;font-family:'Nunito',sans-serif}
  .noir-dr.open{transform:none}
  .noir-dh{padding:24px 24px 14px;display:flex;justify-content:space-between;align-items:center}
  .noir-dh h3{font-family:'Fredoka',sans-serif;font-weight:700;font-size:24px;color:#100C0A}
  .noir-dx{background:none;border:none;font-size:28px;cursor:pointer;color:#5A3A28;line-height:1}
  .noir-items{flex:1;overflow-y:auto;padding:0 24px}
  .noir-ci{display:flex;gap:12px;padding:16px 0;border-top:1px solid rgba(90,58,40,.16)}
  .noir-ci .n{font-family:'Fredoka',sans-serif;font-weight:600;color:#100C0A}
  .noir-ci .q{display:inline-flex;align-items:center;gap:12px;margin-top:8px;border:2px solid #100C0A;border-radius:100px;padding:2px 10px}
  .noir-ci .q button{background:none;border:none;font-size:17px;cursor:pointer;font-family:'Fredoka';color:#100C0A}
  .noir-ci .r{text-align:right;margin-left:auto}
  .noir-ci .p{font-family:'Fredoka';font-weight:600;color:#5A3A28}
  .noir-ci .x{background:none;border:none;color:rgba(16,12,10,.45);font-size:12px;text-decoration:underline;cursor:pointer;margin-top:8px;font-family:'Nunito'}
  .noir-empty{padding:50px 24px;text-align:center;color:rgba(16,12,10,.55)}
  .noir-foot{padding:20px 24px 26px;border-top:1px solid rgba(90,58,40,.16)}
  .noir-tot{display:flex;justify-content:space-between;align-items:baseline;font-family:'Fredoka',sans-serif;font-weight:700;font-size:18px;margin-bottom:14px;color:#100C0A}
  .noir-tot span:last-child{font-size:26px}
  .noir-co{width:100%;background:#100C0A;color:#F3ECE1;border:none;border-radius:100px;padding:15px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:16px;cursor:pointer;transition:transform .18s}
  .noir-co:hover{transform:translateY(-1px)}
  .noir-co:disabled{opacity:.5;cursor:not-allowed}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  const btn=document.createElement('button'); btn.className='noir-cart-btn'; btn.setAttribute('aria-label','Open cart');
  btn.innerHTML='\u{1F6D2}<span class="noir-cart-badge" id="noirBadge">0</span>';
  const ov=document.createElement('div'); ov.className='noir-ov';
  const dr=document.createElement('div'); dr.className='noir-dr';
  dr.innerHTML='<div class="noir-dh"><h3>Your box</h3><button class="noir-dx" aria-label="Close">&times;</button></div>'+
    '<div class="noir-items" id="noirItems"></div>'+
    '<div class="noir-foot"><div class="noir-tot"><span>Total</span><span id="noirTotal">\u20ac0.00</span></div>'+
    '<button class="noir-co" id="noirCheckout">Checkout</button></div>';
  document.body.appendChild(btn); document.body.appendChild(ov); document.body.appendChild(dr);

  function open(){ ov.classList.add('open'); dr.classList.add('open'); }
  function close(){ ov.classList.remove('open'); dr.classList.remove('open'); }
  btn.onclick=open; ov.onclick=close; dr.querySelector('.noir-dx').onclick=close;

  const count=()=>cart.reduce((a,i)=>a+i.qty,0);
  const total=()=>cart.reduce((a,i)=>a+i.unit*i.qty,0);

  function render(){
    document.getElementById('noirBadge').textContent=count();
    const w=document.getElementById('noirItems');
    if(!cart.length){ w.innerHTML='<div class="noir-empty">Your box is empty.</div>'; }
    else{
      w.innerHTML=cart.map((it,i)=>'<div class="noir-ci"><div><div class="n">'+it.name+'</div>'+
        '<div class="q"><button data-d="'+i+'">&minus;</button><span>'+it.qty+'</span><button data-u="'+i+'">+</button></div></div>'+
        '<div class="r"><div class="p">\u20ac'+(it.unit*it.qty).toFixed(2)+'</div><button class="x" data-x="'+i+'">remove</button></div></div>').join('');
    }
    document.getElementById('noirTotal').textContent='\u20ac'+total().toFixed(2);
    document.getElementById('noirCheckout').disabled=!cart.length;
  }

  document.getElementById('noirItems').addEventListener('click',e=>{
    const t=e.target;
    if(t.dataset.u!==undefined){ cart[t.dataset.u].qty++; }
    else if(t.dataset.d!==undefined){ const x=+t.dataset.d; cart[x].qty--; if(cart[x].qty<1) cart.splice(x,1); }
    else if(t.dataset.x!==undefined){ cart.splice(+t.dataset.x,1); }
    else return;
    save(cart); render();
  });

  document.getElementById('noirCheckout').onclick=async function(){
    const b=this; b.disabled=true; b.textContent='Loading\u2026';
    try{
      const res=await fetch('/.netlify/functions/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({items:cart.map(i=>({nm:i.name,dt:i.name,unit:i.unit,qty:i.qty}))})});
      if(!res.ok) throw 0;
      const d=await res.json(); window.location.href=d.url;
    }catch(e){ b.disabled=false; b.textContent='Checkout';
      alert("Checkout isn't connected yet \u2014 add the Stripe Netlify function and this goes live."); }
  };

  window.NOIRCart={ add:function(item){
    const ex=cart.find(i=>i.id===item.id);
    if(ex) ex.qty+=item.qty; else cart.push(Object.assign({},item));
    save(cart); render(); open();
  }};
  render();
})();
