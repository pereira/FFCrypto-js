
//
var p224 = BigInteger.ONE.shiftLeft(224).add(BigInteger.ONE.shiftLeft(140)).add(BigInteger.ONE.shiftLeft(56)).add(BigInteger.ONE);
//
//
function testadd(nb){
var tab,i,start,end,time,z,r;
r = nbi();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBigInt(100).mod(p224);}
start=new Date().getTime();
//
for(i=nb;i;i--){
tab[0].addTo2(tab[1],r);
tab[1].addTo2(tab[2],r);
tab[2].addTo2(tab[3],r);
tab[3].addTo2(tab[4],r);
tab[4].addTo2(tab[5],r);
tab[5].addTo2(tab[6],r);
tab[6].addTo2(tab[7],r);
tab[7].addTo2(tab[8],r);
tab[8].addTo2(tab[9],r);
tab[9].addTo2(tab[10],r);
tab[10].addTo2(tab[11],r);
tab[11].addTo2(tab[12],r);
tab[12].addTo2(tab[13],r);
tab[13].addTo2(tab[14],r);
tab[14].addTo2(tab[15],r);
tab[15].addTo2(tab[16],r);
tab[16].addTo2(tab[17],r);
tab[17].addTo2(tab[18],r);
tab[18].addTo2(tab[19],r);
tab[19].addTo2(tab[20],r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testsub(nb){
var tab,i,start,end,time,z,r;
r = nbi();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBigInt(100).mod(p224);}
start=new Date().getTime();
//
for(i=nb;i;i--){
tab[0].subTo2(tab[1],r);
tab[1].subTo2(tab[2],r);
tab[2].subTo2(tab[3],r);
tab[3].subTo2(tab[4],r);
tab[4].subTo2(tab[5],r);
tab[5].subTo2(tab[6],r);
tab[6].subTo2(tab[7],r);
tab[7].subTo2(tab[8],r);
tab[8].subTo2(tab[9],r);
tab[9].subTo2(tab[10],r);
tab[10].subTo2(tab[11],r);
tab[11].subTo2(tab[12],r);
tab[12].subTo2(tab[13],r);
tab[13].subTo2(tab[14],r);
tab[14].subTo2(tab[15],r);
tab[15].subTo2(tab[16],r);
tab[16].subTo2(tab[17],r);
tab[17].subTo2(tab[18],r);
tab[18].subTo2(tab[19],r);
tab[19].subTo2(tab[20],r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testmult(nb){
var tab,i,start,end,time,z,r;
r = nbi();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBigInt(100).mod(p224);}
start=new Date().getTime();
//
for(i=nb*10;i;i--){
z=tab[0].multiply(tab[1]);z.pModp28(p224,r);
z=tab[1].multiply(tab[2]);z.pModp28(p224,r);
//~ z=tab[2].multiply(tab[3]);z.pModp28(p224,r);
//~ z=tab[3].multiply(tab[4]);z.pModp28(p224,r);
//~ z=tab[4].multiply(tab[5]);z.pModp28(p224,r);
//~ z=tab[5].multiply(tab[6]);z.pModp28(p224,r);
//~ z=tab[6].multiply(tab[7]);z.pModp28(p224,r);
//~ z=tab[7].multiply(tab[8]);z.pModp28(p224,r);
//~ z=tab[8].multiply(tab[9]);z.pModp28(p224,r);
//~ z=tab[9].multiply(tab[10]);z.pModp28(p224,r);
//~ z=tab[10].multiply(tab[11]);z.pModp28(p224,r);
//~ z=tab[11].multiply(tab[12]);z.pModp28(p224,r);
//~ z=tab[12].multiply(tab[13]);z.pModp28(p224,r);
//~ z=tab[13].multiply(tab[14]);z.pModp28(p224,r);
//~ z=tab[14].multiply(tab[15]);z.pModp28(p224,r);
//~ z=tab[15].multiply(tab[16]);z.pModp28(p224,r);
//~ z=tab[16].multiply(tab[17]);z.pModp28(p224,r);
//~ z=tab[17].multiply(tab[18]);z.pModp28(p224,r);
//~ z=tab[18].multiply(tab[19]);z.pModp28(p224,r);
//~ z=tab[19].multiply(tab[20]);z.pModp28(p224,r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testsquaring(nb){
var tab,i,start,end,time,z,r;
r = nbi();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBigInt(100).mod(p224);}
start=new Date().getTime();
//
for(i=nb*10;i;i--){
z=tab[0].square();z.pModp28(p224,r);
z=tab[1].square();z.pModp28(p224,r);
//~ z=tab[2].square();z.pModp28(p224,r);
//~ z=tab[3].square();z.pModp28(p224,r);
//~ z=tab[4].square();z.pModp28(p224,r);
//~ z=tab[5].square();z.pModp28(p224,r);
//~ z=tab[6].square();z.pModp28(p224,r);
//~ z=tab[7].square();z.pModp28(p224,r);
//~ z=tab[8].square();z.pModp28(p224,r);
//~ z=tab[9].square();z.pModp28(p224,r);
//~ z=tab[10].square();z.pModp28(p224,r);
//~ z=tab[11].square();z.pModp28(p224,r);
//~ z=tab[12].square();z.pModp28(p224,r);
//~ z=tab[13].square();z.pModp28(p224,r);
//~ z=tab[14].square();z.pModp28(p224,r);
//~ z=tab[15].square();z.pModp28(p224,r);
//~ z=tab[16].square();z.pModp28(p224,r);
//~ z=tab[17].square();z.pModp28(p224,r);
//~ z=tab[18].square();z.pModp28(p224,r);
//~ z=tab[19].square();z.pModp28(p224,r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testred(nb){
var tab,i,start,end,time,z,r;
r = nbi();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBigInt(100).mod(p224).multiply(randBigInt(100).mod(p224));}
start=new Date().getTime();
//
for(i=nb;i;i--){
tab[0].pModp28(p224,r);
tab[1].pModp28(p224,r);
tab[2].pModp28(p224,r);
tab[3].pModp28(p224,r);
tab[4].pModp28(p224,r);
tab[5].pModp28(p224,r);
tab[6].pModp28(p224,r);
tab[7].pModp28(p224,r);
tab[8].pModp28(p224,r);
tab[9].pModp28(p224,r);
tab[10].pModp28(p224,r);
tab[11].pModp28(p224,r);
tab[12].pModp28(p224,r);
tab[13].pModp28(p224,r);
tab[14].pModp28(p224,r);
tab[15].pModp28(p224,r);
tab[16].pModp28(p224,r);
tab[17].pModp28(p224,r);
tab[18].pModp28(p224,r);
tab[19].pModp28(p224,r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testinv(nb){
var tab,i,start,end,time,z,r;
r = nbi();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBigInt(100).mod(p224);}
start=new Date().getTime();
//
for(i=nb;i;i--){
z=tab[0].modInverse(p224);
z=tab[1].modInverse(p224);
z=tab[2].modInverse(p224);
z=tab[3].modInverse(p224);
z=tab[4].modInverse(p224);
z=tab[5].modInverse(p224);
z=tab[6].modInverse(p224);
z=tab[7].modInverse(p224);
z=tab[8].modInverse(p224);
z=tab[9].modInverse(p224);
z=tab[10].modInverse(p224);
z=tab[11].modInverse(p224);
z=tab[12].modInverse(p224);
z=tab[13].modInverse(p224);
z=tab[14].modInverse(p224);
z=tab[15].modInverse(p224);
z=tab[16].modInverse(p224);
z=tab[17].modInverse(p224);
z=tab[18].modInverse(p224);
z=tab[19].modInverse(p224);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
