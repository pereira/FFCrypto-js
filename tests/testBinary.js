
//
function testaddbin(nb){
var tab,i,start,end,time,z,r;
r = nbin();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBinaryScalar();}
start=new Date().getTime();
//
for(i=nb;i;i--){
tab[0].pAdd(tab[1],r);
tab[1].pAdd(tab[2],r);
tab[2].pAdd(tab[3],r);
tab[3].pAdd(tab[4],r);
tab[4].pAdd(tab[5],r);
tab[5].pAdd(tab[6],r);
tab[6].pAdd(tab[7],r);
tab[7].pAdd(tab[8],r);
tab[8].pAdd(tab[9],r);
tab[9].pAdd(tab[10],r);
tab[10].pAdd(tab[11],r);
tab[11].pAdd(tab[12],r);
tab[12].pAdd(tab[13],r);
tab[13].pAdd(tab[14],r);
tab[14].pAdd(tab[15],r);
tab[15].pAdd(tab[16],r);
tab[16].pAdd(tab[17],r);
tab[17].pAdd(tab[18],r);
tab[18].pAdd(tab[19],r);
tab[19].pAdd(tab[20],r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testmultbin(nb){
var tab,i,start,end,time,z,r;
var p=BinaryScalar.ONE.shiftLeft(233).add(BinaryScalar.ONE.shiftLeft(74)).add(BinaryScalar.ONE);

r = nbin();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBinaryScalar();}
start=new Date().getTime();
//
for(i=nb*10;i;i--){
tab[0].multiply(tab[1]).pMod(r);
tab[1].multiply(tab[2]).pMod(r);
//~ tab[2].multiply(tab[3]).pMod(r);
//~ tab[3].multiply(tab[4]).pMod(r);
//~ tab[4].multiply(tab[5]).pMod(r);
//~ tab[5].multiply(tab[6]).pMod(r);
//~ tab[6].multiply(tab[7]).pMod(r);
//~ tab[7].multiply(tab[8]).pMod(r);
//~ tab[8].multiply(tab[9]).pMod(r);
//~ tab[9].multiply(tab[10]).pMod(r);
//~ tab[10].multiply(tab[11]).pMod(r);
//~ tab[11].multiply(tab[12]).pMod(r);
//~ tab[12].multiply(tab[13]).pMod(r);
//~ tab[13].multiply(tab[14]).pMod(r);
//~ tab[14].multiply(tab[15]).pMod(r);
//~ tab[15].multiply(tab[16]).pMod(r);
//~ tab[16].multiply(tab[17]).pMod(r);
//~ tab[17].multiply(tab[18]).pMod(r);
//~ tab[18].multiply(tab[19]).pMod(r);
//~ tab[19].multiply(tab[20]).pMod(r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);

}
//
function testsquaringbin(nb){
var tab,i,start,end,time,z,r;
r = nbin();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBinaryScalar();}
start=new Date().getTime();
//
for(i=nb;i;i--){
tab[0].pSquare(r);tab[0].pMod(r);
tab[1].pSquare(r);tab[1].pMod(r);
tab[2].pSquare(r);tab[2].pMod(r);
tab[3].pSquare(r);tab[3].pMod(r);
tab[4].pSquare(r);tab[4].pMod(r);
tab[5].pSquare(r);tab[5].pMod(r);
tab[6].pSquare(r);tab[6].pMod(r);
tab[7].pSquare(r);tab[7].pMod(r);
tab[8].pSquare(r);tab[8].pMod(r);
tab[9].pSquare(r);tab[9].pMod(r);
tab[10].pSquare(r);tab[10].pMod(r);
tab[11].pSquare(r);tab[11].pMod(r);
tab[12].pSquare(r);tab[12].pMod(r);
tab[13].pSquare(r);tab[13].pMod(r);
tab[14].pSquare(r);tab[14].pMod(r);
tab[15].pSquare(r);tab[15].pMod(r);
tab[16].pSquare(r);tab[16].pMod(r);
tab[17].pSquare(r);tab[17].pMod(r);
tab[18].pSquare(r);tab[18].pMod(r);
tab[19].pSquare(r);tab[19].pMod(r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testredbin(nb){
var tab,i,start,end,time,z,r;
r = nbin();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBinaryScalar().multiply(randBinaryScalar());}
start=new Date().getTime();
//
for(i=nb;i;i--){
tab[0].pMod(r);
tab[1].pMod(r);
tab[2].pMod(r);
tab[3].pMod(r);
tab[4].pMod(r);
tab[5].pMod(r);
tab[6].pMod(r);
tab[7].pMod(r);
tab[8].pMod(r);
tab[9].pMod(r);
tab[10].pMod(r);
tab[11].pMod(r);
tab[12].pMod(r);
tab[13].pMod(r);
tab[14].pMod(r);
tab[15].pMod(r);
tab[16].pMod(r);
tab[17].pMod(r);
tab[18].pMod(r);
tab[19].pMod(r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testinvbin(nb){
var tab,i,start,end,time,z,r;
var p=BinaryScalar.ONE.shiftLeft(233).add(BinaryScalar.ONE.shiftLeft(74)).add(BinaryScalar.ONE);
r = nbin();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randBinaryScalar();}
start=new Date().getTime();
//
for(i=nb;i;i--){
z=tab[0].modInverse(p);
z=tab[1].modInverse(p);
z=tab[2].modInverse(p);
z=tab[3].modInverse(p);
z=tab[4].modInverse(p);
z=tab[5].modInverse(p);
z=tab[6].modInverse(p);
z=tab[7].modInverse(p);
z=tab[8].modInverse(p);
z=tab[9].modInverse(p);
z=tab[10].modInverse(p);
z=tab[11].modInverse(p);
z=tab[12].modInverse(p);
z=tab[13].modInverse(p);
z=tab[14].modInverse(p);
z=tab[15].modInverse(p);
z=tab[16].modInverse(p);
z=tab[17].modInverse(p);
z=tab[18].modInverse(p);
z=tab[19].modInverse(p);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
