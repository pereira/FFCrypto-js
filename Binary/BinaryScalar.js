//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
//
// Binary fields library
//
// z=a.add(b); returns a+b
// z=a.multiply(b); returns a*b
// z=a.shiftLeft(n); returns a shifted by n bits (n<32)
// z=a.square(); returns a^2
// z=a.mod(); returns a mod NIST prime 2^233+2^74+1
// z=a.isValue(n); returns 1 if z=n (n=1 or n=0)
// z=a.deg(); returns the degree of the binary polynomial
// z=a.modInverse(p); returns inv(a) mod p (the modular inverse of a)
// z=a.copy=binCopy; returns a copy of a
	
// BinaryScalar.ONE=new BinaryScalar([1]); returns the constant ploynomial1	
// BinaryScalar.ZERO=new BinaryScalar([0]); returns the constant polynomial 0
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------

// this array is used for the squaring
var expTab=[0,1,4,5,16,17,20,21,64,65,68,69,80,81,84,85,256,257,260,261,272,273,
	276,277,320,321,324,325,336,337,340,341,1024,1025,1028,1029,1040,1041,
	1044,1045,1088,1089,1092,1093,1104,1105,1108,1109,1280,1281,1284,1285,
	1296,1297,1300,1301,1344,1345,1348,1349,1360,1361,1364,1365,4096,4097,
	4100,4101,4112,4113,4116,4117,4160,4161,4164,4165,4176,4177,4180,4181,
	4352,4353,4356,4357,4368,4369,4372,4373,4416,4417,4420,4421,4432,4433,
	4436,4437,5120,5121,5124,5125,5136,5137,5140,5141,5184,5185,5188,5189,
	5200,5201,5204,5205,5376,5377,5380,5381,5392,5393,5396,5397,5440,5441,
	5444,5445,5456,5457,5460,5461,16384,16385,16388,16389,16400,16401,
	16404,16405,16448,16449,16452,16453,16464,16465,16468,16469,16640,
	16641,16644,16645,16656,16657,16660,16661,16704,16705,16708,16709,
	16720,16721,16724,16725,17408,17409,17412,17413,17424,17425,17428,
	17429,17472,17473,17476,17477,17488,17489,17492,17493,17664,17665,
	17668,17669,17680,17681,17684,17685,17728,17729,17732,17733,17744,
	17745,17748,17749,20480,20481,20484,20485,20496,20497,20500,20501,
	20544,20545,20548,20549,20560,20561,20564,20565,20736,20737,20740,
	20741,20752,20753,20756,20757,20800,20801,20804,20805,20816,20817,
	20820,20821,21504,21505,21508,21509,21520,21521,21524,21525,21568,
	21569,21572,21573,21584,21585,21588,21589,21760,21761,21764,21765,
	21776,21777,21780,21781,21824,21825,21828,21829,21840,21841,21844,21845];

//----------------------------------- Constructor -----------------
function BinaryScalar(arr){
	this.arr=arr;
	this.t=arr.length;
	}
//---------------------------------- Addition ------------------------
// returns r = a + b
function binAdd(b){var r=nbin();(this.t>b.t)?this.pAdd(b,r):b.pAdd(this,r);return r;}
function binpAdd(b,r){
	for(i=0;i<this.t;i++) {r.arr[i]=b.arr[i]^this.arr[i];}
	r.t=this.t;
	}
function binpAdd2(b){
	var a=new Array();
	for(var i=8;i;i--) {a[i]=b.arr[i]^this.arr[i];}
	var b=nbin();
	var c=nbin();
	var d=nbin();
	return new BinaryScalar(a);
	}
//-------------------------------- Multiplication---------------
// returns r = this*b
function binMult(b){var r=new BinaryScalar([]);var r2=new BinaryScalar([]);
				b.copy(r2);this.pMult(r2,r);return r}
function binpMult(r2,r){
	var i,ii,j,f,k,c,c2,g,tr;
	r.t=this.t+8;
	r2.arr[r2.t]=0;
	for(k=0;k<32;k++){
		tr=(1<<k);
		for(j=this.t;j;){
			if((this.arr[--j])&tr){
				var f=r2.arr;g=j;
				r.arr[g++]^=f[0];
				r.arr[g++]^=f[1];
				r.arr[g++]^=f[2];
				r.arr[g++]^=f[3];
				r.arr[g++]^=f[4];
				r.arr[g++]^=f[5];
				r.arr[g++]^=f[6];
				r.arr[g++]^=f[7];
				r.arr[g++]^=f[8];
			}	
		}
		c2=0;for(ii=0;ii<r2.t;ii++){c=r2.arr[ii]>>>31;r2.arr[ii]=c2^(r2.arr[ii]<<1);c2=c;}
		if(c){r2.arr[r2.t]=c;r2.t++;}
	}
	while((!r.arr[r.t-1])&&(r.t>1)){r.t--;r.arr.pop();}
}
//--------------------------- Squaring-------------------------
// returns r=this^2 (linear operation !)
function binSquare(){var r=nbin();this.pSquare(r);return r}
function binpSquare(r){
	var i,c1,c2,c3,c4;
	r.t=this.t<<1;
	for(i=0;i<this.t;i++){
		c1=this.arr[i]&0x000000ff;
		c2=(this.arr[i]&0x0000ff00)>>8;
		c3=(this.arr[i]&0x00ff0000)>>16;
		c4=(this.arr[i]&0xff000000)>>24;
		r.arr[i<<1]=expTab[c1]+(expTab[c2]<<16);
		r.arr[(i<<1)+1]=expTab[c3]+(expTab[c4]<<16);
		}
	while(!r.arr[r.t-1]){r.t--;r.arr.pop();}
}
//---------------------- Reduction -----------------------------
// this is reduction modulo NIST prime 2^233+2^74+1
function binMod(){var r=this;this.pMod(r);return r}
function binpMod(r){
	var i,j,t,k;
	for(j=this.t;j<16;j++){r.arr[j]=0;}
	for(i=15;i>7;i--){
		t=r.arr[i];
		r.arr[i-8]^=(t<<23);
		r.arr[i-7]^=(t>>>9);
		r.arr[i-5]^=(t<<1);
		r.arr[i-4]^=(t>>>31);		
	}
	t=r.arr[7]>>>9;
	r.arr[0]^=t;
	r.arr[2]^=(t<<10);
	r.arr[3]^=(t>>>22);
	r.arr[7]&=0x1ff;
	for(k=0;k<8;k++){r.arr.pop();}
	r.t=8;	
	while((!r.arr[r.t-1])&&(r.t>1)){r.t--;r.arr.pop();}
}
//------------------------------- Shifts --------------------------
function binShiftLeft(nb){var r=nbin();this.pShiftLeft(nb,r);return r;}
function binpShiftLeft(nb,r){
	// we must have nb<this.DB=32 (may be adapted)
	var i,j,c,n,k,sup;
	if(nb>31){n=nb%32;sup=(nb-n)/32;}
	else{n=nb;}
	c=0;
	if(n){
	for(i=0;i<this.t;i++){
		r.arr[i]=c^(this.arr[i]<<n);
		c=this.arr[i]>>>(32-n);
		}
		if(c){r.arr[this.t]=c;r.t=this.t+1;}
		else{r.t=this.t;}
	}
	else{for(k=0;k<this.t;k++){r.arr[k]=this.arr[k];}r.t=this.t}
	if(nb>31){
		for(j=0;j<sup;j++){r.arr.unshift(0);}
		r.t+=sup;
		}
	
}
//------------------------ Inversion --------------------------------
function binInverse(p){var r=nbin();return this.pInverse(p,r)}
function binpInverse(p){
	var u,v,vv,g1,gg1,g2,j;
	u=this;
	v=p;
	g1=BinaryScalar.ONE;
	g2=BinaryScalar.ZERO;
	while(!u.isValue(1)){
		j=u.deg()-v.deg();
		if(j<0){vv=v;v=u;u=vv;gg1=g1;g1=g2;g2=gg1;j=-j;}
		u=u.add(v.shiftLeft(j)).mod();
		g1=g1.add(g2.shiftLeft(j)).mod();
	}
	return g1;
}

//----------------------------------random generation------------------------
// returns random binary polynomial in F_{2^256}
function randBinaryScalar(){
	var tab=new Array();
	for(var ii=0;ii<8;ii++){
		tab[ii]=((Math.floor(Math.random()*(Math.pow(2,31)-1)))<<1)^Math.round(Math.random());}
	return new BinaryScalar(tab).mod();
	}
	
//-------------------------------Other functions-----------------------------------
function binIsValue(val){return ((this.t==1)&&(this.arr[0]==val))}//val!=0
function nbin(){return new BinaryScalar([]);}
function nbinval(val){var r=new BinaryScalar(val);r.t=val.length;return r;}
function binDeg(){
	var a=this.arr[this.t-1];
	var n=0;
	while(a!=0){a=a>>>1;n++;}
	return (this.t-1)*32+n;
	}
function binCopy(r){var i;for(i=0;i<this.t;i++){r.arr[i]=this.arr[i];}r.t=this.t;}

// protected
BinaryScalar.prototype.pAdd=binpAdd;
BinaryScalar.prototype.pMult=binpMult;
BinaryScalar.prototype.pShiftLeft=binpShiftLeft;
BinaryScalar.prototype.pSquare=binpSquare;
BinaryScalar.prototype.pMod=binpMod;
BinaryScalar.prototype.pInverse=binpInverse;
	
// public
BinaryScalar.prototype.add=binAdd;
BinaryScalar.prototype.multiply=binMult;
BinaryScalar.prototype.shiftLeft=binShiftLeft;
BinaryScalar.prototype.square=binSquare;
BinaryScalar.prototype.mod=binMod;
BinaryScalar.prototype.isValue=binIsValue;
BinaryScalar.prototype.deg=binDeg;
BinaryScalar.prototype.modInverse=binInverse;
BinaryScalar.prototype.copy=binCopy;
	
	
BinaryScalar.ONE=new BinaryScalar([1]);	
BinaryScalar.ZERO=new BinaryScalar([0]);