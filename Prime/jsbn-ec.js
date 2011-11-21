// This file is a fork of the jsbn.js file by Tom Wu (see below). 

// It is released under the GPL v3 or later.
// Copyright (c) 2011  Laurie Haustenne, Quentin De Neyer, Olivier Pereira 
// (Universite catholique de Louvain). 
//
// Original jsbn.js file: 
// Copyright (c) 2005  Tom Wu
// See "LICENSE-JSBN" for details on original file.

// Basic JavaScript BN library - subset useful for RSA encryption.
// Also includes: 
// -- test code for Karatsuba multiplication
// -- efficient operations mod 2^224 + 2^140 + 2^56 + 1


// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
function BigInteger(a,b,c) {
  this.arr = new Array();
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }
function nbitab(tab){
	result=new BigInteger(null);
	result.arr=tab;
	result.t=tab.length;
	result.s=0;
	return result;
	}

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this.arr[i++]+w.arr[j]+c;
    c = Math.floor(v/0x4000000);
    w.arr[j++] = v&0x3ffffff;
  }
  return c;
}
BigInteger.prototype.am1bis=function(i,x,w,j,c,n) {
  while(--n >= 0) {
    w.arr[j++] = x*this.arr[i++]+w.arr[j];
  }
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this.arr[i]&0x7fff;
    var h = this.arr[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w.arr[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w.arr[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this.arr[i]&0x3fff;
    var h = this.arr[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w.arr[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w.arr[j++] = l&0xfffffff;
  }
  return c;
}
function am3bis(i,x,w,j,c,n) {
  c=2;
	var xl = x&0x1fff, xh = x>>13;
  while(--n >= 0) {
    var l = this.arr[i]&0x1fff;
    var h = this.arr[i++]>>13;
    var m = xh*l+h*xl;
    w.arr[j++] += xl*l+((m&0x1fff)<<13);//l = xl*l+((m&0x3fff)<<14)+w.arr[j];
    c = (m>>13)+xh*h;
  }
  return c;
}
//-----------------------------------------------------------------------------------------
function am4(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this.arr[i++]+w.arr[j]+c;
    c = v>>14;
    w.arr[j++] = v&0x3fff;
  }
  return c;}
//-----------------------------------------------------------------------------------------
BigInteger.prototype.multacc2=function(b){
var i,j,k,c,s
var m=1<<26;
var r=nbi();
s=r.t=this.t+b.t;
r.s=0;//(this.s==b.s)?0:-1;
while(--s>=0){r.arr[s] = 0;}


for(i=this.t;i;){
	--i;var xl = this.arr[i]&0x1fff, xh = this.arr[i]>>13;k=i+b.t;n=b.t;j=0;
	while(--n){		var l = b.arr[j]&0x1fff;
					var h = b.arr[j++]>>13;
					var m = xh*l+h*xl;
					r.arr[k++]+=xl*l+((m&0x1fff)<<13);
					r.arr[k]+=xh*h+(m>>13);
					
}
}

var a=0;
for(k=0;k<r.t;k++){r.arr[k]+=a;c=r.arr[k]%m;a=(r.arr[k]-c)/m;r.arr[k]=c;}
return r;}
//-----------------------------------------------------------------------------------------

BigInteger.prototype.multacc=function(b){
var i,j,k,a,c,n
var m=1<<24;
var r=nbi();
r.t=this.t+b.t;
r.s=0;//(this.s==b.s)?0:-1;
a=this.arr[0];
for(var s = b.t-1; s >= 0;--s ) {r.arr[s] =a* b.arr[s];}


for(i=1;i<this.t;i++){
	j=b.t;k=i+j;a=this.arr[i];
	r.arr[k]=a*b.arr[--j];
	while(--j){r.arr[k--]+=a*b.arr[j];}
	
}

var a=0;
for(k=0;k<r.t;k++){r.arr[k]+=a;c=r.arr[k]%m;a=(r.arr[k]-c)/m;r.arr[k]=c;}
return r;

}
//-----------------------------------------------------------------------------------------

if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am3;
  dbits = 28;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am3;
  dbits = 28;
}
else { // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r.arr[i] = this.arr[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this.arr[0] = x;
  else if(x < -1) this.arr[0] = x+DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this.arr[this.t++] = x;
    else if(sh+k > this.DB) {
      this.arr[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this.arr[this.t++] = (x>>(this.DB-sh));
    }
    else
      this.arr[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this.arr[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this.arr[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this.arr[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this.arr[i]&((1<<p)-1))<<(k-p);
        d |= this.arr[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this.arr[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return r;
  while(--i >= 0) if((r=this.arr[i]-a.arr[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this.arr[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r.arr[i+n] = this.arr[i];
  for(i = n-1; i >= 0; --i) r.arr[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r.arr[i-n] = this.arr[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r.arr[i+ds+1] = (this.arr[i]>>cbs)|c;
    c = (this.arr[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r.arr[i] = 0;
  r.arr[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r.arr[0] = this.arr[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r.arr[i-ds-1] |= (this.arr[i]&bm)<<cbs;
    r.arr[i-ds] = this.arr[i]>>bs;
  }
  if(bs > 0) r.arr[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this.arr[i]-a.arr[i];
    r.arr[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this.arr[i];
      r.arr[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a.arr[i];
      r.arr[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r.arr[i++] = this.DV+c;
  else if(c > 0) r.arr[i++] = c;
  r.t = i;
  r.clamp();
}
//-------------------------------------------------------------------------------------------------------------------
function bnpSubTo2(b,r) {
	// requires this and b <= 8 words
	var a,c,c7,i;
	for(i=b.t;i<8;i++)b.arr[i]=0;
	for(i=this.t;i<8;i++)this.arr[i]=0;
	a=this.arr[7]-b.arr[7];
	c7=a>>28;
	r.arr[7]=a&0xfffffff;
	a=this.arr[0]-b.arr[0]-c7;
	c=a>>28;
	r.arr[0]=a&0xfffffff;
	a=this.arr[1]-b.arr[1]+c;
	c=a>>28;
	r.arr[1]=a&0xfffffff;
	a=this.arr[2]-b.arr[2]+c-c7;
	c=a>>28;
	r.arr[2]=a&0xfffffff;
	a=this.arr[3]-b.arr[3]+c;
	c=a>>28;
	r.arr[3]=a&0xfffffff;
	a=this.arr[4]-b.arr[4]+c;
	c=a>>28;
	r.arr[4]=a&0xfffffff;
	a=this.arr[5]-b.arr[5]+c-c7;
	c=a>>28;
	r.arr[5]=a&0xfffffff;
	a=this.arr[6]-b.arr[6]+c;
	c=a>>28;
	r.arr[6]=a&0xfffffff;
	r.arr[7]+=c;
	if(r.arr[7]>>28){r=nbi();this.subTo(a,r);}
	r.s=0;
	r.t=8;
	
	
}
//--------------------------------------------------------------------------------------------------------------------------
// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r.arr[i] = 0;
  for(i = 0; i < y.t; ++i) r.arr[i+x.t] = x.am(0,y.arr[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}
BigInteger.prototype.multiply2=function(a) {
r=nbi();
  var x = this.abs(), y = a.abs();
  var i = x.t+y.t;
  r.t = i;//+y.t;
  while(--i >= 0) r.arr[i] = 0;
  for(i = 0; i < y.t; ++i) x.am1bis(0,y.arr[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  //if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
return r;
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r.arr[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x.arr[i],r,2*i,0,1);
    if((r.arr[i+x.t]+=x.am(i+1,2*x.arr[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r.arr[i+x.t] -= x.DV;
      r.arr[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r.arr[r.t-1] += x.am(i,x.arr[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

//---------------------------------------------------------------------------------------------------------------
function bnpSquareTo2(r){
	//~ var i,j,k,u;
	//~ for(k=2*this.t;k>=0;k--) r.arr[k]=0;
	//~ for(i=0;i<this.t;i++){
		//~ var xl = this.arr[i]&0x7fff, xh = this.arr[i]>>15;
		//~ var m = (xh*xl)<<1;
		//~ r.arr[2*i]+=xl*xl+((m&0x7fff)<<15);
		//~ r.arr[2*i+1]+=xh*xh+(m>>15);
		//~ //document.write(u&((1<<this.DB)-1));		
		//~ for(j=i+1;j<this.t;j++){	
			//document.write(i);
			//document.write('+++++++++++++++++');
			//~ var l = this.arr[j]&0x7fff;
			//~ var h = this.arr[j]>>15;
			//~ //document.write();
			//~ var m = xh*l+h*xl;
			//~ low=2*(xl*l+((m&0x7fff)<<15))+r.arr[i+j];
			//~ high=2*((m>>15)+xh*h)+r.arr[i+j+1];
			//~ +=
			//~ +=
			//~ }
		//~ }
	//~ r.t=r.arr[2*this.t]>0?2*this.t:2*this.t-1;
	//~ r.s=0;
	//~ r.reshape();	
	}
//---------------------------------------------------------------------------------------------------------------

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm.arr[pm.t-1]);	// normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y.arr[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y.arr[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r.arr[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y);	// "negative" y so we can replace sub with am later
  while(y.t < ys) y.arr[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r.arr[--i]==y0)?this.DM:Math.floor(r.arr[i]*d1+(r.arr[i-1]+e)*d2);
    if((r.arr[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r.arr[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x.arr[y(2-xy)] = 1-k^2m^2
// x.arr[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this.arr[0];
  if((x&1) == 0) return 0;
  var y = x&3;		// y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2)	// pad x so am has enough room later
    x.arr[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x.arr[i]*mp mod DV
    var j = x.arr[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x.arr[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x.arr[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x.arr[j] >= x.DV) { x.arr[j] -= x.DV; x.arr[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this.arr[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);

  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}


//-----------------------------------------------------------------------------------------

function bnMod30(m){var s=nbi();this.copyTo(s);var r=nbi();return s.mod30To(m,r)}
function bnMod28(m){var s=nbi();this.copyTo(s);var r=nbi();return s.mod28To(m,r)}
function bnpMod28(m,r){
	var i,c,a;
	var x=this.arr;
	if(this.s<0){return m.subtract(this.abs().mod28(m));}
	if(this.compareTo(m)<0){return this;}
	//faire la comparaison > et le cas négatif
	for(i=this.t;i<16;i++)x[i]=0;
	a=x[0]-x[8]+x[11];//+2;
	c=0;while(a<0){a+=0x10000000;c--;}
	r.arr[0]=a&0xfffffff;c+=(a>>>28);
	a=x[1]-x[9]+x[12]+c;
	c=0;while(a<0){a+=0x10000000;c--;}
	r.arr[1]=a&0xfffffff;c+=(a>>>28);
	a=x[2]-x[8]-x[10]+x[11]+x[13]+c;
	c=0;while(a<0){a+=0x10000000;c--;}
	r.arr[2]=a&0xfffffff;c+=(a>>>28);
	a=x[3]-x[9]-x[11]+x[12]+x[14]+c;
	c=0;while(a<0){a+=0x10000000;c--;}
	r.arr[3]=a&0xfffffff;c+=(a>>>28);
	a=x[4]-x[10]-x[12]+x[13]+x[15]+c;
	c=0;while(a<0){a+=0x10000000;c--;}
	r.arr[4]=a&0xfffffff;c+=(a>>>28);
	a=x[5]-x[8]-x[13]+x[14]+c;
	c=0;while(a<0){a+=0x10000000;c--;}
	r.arr[5]=a&0xfffffff;c+=(a>>>28);
	a=x[6]-x[9]-x[14]+x[15]+c;
	c=0;while(a<0){a+=0x10000000;c--;}
	r.arr[6]=a&0xfffffff;c+=(a>>>28);
	a=x[7]-x[10]-x[15]+c;
	c=0;while(a<0){a+=0x10000000;c--;}
	r.arr[7]=a&0xfffffff;c+=(a>>>28);
	c=-c;
	var prop=0;var c2=c;var c3=c;
	while(c!=0){r.arr[prop]+=c;c=0;while(r.arr[prop]<0){r.arr[prop]+=(1<<28);c--;}c+=(r.arr[prop++]>>28);}
	var prop=2;
	while(c2!=0){r.arr[prop]+=c2;c2=0;while(r.arr[prop]<0){r.arr[prop]+=(1<<28);c2--;}c2+=(r.arr[prop++]>>28);}
	var prop=5;
	while(c3!=0){r.arr[prop]+=c3;c3=0;while(r.arr[prop]<0){r.arr[prop]+=(1<<28);c3--;}c3+=(r.arr[prop++]>>28);}
	
	r.s=0;
	r.t=8;
	return r;
	}
BigInteger.prototype.modp28=function(m){	var r=nbi();
									if(this.s<0){return m.subtract(this.abs().modp28(m));}
									if(this.compareTo(m)<0){return this;}
									this.pModp28(m,r);return r;
								}
// Reduction modulo p28 (this<=16 words)
//
BigInteger.prototype.pModp28=function(m,r){
	var i,c,a,c7;
	var x=this.arr;
	for(i=this.t;i<16;i++)x[i]=0;
	a=x[7]-x[10]-x[15];
	c7=a>>28;
	r.arr[7]=a&0xfffffff;
	a=x[0]-x[8]+x[11]-c7;
	c=a>>28;
	r.arr[0]=a&0xfffffff;
	a=x[1]-x[9]+x[12]+c;
	c=a>>28;
	r.arr[1]=a&0xfffffff;
	a=x[2]-x[8]-x[10]+x[11]+x[13]+c-c7;
	c=a>>28;
	r.arr[2]=a&0xfffffff;
	a=x[3]-x[9]-x[11]+x[12]+x[14]+c;
	c=a>>28;
	r.arr[3]=a&0xfffffff;
	a=x[4]-x[10]-x[12]+x[13]+x[15]+c;
	c=a>>28;
	r.arr[4]=a&0xfffffff;
	a=x[5]-x[8]-x[13]+x[14]+c-c7;
	c=a>>28;
	r.arr[5]=a&0xfffffff;
	a=x[6]-x[9]-x[14]+x[15]+c;
	c=a>>28;
	r.arr[6]=a&0xfffffff;
	r.arr[7]+=c;
	if(r.arr[7]>>28){document.write('special case');
		c=r.arr[7]>>28;
		r.arr[7]&=0xfffffff;
		c=-c;
		var prop=0;var c2=c;var c3=c;
		while(c!=0){r.arr[prop]+=c;c=r.arr[prop]>>28;r.arr[prop++]&=0xfffffff;}
		var prop=2;
		while(c2!=0){r.arr[prop]+=c2;c2=r.arr[prop]>>28;r.arr[prop++]&=0xfffffff;}
		var prop=5;
		while(c3!=0){r.arr[prop]+=c3;c3=r.arr[prop]>>28;r.arr[prop++]&=0xfffffff;}
	}
	r.s=0;
	r.t=8;
	return r;
	}

function bnpMod30(m,r){
	var i;
	if(this.s<0){return m.subtract(this.abs().mod30(m));document.write('hello');}
	if(this.compareTo(m)<0){return this;}
	//faire la comparaison > et le cas négatif
	for(i=this.t;i<16;i++)this.arr[i]=0;
	a=this.arr[0]+this.arr[8]+this.arr[13];
	r.arr[0]=a&0x3fffffff;c=a>>>30;
	a=this.arr[1]+this.arr[9]+this.arr[14]+c;
	r.arr[1]=a&0x3fffffff;c=a>>>30;
	a=this.arr[2]+this.arr[10]+this.arr[15]+c;
	r.arr[2]=a&0x3fffffff;c=a>>>30;
	a=this.arr[3]+this.arr[8]+this.arr[11]+this.arr[13]+c;
	r.arr[3]=a&0x3fffffff;c=a>>>30;
	a=this.arr[4]+this.arr[9]+this.arr[12]+this.arr[14]+c;
	r.arr[4]=a&0x3fffffff;c=a>>>30;
	a=this.arr[5]+this.arr[10]+this.arr[13]+this.arr[15]+c;
	r.arr[5]=a&0x3fffffff;c=a>>>30;
	a=this.arr[6]+this.arr[11]+this.arr[14]+c;
	r.arr[6]=a&0x3fffffff;c=a>>>30;
	a=this.arr[7]+this.arr[12]+this.arr[15]+c;
	r.arr[7]=a&0x3fffffff;c=a>>>30;
	
	var prop=0;var c2=c;
	while(c>0){r.arr[prop]+=c;c=r.arr[prop++]>>30;}
	var prop=3;
	while(c2>0){r.arr[prop]+=c2;c2=r.arr[prop++]>>30;}
	
	r.s=0;
	r.t=8;
	return r;
	}


function bnRightShift(n){r=nbi();this.rShiftTo(n,r);return r;}
function bnLeftShift(n){r=nbi();this.lShiftTo(n,r);return r;}

function bnSquareMod(m){r=nbi();this.squareTo(r);return r.mod(m);}
function bnpMultIntTo2(n,r){
var i,d;
var c=0;
for(i=0;i<this.t;i++){d=n*this.arr[i]+c;r.arr[i]=d&0xfffffff;c=d>>28;}
//~ d=n*this.arr[0]+c;r.arr[0]=d&0xfffffff;c=d>>28;
//~ d=n*this.arr[1]+c;r.arr[1]=d&0xfffffff;c=d>>28;
//~ d=n*this.arr[2]+c;r.arr[2]=d&0xfffffff;c=d>>28;
//~ d=n*this.arr[3]+c;r.arr[3]=d&0xfffffff;c=d>>28;
//~ d=n*this.arr[4]+c;r.arr[4]=d&0xfffffff;c=d>>28;
//~ d=n*this.arr[4]+c;r.arr[4]=d&0xfffffff;c=d>>28;
//~ d=n*this.arr[5]+c;r.arr[5]=d&0xfffffff;c=d>>28;
//~ d=n*this.arr[6]+c;r.arr[6]=d&0xfffffff;c=d>>28;
//~ d=n*this.arr[7]+c;r.arr[7]=d&0xfffffff;c=d>>28;
if(c){r.arr[this.t]=c;r.t=this.t+1;}else{r.t=this.t;}
r.s=this.s;
return r;

}
function bnpMultIntTo(n,r){
	var count=0;
while(n>0){
	if(n&1){r=r.add(this.shiftLeft(count));}
	//~ document.write(r.arr);
	count++;
	n=n>>1;
	}
	
//~ var i=0;
//~ for(i=0;i<this.t;i++){r.arr[i]=n*this.arr[i];}
//~ r.t=this.t+1;//(r.arr[this.t+1]>0)?this.t+1:this.t;
//~ r.s=this.s;
	return r;
	
//~ r.reshape();
}

//~ function bnSize32(){
	//~ var tab=new Array();
	//~ var e=2*Math.ceil(this.t/2);
	//~ var c=0;
	//~ if(e>this.t){this.arr[e]=0;}
	//~ var i=0;
	//~ for(i=0;i<e/2;i++){tab[i]=this.arr[2*e]+(this.arr[2*e+1]&((1<<(32-this.DB))-1))*2*(1<<31);}
	//~ }


















function bnMakeTab(c){var r=nbi();this.makeTabTo(c,r);return r;}
function bnpMakeTab(c,r){
var i,cross,ca,la,ha,cb,lb,hb,val;
var a=this.arr;
var b=c.arr;
var aa=new Array();
var bb= new Array();
var tabhigh=new Array();
var tabcarry=new Array();
var tablow=new Array();
	
bb=[b[0]+b[4],b[0]+b[4],b[0]+b[4],b[0]+b[4],b[1]+b[5],b[1]+b[5],b[1]+b[5],b[1]+b[5],b[2]+b[6],b[2]+b[6],b[2]+b[6],b[2]+b[6],b[3]+b[7],b[3]+b[7],b[3]+b[7],b[3]+b[7],b[0]+b[2],b[1]+b[3],b[0]+b[2],b[1]+b[3],b[4]+b[6],b[5]+b[7],b[4]+b[6],b[5]+b[7],b[0]+b[1],b[2]+b[3],b[4]+b[5],b[6]+b[7],a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7]];                     
aa=[a[0]+a[4],a[1]+a[5],a[2]+a[6],a[3]+a[7],a[0]+a[4],a[1]+a[5],a[2]+a[6],a[3]+a[7],a[0]+a[4],a[1]+a[5],a[2]+a[6],a[3]+a[7],a[0]+a[4],a[1]+a[5],a[2]+a[6],a[3]+a[7],a[0]+a[2],a[0]+a[2],a[1]+a[3],a[1]+a[3],a[4]+a[6],a[4]+a[6],a[5]+a[7],a[5]+a[7],a[0]+a[1],a[2]+a[3],a[4]+a[5],a[6]+a[7],b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7]];

for(i=0;i<bb.length;i++){
la=aa[i]&0x7fff;
ha=(aa[i]>>15);
lb=bb[i]&0x7fff;
hb=(bb[i]>>15);
cross=lb*ha+la*hb;
tablow[i]=la*lb+((cross&0x7fff)<<15);tabhigh[i]=ha*hb+(cross>>>15);
}

h30=tabhigh[0];
h31=tabhigh[1]+tabhigh[4];
h32=tabhigh[2]+tabhigh[5]+tabhigh[8];
h33=tabhigh[3]+tabhigh[12]+tabhigh[6]+tabhigh[9];
h34=tabhigh[7]+tabhigh[13]+tabhigh[10];
h35=tabhigh[11]+tabhigh[14];
h36=tabhigh[15];

l30=tablow[0];
l31=tablow[1]+tablow[4];
l32=tablow[2]+tablow[5]+tablow[8];
l33=tablow[3]+tablow[12]+tablow[6]+tablow[9];
l34=tablow[7]+tablow[13]+tablow[10];
l35=tablow[11]+tablow[14];
l36=tablow[15];

l60=tablow[16];
l61=tablow[17]+tablow[18];
l62=tablow[19];
h60=tabhigh[16];
h61=tabhigh[17]+tabhigh[18];
h62=tabhigh[19];

l90=tablow[20];
l91=tablow[21]+tablow[22];
l92=tablow[23];
h90=tabhigh[20];
h91=tabhigh[21]+tabhigh[22];
h92=tabhigh[23];

h12=tabhigh[24];
l12=tablow[24];
h15=tabhigh[25];
l15=tablow[25];
h18=tabhigh[26];
l18=tablow[26];
h21=tabhigh[27];
l21=tablow[27];
h10=tabhigh[28];
l10=tablow[28];
h11=tabhigh[29];
l11=tablow[29];
h13=tabhigh[30];
l13=tablow[30];
h14=tabhigh[31];
l14=tablow[31];
h16=tabhigh[32];
l16=tablow[32];
h17=tabhigh[33];
l17=tablow[33];
h19=tabhigh[34];
l19=tablow[34];
h20=tabhigh[35];
l20=tablow[35];

val=l10+l11-l13+l14+l16+l17-2*l19+l21+l34-l62-l92-h10-h11+h12-h13-h14+h15-h16-2*h17+h18-2*h20+h21+h33-h61-h91+h92;//+c10-c11+c13+c14+2*c16-c18+2*c19+2*c20-c21+c32-c60-c90+c91;
r.arr[0]=val%(1<<30);
cc=(val-r.arr[0])/(1<<30);
while(r.arr[0]<0){r.arr[0]+=(1<<30);cc--;}

val=cc-l10-l11+l12+l13+l14-l15-l16-l17+l18+l19+2*l20-l21+l35+h10+h11-h13+h14+h16+h17-2*h19+h21+h34-h62-h92;//-c10-c11+c12-c13-c14+c15-c16-2*c17+c18-2*c20+c21+c33-c61-c91+c92;
r.arr[1]=val%(1<<30);
cc=(val-r.arr[1])/(1<<30);
while(r.arr[1]<0){r.arr[1]+=(1<<30);cc--;}

val=cc-l10+l11-l13-l14-l16+l17-l19-l20+l36+l60+l90-h10-h11+h12+h13+h14-h15-h16-h17+h18+h19+2*h20-h21+h35;//+c10+c11-c13+c14+c16+c17-2*c19+c21+c34-c62-c92;
r.arr[2]=val%(1<<30);
cc=(val-r.arr[2])/(1<<30);
while(r.arr[2]<0){r.arr[2]+=(1<<30);cc--;}

val=cc+l10+2*l11-l12+2*l14-l15+2*l16+2*l17-l18-l19+l20+l34+l61-l62+l91-l92-2*h10+h12-2*h13-2*h14+h15-2*h16-h17+h18-h19-3*h20+h21+h33+h36+h60-h61+h90-h91+h92;//-c10-c11+c12+c13+c14-c15-c16-c17+c18+c19+2*c20-c21+c35+c10-c11+c13+c14+2*c16-c18+2*c19+2*c20-c21+c32-c60-c90+c91;
r.arr[3]=val%(1<<30);
cc=(val-r.arr[3])/(1<<30);
while(r.arr[3]<0){r.arr[3]+=(1<<30);cc--;}

val=cc-l10-l11+2*l13-l15-2*l16-2*l17+l18+2*l19+l20-l21+l30+l35+l62+l92+h10+2*h11-h12+2*h14-h15+2*h16+2*h17-h18-h19+h20+h34+h61-h62+h91-h92;//-c10+c11-c13-c14-c16+c17-c19-c20+c36+c60+c90-c10-c11+c12-c13-c14+c15-c16-2*c17+c18-2*c20+c21+c33-c61-c91+c92;
r.arr[4]=val%(1<<30);
cc=(val-r.arr[4])/(1<<30);
while(r.arr[4]<0){r.arr[4]+=(1<<30);cc--;}

val=cc+l10+l11-l12-l13-2*l14+l15+2*l17-l18-2*l19-2*l20+l21+l31+l36+l90-h10-h11+2*h13-h15-2*h16-2*h17+h18+2*h19+h20-h21+h30+h35+h62+h92;//+c10+2*c11-c12+2*c14-c15+2*c16+2*c17-c18-c19+c20+c34+c61-c62+c91-c92;
r.arr[5]=val%(1<<30);
cc=(val-r.arr[5])/(1<<30);
while(r.arr[5]<0){r.arr[5]+=(1<<30);cc--;}

val=cc+l10-l11+l13+l14+2*l16-l18+2*l19+2*l20-l21+l32-l60-l90+l91+h10+h11-h12-h13-2*h14+h15+2*h17-h18-2*h19-2*h20+h21+h31+h36+h90;//-c10-c11+2*c13-c15-2*c16-2*c17+c18+2*c19+c20-c21+c30+c35+c62+c92;
r.arr[6]=val%(1<<30);
cc=(val-r.arr[6])/(1<<30);
while(r.arr[6]<0){r.arr[6]+=(1<<30);cc--;}

val=cc-l10-l11+l12-l13-l14+l15-l16-2*l17+l18-2*l20+l21+l33-l61-l91+l92+h10-h11+h13+h14+2*h16-h18+2*h19+2*h20-h21+h32-h60-h90+h91;//+c10+c11-c12-c13-2*c14+c15+2*c17-c18-2*c19-2*c20+c21+c31+c36+c90;
r.arr[7]=val%(1<<30);
cc=(val-r.arr[7])/(1<<30);
while(r.arr[7]<0){r.arr[7]+=(1<<30);cc--;}


var prop=0;
var cc2=cc;
while(cc!=0){r.arr[prop]+=cc;cc=r.arr[prop++]>>30;}
var prop=3;
while(cc2!=0){r.arr[prop]+=cc2;cc2=r.arr[prop++]>>30;}

r.s=0;
r.t=8;
	}





















function bnKaratsuba(x,y){
var k=x.t;
k=Math.round(k/2);
var x0=nbitab(x.arr.slice(0,k));
var x1=nbitab(x.arr.slice(k,x.t));
var y0=nbitab(y.arr.slice(0,k));
var y1=nbitab(y.arr.slice(k,y.t));
var ac=x0.multiply(y0);
var bd=x1.multiply(y1);
y0=y0.add(y1);
x0=x0.add(x1);
var abcd=nbitab(ac.arr.concat(bd.arr));
return abcd.add(((y0.multiply(x0)).subtract(ac.add(bd))).rightShift2(k));
}

function bnRightShift2(n){
	var i;
	for(i=0;i<n;i++)
	{this.arr.unshift(0);}
	this.t+=n;
	return this;
}
BigInteger.prototype.voidresh=function(){
	var i,d;
	var c=0;
	for(i=0;i<this.t;i++){
		d=this.arr[i]+c;
		this.arr[i]=d&0xfffffff;//((1<<this.DB)-1);
		c=d>>28;//this.DB;
		}
	if(c){this.arr[this.t]=c;this.t++}
	}

function bnpReshape(r){
	var i,d;
	var c=0;
	for(i=0;i<this.t;i++){
		d=this.arr[i]+c;
		r.arr[i]=d&0xfffffff;//((1<<this.DB)-1);
		c=d>>28;//this.DB;
		}
	if(c){r.arr[this.t]=c;r.t=this.t+1}else{r.t=this.t;}
	//~ r.t=(c>0)?this.t+1:this.t;
	r.s=this.s;
	//~ r.clamp();
	}
//-----------------------------------------------------------------------------------------
function randBigInt(sizeInteger){
var xx=new String('');
for(index=0;index<sizeInteger;index++){
xx=xx.concat(Math.ceil(Math.random()*10).toString());
}
var result=new BigInteger(xx);
return result.setBit(0);
}
//-----------------------------------------------------------------------------------------
function bnReshape(){var r=nbi();this.resh(r);return r;}
function bnMultInt(n){var r=nbv(0);return this.multIntTo(n,r);}
function bnSquare(){var r=nbi();this.squareTo(r);return r;}
//-----------------------------------------------------------------------------------------
// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.subTo2 = bnpSubTo2;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;
BigInteger.prototype.resh=bnpReshape;
BigInteger.prototype.multIntTo=bnpMultIntTo2;
BigInteger.prototype.squareTo2=bnpSquareTo2;
BigInteger.prototype.mod30To=bnpMod30;
BigInteger.prototype.mod28To=bnpMod28;
BigInteger.prototype.makeTabTo=bnpMakeTab;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;
BigInteger.prototype.rightShift2 = bnRightShift2;
BigInteger.prototype.multInt=bnMultInt;
BigInteger.prototype.rShift=bnRightShift;
BigInteger.prototype.lShift=bnLeftShift;
BigInteger.prototype.squareMod=bnSquareMod;
BigInteger.prototype.reshape=bnReshape;
BigInteger.prototype.square=bnSquare;
BigInteger.prototype.mod30=bnMod30;
BigInteger.prototype.mod28=bnMod28;

BigInteger.prototype.newKarat=bnMakeTab;

//BigInteger.prototype.karatsuba = bnKaratsuba;
// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);


BigInteger.prototype.spSquare=function(r){this.squareTo(r);return r;}
BigInteger.prototype.spAdd=function(b,r){this.addTo2(b,r);return r;}
BigInteger.prototype.spSubtract=function(b,r){this.subTo2(b,r);return r;}
BigInteger.prototype.spMultiply=function(b,r){this.multiplyTo(b,r);return r;}
BigInteger.prototype.spMod=function(m,r){this.pModp28(m,r);return r;}
BigInteger.prototype.isZero=function(){
	var i=this.t;
	while(i--){if(this.arr[i]!==0)return 0;}
	return 1;
	}
