// Optional: load header/footer HTML
(async () => {
  try {
    const [hdr, ftr] = await Promise.all([
      fetch('/header.html'), fetch('/footer.html')
    ]);
    if (hdr.ok) document.getElementById('site-header').innerHTML = await hdr.text();
    if (ftr.ok) document.getElementById('site-footer').innerHTML = await ftr.text();
  } catch(e){ console.warn('Include failed', e); }
})();

// Form validation + demo submit
(function(){
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if(!form) return;

  const setErr = (id,msg)=>{ const el=document.querySelector(`[data-err-for="${id}"]`); if(el) el.textContent = msg||''; };
  const rules = {
    name:v => v.trim().length>=2 || 'Please enter your full name.',
    email:v => /^\S+@\S+\.\S+$/.test(v) || 'Enter a valid email.',
    phone:v => /^[\d()+\-\s]{6,}$/.test(v) || 'Enter a valid phone number.',
    message:v => v.trim().length>=10 || 'Message should be at least 10 characters.'
  };

  form.addEventListener('submit', async e=>{
    e.preventDefault(); note.textContent='';
    let ok=true;
    ['name','email','phone','message'].forEach(id=>{
      const v=document.getElementById(id).value;
      const res=rules[id](v);
      if(res!==true){ setErr(id,res); ok=false; } else setErr(id,'');
    });
    if(!ok) return;

    await new Promise(r=>setTimeout(r,600));
    form.reset();
    note.textContent='Thanks! Your message has been sent.';
  });

  form.addEventListener('input', e=>{
    const id=e.target.id;
    if(rules[id]) setErr(id,'');
  });
})();
