
function testaddOEF(nb){
var tab,i,start,end,time,z,r;
r = new OEF();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randOEF();}
start=new Date().getTime();
//
for(i=nb;i;i--){
tab[0].addPrivate(tab[1],r);
tab[1].addPrivate(tab[2],r);
tab[2].addPrivate(tab[3],r);
tab[3].addPrivate(tab[4],r);
tab[4].addPrivate(tab[5],r);
tab[5].addPrivate(tab[6],r);
tab[6].addPrivate(tab[7],r);
tab[7].addPrivate(tab[8],r);
tab[8].addPrivate(tab[9],r);
tab[9].addPrivate(tab[10],r);
tab[10].addPrivate(tab[11],r);
tab[11].addPrivate(tab[12],r);
tab[12].addPrivate(tab[13],r);
tab[13].addPrivate(tab[14],r);
tab[14].addPrivate(tab[15],r);
tab[15].addPrivate(tab[16],r);
tab[16].addPrivate(tab[17],r);
tab[17].addPrivate(tab[18],r);
tab[18].addPrivate(tab[19],r);
tab[19].addPrivate(tab[20],r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testsubOEF(nb){
var tab,i,start,end,time,z,r;
r = new OEF();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randOEF();}
start=new Date().getTime();
//
for(i=nb;i;i--){
tab[0].subPrivate(tab[1],r);
tab[1].subPrivate(tab[2],r);
tab[2].subPrivate(tab[3],r);
tab[3].subPrivate(tab[4],r);
tab[4].subPrivate(tab[5],r);
tab[5].subPrivate(tab[6],r);
tab[6].subPrivate(tab[7],r);
tab[7].subPrivate(tab[8],r);
tab[8].subPrivate(tab[9],r);
tab[9].subPrivate(tab[10],r);
tab[10].subPrivate(tab[11],r);
tab[11].subPrivate(tab[12],r);
tab[12].subPrivate(tab[13],r);
tab[13].subPrivate(tab[14],r);
tab[14].subPrivate(tab[15],r);
tab[15].subPrivate(tab[16],r);
tab[16].subPrivate(tab[17],r);
tab[17].subPrivate(tab[18],r);
tab[18].subPrivate(tab[19],r);
tab[19].subPrivate(tab[20],r);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//
function testmultOEF(nb){
var tab,i,start,end,time,z,r;
r = new OEF();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randOEF();}
start=new Date().getTime();
//
for(i=nb*10;i;i--){
z=tab[0].multiply(tab[1]);
z=tab[1].multiply(tab[2]);
//~ z=tab[2].multiply(tab[3]);
//~ z=tab[3].multiply(tab[4]);
//~ z=tab[4].multiply(tab[5]);
//~ z=tab[5].multiply(tab[6]);
//~ z=tab[6].multiply(tab[7]);
//~ z=tab[7].multiply(tab[8]);
//~ z=tab[8].multiply(tab[9]);
//~ z=tab[9].multiply(tab[10]);
//~ z=tab[10].multiply(tab[11]);
//~ z=tab[11].multiply(tab[12]);
//~ z=tab[12].multiply(tab[13]);
//~ z=tab[13].multiply(tab[14]);
//~ z=tab[14].multiply(tab[15]);
//~ z=tab[15].multiply(tab[16]);
//~ z=tab[16].multiply(tab[17]);
//~ z=tab[17].multiply(tab[18]);
//~ z=tab[18].multiply(tab[19]);
//~ z=tab[19].multiply(tab[20]);
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//

function testsquaringOEF(nb){
var tab,i,start,end,time,z,r;
r = new OEF();
tab = new Array();
for(i=0;i<21;i++){tab[i]=randOEF();}
start=new Date().getTime();
//
for(i=nb*10;i;i--){
z=tab[0].square();
z=tab[1].square();
//~ z=tab[2].square();
//~ z=tab[3].square();
//~ z=tab[4].square();
//~ z=tab[5].square();
//~ z=tab[6].square();
//~ z=tab[7].square();
//~ z=tab[8].square();
//~ z=tab[9].square();
//~ z=tab[10].square();
//~ z=tab[11].square();
//~ z=tab[12].square();
//~ z=tab[13].square();
//~ z=tab[14].square();
//~ z=tab[15].square();
//~ z=tab[16].square();
//~ z=tab[17].square();
//~ z=tab[18].square();
//~ z=tab[19].square();
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
//~ //

function testinvOEF(nb){
var tab,i,start,end,time,z,r;
tab = new Array();
for(i=0;i<21;i++){tab[i]=randOEF();}
start=new Date().getTime();
//
for(i=nb;i;i--){
z=tab[0].modInverse();
z=tab[1].modInverse();
z=tab[2].modInverse();
z=tab[3].modInverse();
z=tab[4].modInverse();
z=tab[5].modInverse();
z=tab[6].modInverse();
z=tab[7].modInverse();
z=tab[8].modInverse();
z=tab[9].modInverse();
z=tab[10].modInverse();
z=tab[11].modInverse();
z=tab[12].modInverse();
z=tab[13].modInverse();
z=tab[14].modInverse();
z=tab[15].modInverse();
z=tab[16].modInverse();
z=tab[17].modInverse();
z=tab[18].modInverse();
z=tab[19].modInverse();
}
end=new Date().getTime();
time=end-start;
return 1000*time/(nb*20);
}
