(function(){
"use strict";
var cfg=window.STORE_CONFIG||{},products=Array.isArray(window.STORE_PRODUCTS)?window.STORE_PRODUCTS.filter(function(p){return p.id&&p.titulo&&Number.isInteger(p.preco)&&p.preco>0;}):[];
var byId=Object.fromEntries(products.map(function(p){return [p.id,p];}));
var state={filter:"Todos",search:"",cart:{},lastFocus:null,checkout:null};
var $=function(sel){return document.querySelector(sel);};
var money=function(cents){return (cents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});};
var esc=function(value){return String(value==null?"":value).replace(/[&<>"']/g,function(x){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x];});};
function normalize(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
var toastTimeout;
function toast(msg){var el=$("#toast");el.textContent=msg;el.classList.add("visible");clearTimeout(toastTimeout);toastTimeout=setTimeout(function(){el.classList.remove("visible");},3000);}
function restoreCart(){try{var data=JSON.parse(localStorage.getItem("acolher-cart-v1")||"{}");if(data&&typeof data==="object"){Object.keys(data).forEach(function(id){var q=Number(data[id]);if(byId[id]&&Number.isInteger(q)&&q>0)state.cart[id]=Math.min(q,20);});}}catch(e){state.cart={};}}
function saveCart(){try{localStorage.setItem("acolher-cart-v1",JSON.stringify(state.cart));}catch(e){}}
function quantity(){return Object.values(state.cart).reduce(function(a,b){return a+b;},0);}
function total(items){return items.reduce(function(n,item){return n+item.product.preco*item.qty;},0);}
function cartItems(){return Object.keys(state.cart).filter(function(id){return byId[id];}).map(function(id){return {product:byId[id],qty:state.cart[id]};});}
function categories(){return ["Todos"].concat(Array.from(new Set(products.map(function(p){return p.categoria;}))));}
function renderFilters(){
  $("#filters").innerHTML=categories().map(function(cat){return '<button type="button" class="filter" data-category="'+esc(cat)+'" aria-pressed="'+String(cat===state.filter)+'">'+esc(cat)+'</button>';}).join("");
}
function card(p){
 var color=/^(mint|peach|lilac|yellow|blue|rose)$/.test(p.cor)?p.cor:"mint";
 return '<article class="product-card">'+
   '<div class="product-art art-'+color+'">'+
   (p.foto?'<img class="product-photo" src="'+esc(p.foto)+'" alt="Fotografia ilustrativa para o tema '+esc(p.titulo)+'; não é uma foto do material comercial" loading="lazy" decoding="async">':'<div class="art-paper"><span class="art-symbol">'+esc(p.arte||"✳")+'</span></div>')+
   '<span class="art-label">'+esc(p.selo||"ATIVIDADE DIGITAL")+'</span><span class="product-image-note">Imagem ilustrativa</span></div>'+
   '<div class="product-body"><div class="product-meta"><span class="product-tag">'+esc(p.categoria)+'</span><span>◩ Arquivo digital</span></div>'+
   '<h3 class="product-title">'+esc(p.titulo)+'</h3><p class="product-description">'+esc(p.descricao)+'</p>'+
   '<div class="product-items">'+esc(p.itens)+'<br>'+esc(p.etapa||"")+'</div>'+
   '<div class="product-bottom"><div class="product-price"><small>preço sugerido</small><strong>'+money(p.preco)+'</strong></div>'+
   '<div class="product-actions"><button class="add-button" type="button" data-add="'+esc(p.id)+'" aria-label="Adicionar '+esc(p.titulo)+' ao carrinho">+</button>'+
   '<button class="buy-button" type="button" data-buy="'+esc(p.id)+'" aria-label="Comprar '+esc(p.titulo)+' por Pix">QR Pix ↗</button></div></div></div></article>';
}
function renderProducts(){
 var matched=products.filter(function(p){return (state.filter==="Todos"||p.categoria===state.filter)&&normalize(p.titulo+" "+p.descricao+" "+p.categoria+" "+p.etapa).includes(normalize(state.search));});
 $("#product-grid").innerHTML=matched.map(card).join("");
 $("#results-count").textContent=matched.length+" "+(matched.length===1?"material encontrado":"materiais encontrados");
 $("#empty-results").hidden=matched.length>0;
}
function renderCart(){
 $("#cart-count").textContent=quantity();
 var items=cartItems();
 $("#cart-list").innerHTML=items.length?items.map(function(item){
   var p=item.product,color=/^(mint|peach|lilac|yellow|blue|rose)$/.test(p.cor)?p.cor:"mint";
   return '<div class="cart-item"><div class="cart-item-thumb art-'+color+'">'+esc(p.arte)+'</div><div class="cart-item-info"><strong>'+esc(p.titulo)+'</strong><small>'+money(p.preco*item.qty)+'</small><div class="quantity-controls"><button data-quantity="'+esc(p.id)+'" data-delta="-1" type="button" aria-label="Diminuir quantidade de '+esc(p.titulo)+'">−</button><span>'+item.qty+'</span><button data-quantity="'+esc(p.id)+'" data-delta="1" type="button" aria-label="Aumentar quantidade de '+esc(p.titulo)+'">+</button></div></div></div>';
 }).join(""):'<div class="cart-empty"><span>♡</span>Seu carrinho está esperando por novas descobertas.<br>Escolha um material para começar!</div>';
 $("#cart-total").textContent=money(total(items));
 $("#checkout-cart").disabled=!items.length;
 $("#clear-cart").disabled=!items.length;
}
function updateCart(id,delta){
 if(!byId[id])return;
 var old=state.cart[id]||0;
 var next=Math.max(0,Math.min(20,old+delta));
 if(next===0)delete state.cart[id];else state.cart[id]=next;
 saveCart();renderCart();
 if(delta>0&&next===old)toast("Limite de 20 unidades por material.");
 else if(delta>0)toast("Material adicionado ao carrinho!");
}
function updateOverlay(){var active=!$("#cart-drawer").hidden||!$("#payment-modal").hidden;$("#overlay").hidden=!active;document.body.style.overflow=active?"hidden":"";}
function openCart(){state.lastFocus=document.activeElement;$("#payment-modal").hidden=true;$("#cart-drawer").hidden=false;renderCart();updateOverlay();$("#close-cart").focus();}
function closeCart(){if($("#cart-drawer").hidden)return;$("#cart-drawer").hidden=true;updateOverlay();if(state.lastFocus&&state.lastFocus.isConnected)state.lastFocus.focus();}
function closePayment(){if($("#payment-modal").hidden)return;$("#payment-modal").hidden=true;updateOverlay();if(state.lastFocus&&state.lastFocus.isConnected)state.lastFocus.focus();}
function escapeMsg(msg){return encodeURIComponent(msg);}
function orderMessage(items,orderCode){var lines=items.map(function(it){return "- "+it.product.titulo+" ("+it.qty+"x): "+money(it.product.preco*it.qty);});return "Olá! Gostaria de falar sobre meu pedido de materiais pedagógicos.\n\nPedido: "+orderCode+"\n"+lines.join("\n")+"\nTotal: "+money(total(items))+"\n\nVou realizar ou já realizei o Pix. Pode confirmar o recebimento no banco e me informar como receber os arquivos?";}
function orderId(){return ("AEE"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)).replace(/[^A-Za-z0-9]/g,"").slice(0,25).toUpperCase();}
function openPayment(items){
 if(!items.length)return;
 state.lastFocus=document.activeElement;
 $("#cart-drawer").hidden=true;
 $("#payment-modal").hidden=false;
 state.checkout={items:items,order:orderId()};
 $("#payment-summary").textContent=items.length===1?items[0].product.titulo+(items[0].qty>1?" x"+items[0].qty:""):items.length+" tipos de materiais";
 $("#payment-amount").textContent=money(total(items));
 $("#order-number").textContent="Referência do pedido: "+state.checkout.order;
 $("#pix-ready").hidden=true;$("#pix-missing").hidden=true;$("#pix-error").hidden=true;
 $("#pix-code").value="";$("#qr-code").replaceChildren();
 var qrShell=$(".qr-shell");
 qrShell.hidden=false;
 if(cfg.vendasHabilitadas !== true){
   $("#pix-missing").innerHTML="<strong>Catálogo em preparação.</strong><p>Os materiais ainda não foram finalizados e validados para entrega. O QR Pix será ativado somente quando o responsável concluir os produtos e habilitar as vendas.</p>";
   $("#pix-missing").hidden=false;
 }else if(!window.PixUtils||!window.PixUtils.pronto(cfg)){
   $("#pix-missing").innerHTML="<strong>Pagamento ainda não configurado.</strong><p>O responsável pela loja precisa informar uma chave Pix real no arquivo de configuração para habilitar os QR Codes.</p>";
   $("#pix-missing").hidden=false;
 }else{
   try{
     var code=window.PixUtils.montar(cfg,total(items),state.checkout.order);
     $("#pix-code").value=code;
     $("#pix-receiver").textContent="Destinatário informado: "+cfg.pixRecebedor+" • "+cfg.pixCidade;
     $("#pix-ready").hidden=false;
     if(typeof window.QRCode==="function"){
       new window.QRCode($("#qr-code"),{text:code,width:184,height:184,colorDark:"#15382e",colorLight:"#ffffff",correctLevel:window.QRCode.CorrectLevel.M});
     }else{
       qrShell.hidden=true;
       $("#qr-code").textContent="";
       toast("QR indisponível: utilize o Pix copia e cola.");
     }
   }catch(error){$("#pix-ready").hidden=true;$("#pix-error").textContent="Não foi possível gerar o Pix: "+error.message;$("#pix-error").hidden=false;}
 }
 var message=orderMessage(items,state.checkout.order);
 var phone=String(cfg.whatsapp||"").replace(/\D/g,"");
 var email=String(cfg.email||"").trim();
 var button=$("#send-order");
 if(/^\d{11,15}$/.test(phone)){button.hidden=false;button.href="https://wa.me/"+phone+"?text="+escapeMsg(message);button.textContent="Falar no WhatsApp sobre o pedido ↗";}
 else if(email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){button.hidden=false;button.href="mailto:"+email+"?subject="+escapeMsg("Pedido "+state.checkout.order)+"&body="+escapeMsg(message);button.target="_self";button.textContent="Enviar pedido por e-mail ↗";}
 else{button.hidden=true;}
 updateOverlay();$("#close-payment").focus();
}
async function copyPix(){
 var code=$("#pix-code").value;if(!code)return;
 try{
   if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(code);
   else{$("#pix-code").focus();$("#pix-code").select();if(!document.execCommand("copy"))throw Error("sem suporte");}
   toast("Código Pix copiado. Confira os dados no seu banco.");
 }catch(e){$("#pix-code").focus();$("#pix-code").select();toast("Selecione o código e copie manualmente.");}
}
function initContacts(){
 var phone=String(cfg.whatsapp||"").replace(/\D/g,"");
 var email=String(cfg.email||"").trim();
 var w=$("#whatsapp-footer"),e=$("#email-footer");
 if(/^\d{11,15}$/.test(phone)){w.href="https://wa.me/"+phone;w.target="_blank";w.rel="noopener noreferrer";}else w.hidden=true;
 if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){e.href="mailto:"+email;e.textContent=email+" ↗";}else e.hidden=true;
 if(w.hidden&&e.hidden){var note=document.createElement("p");note.textContent="Contato em configuração.";e.parentElement.appendChild(note);}
 $("#brand-footer").textContent=cfg.nome||"Acolher & Aprender";
 $("#year").textContent=String(new Date().getFullYear());
}
function init(){
 restoreCart();renderFilters();renderProducts();renderCart();initContacts();
 $("#search").addEventListener("input",function(e){state.search=e.target.value;renderProducts();});
 $("#filters").addEventListener("click",function(e){var btn=e.target.closest("[data-category]");if(!btn)return;state.filter=btn.dataset.category;renderFilters();renderProducts();});
 $("#product-grid").addEventListener("click",function(e){var add=e.target.closest("[data-add]"),buy=e.target.closest("[data-buy]");if(add)updateCart(add.dataset.add,1);if(buy&&byId[buy.dataset.buy])openPayment([{product:byId[buy.dataset.buy],qty:1}]);});
 $("#cart-list").addEventListener("click",function(e){var btn=e.target.closest("[data-quantity]");if(btn)updateCart(btn.dataset.quantity,Number(btn.dataset.delta));});
 $("#cart-button").addEventListener("click",openCart);
 $("#close-cart").addEventListener("click",closeCart);
 $("#checkout-cart").addEventListener("click",function(){openPayment(cartItems());});
 $("#clear-cart").addEventListener("click",function(){state.cart={};saveCart();renderCart();toast("Carrinho esvaziado.");});
 $("#close-payment").addEventListener("click",closePayment);
 $("#overlay").addEventListener("click",function(){closeCart();closePayment();});
 $("#copy-pix").addEventListener("click",copyPix);
 document.addEventListener("keydown",function(e){
   if(e.key==="Escape"){closeCart();closePayment();}
   if(e.key==="Tab"){
     var dialog=!$("#payment-modal").hidden?$("#payment-modal"):(!$("#cart-drawer").hidden?$("#cart-drawer"):null);
     if(!dialog)return;
     var focusable=Array.from(dialog.querySelectorAll('a[href],button:not([disabled]):not([hidden]),textarea:not([disabled])')).filter(function(el){return !el.closest("[hidden]");});
     if(!focusable.length)return;
     if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable[focusable.length-1].focus();}
     else if(!e.shiftKey&&document.activeElement===focusable[focusable.length-1]){e.preventDefault();focusable[0].focus();}
   }
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();