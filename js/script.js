// UI wiring for calculator
(function(){
  const displayEl=document.getElementById('display');
  let current='';
  let lastAnswer=null;

  function updateDisplay(v){ displayEl.textContent=v.toString().slice(0,20) }

  function appendValue(v){
    // handle operators and dots
    if(v==='.' ){
      // prevent multiple dots in current number
      const parts=current.split(/[^0-9.]/);
      const last=parts[parts.length-1]||'';
      if(last.includes('.')) return;
      current += v; updateDisplay(current||'0'); return;
    }
    current += v; updateDisplay(current||'0');
  }

  function clearAll(){ current=''; lastAnswer=null; updateDisplay('0') }

  function toggleSign(){
    try{
      const val = window.evaluateExpression(current || (lastAnswer!=null?String(lastAnswer):'0'));
      const toggled = -val; current = String(toggled); updateDisplay(current);
    }catch(e){ updateDisplay('Error') }
  }

  function percent(){
    try{
      const val = window.evaluateExpression(current || (lastAnswer!=null?String(lastAnswer):'0'));
      const p=val/100; current=String(p); updateDisplay(current);
    }catch(e){ updateDisplay('Error') }
  }

  function equals(){
    try{
      if(!current) return;
      const result = window.evaluateExpression(current);
      lastAnswer=result; current=String(result); updateDisplay(current);
    }catch(e){ updateDisplay('Error'); current='' }
  }

  document.querySelectorAll('.buttons').forEach(container=>{
    container.addEventListener('click',e=>{
      const btn=e.target.closest('button'); if(!btn) return;
      const action=btn.dataset.action; const value=btn.dataset.value;
      if(action==='clear'){ clearAll(); return }
      if(action==='toggle-sign'){ toggleSign(); return }
      if(action==='percent'){ percent(); return }
      if(action==='equals'){ equals(); return }
      if(btn.classList.contains('number') || btn.classList.contains('operator')){
        appendValue(value);
      }
    })
  })

  // keyboard support
  window.addEventListener('keydown',e=>{
    const key=e.key;
    if(/^[0-9]$/.test(key)){ appendValue(key); return }
    if(key==='.' ) { appendValue('.'); return }
    if(key==='Enter' || key==='='){ equals(); return }
    if(key==='Backspace'){ current=current.slice(0,-1); updateDisplay(current||'0'); return }
    if(key==='Escape'){ clearAll(); return }
    if(key==='+'||key==='-'||key==='*'||key==='/'||key==='%'){ appendValue(key); return }
  })

})();