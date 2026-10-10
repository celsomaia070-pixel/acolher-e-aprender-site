// BR Code Pix estático seguindo campos EMV/BCB. Não confirma pagamento.
(function(global){
  "use strict";
  function ascii(value){ return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9 .@_+\-]/g," ").trim(); }
  function campo(id,value){ var text=String(value);if(text.length>99)throw new Error("Campo Pix muito longo: "+id);return id+String(text.length).padStart(2,"0")+text; }
  function crc16(text){var crc=0xFFFF;for(var i=0;i<text.length;i++){crc^=text.charCodeAt(i)<<8;for(var j=0;j<8;j++)crc=(crc&0x8000)?((crc<<1)^0x1021):(crc<<1);crc&=0xFFFF;}return crc.toString(16).toUpperCase().padStart(4,"0");}
  function pronto(config){return !!(config && String(config.pixKey||"").trim() && ascii(config.pixRecebedor)!=="NOME DO TITULAR" && ascii(config.pixRecebedor).length>0 && ascii(config.pixCidade).length>0);}
  function montar(config,centavos,txid){
    if(!pronto(config))throw new Error("Configure chave Pix, nome do recebedor e cidade.");
    if(!Number.isInteger(centavos) || centavos<=0 || centavos>999999999)throw new Error("Valor Pix inválido.");
    var chave=String(config.pixKey).trim();
    if(chave.length>77 || /[^\x20-\x7E]/.test(chave))throw new Error("A chave Pix deve ter até 77 caracteres ASCII.");
    var nome=ascii(config.pixRecebedor).slice(0,25);
    var cidade=ascii(config.pixCidade).slice(0,15);
    var ref=String(txid||"***").replace(/[^A-Za-z0-9*]/g,"").slice(0,25)||"***";
    var conta=campo("00","BR.GOV.BCB.PIX")+campo("01",chave);
    var valor=(centavos/100).toFixed(2);
    var base=campo("00","01")+campo("26",conta)+campo("52","0000")+campo("53","986")+campo("54",valor)+campo("58","BR")+campo("59",nome)+campo("60",cidade)+campo("62",campo("05",ref))+"6304";
    return base+crc16(base);
  }
  var api={montar:montar,pronto:pronto,crc16:crc16,campo:campo};
  global.PixUtils=api;
  if(typeof module!=="undefined" && module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);