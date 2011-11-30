// This file is a fork of the jsbn.js file by Tom Wu (see below).

// It is released under the GPL v3 or later.
// Copyright (c) 2011 Laurie Haustenne, Quentin De Neyer, Olivier Pereira
// (Universite catholique de Louvain).
//
// Original jsbn.js file:
// Copyright (c) 2005 Tom Wu
// See "LICENSE-JSBN" for details on original file.

// This library is divided into 3 parts :
// -1- original library with some small forkings (Basic JavaScript BN library - subset useful for RSA encryption)
// -2- some useful additional functions including karatsuba multiplication
// -3- some efficient functions (reduction-addition-subtraction) when working in Z_{p28} with p28 = 2^224 + 2^140 + 2^56 + 1


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------1/3------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// This first part corresponds to the original library with some small forkings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

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


// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m. q or r may be null.
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
  var nsh = this.DB-nbits(pm.arr[pm.t-1]); // normalize modulus
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
  t.subTo(y,y); // "negative" y so we can replace sub with am later
  while(y.t < ys) y.arr[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r.arr[--i]==y0)?this.DM:Math.floor(r.arr[i]*d1+(r.arr[i-1]+e)*d2);
    if((r.arr[i]+=y.am(0,qd,r,j,0,ys)) < qd) { // Try it out
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
  if(nsh > 0) r.rShiftTo(nsh,r); // Denormalize remainder
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
// xy == 1 (mod m)
// xy = 1+km
// xy(2-xy) = (1+km)(1-km)
// x.arr[y(2-xy)] = 1-k^2m^2
// x.arr[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this.arr[0];
  if((x&1) == 0) return 0;
  var y = x&3; // y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf; // y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff; // y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff; // y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV; // y == 1/x mod 2^dbits
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
  while(x.t <= this.mt2) // pad x so am has enough room later
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
//
function bnRightShift(n){r=nbi();this.rShiftTo(n,r);return r;}
function bnLeftShift(n){r=nbi();this.lShiftTo(n,r);return r;}
function bnSquareMod(m){r=nbi();this.squareTo(r);return r.mod(m);}
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
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;
BigInteger.prototype.rShift=bnRightShift;
BigInteger.prototype.lShift=bnLeftShift;
BigInteger.prototype.squareMod=bnSquareMod;
BigInteger.prototype.square=bnSquare;


// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------2/3-------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// This second part contains some useful functions added to the initial jsbn library
//
// z = randBigInt(n); outputs a n-digit random big integer
// z = nbitab(array); returns a new big integer with z.arr=array
// z = a.bnIsZero; returns 1 if a = 0 and 0 else
// z = a.multInt(n); returns a*this with a <= 8
// z = bnKaratsuba(a,b); returns a*b using Karatsuba depth 1
// a = a.rightShift2(n); returns a shifted by n words (a grows)
// a.voidresh(); reshapes a such that a.arr[i] < 2^28 for all i
// z = a.reshape(); returns a copy of reshaped a
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// outputs random big integer with number of digits = sizeInteger
function randBigInt(sizeInteger){
var xx=new String('');
for(index=0;index<sizeInteger;index++){
xx=xx.concat(Math.ceil(Math.random()*10).toString());
}
var result=new BigInteger(xx);
return result.setBit(0);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// returns new integer from array
// result.arr = tab
function nbitab(tab){
result=new BigInteger(null);
result.arr=tab;
result.t=tab.length;
result.s=0;
return result;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// The function returns 1 if this = 0
// The function returns 0 if this != 0
function bnIsZero(){
var i=this.t;
while(i--){if(this.arr[i]!==0)return 0;}
return 1;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// this function multiplies a big integer with a small integer < 8
// multIntTo calls bnpMultIntTo2 but it can be changed at the end of the library (BigInteger.prototype.multIntTo=bnpMultIntTo)
function bnMultInt(n){var r=nbv(0);return this.multIntTo(n,r);}

// this function multiplies each word of the big integer
function bnpMultIntTo2(n,r){
var i,d;
var c=0;
for(i=0;i<this.t;i++){d=n*this.arr[i]+c;r.arr[i]=d&0xfffffff;c=d>>28;}
if(c){r.arr[this.t]=c;r.t=this.t+1;}else{r.t=this.t;}
r.s=this.s;
return r;
}

// this function multiplies by a small integer by "shifting and adding" the big integer according to small integer bit representation
function bnpMultIntTo(n,r){
var count=0;
while(n>0){
	if(n&1){r=r.add(this.shiftLeft(count));}
	count++;
	n=n>>1;
}
return r;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// The function computes the product of x and y using one round of Karatsuba
// Karatsuba multiplication if efficient for very large integers
// Depending on the browser, computer, OS, ... cross-over may happen between 600 and 3000 bits
function bnKaratsuba(x,y){
var k,x0,x1,y0,y1,ac,bd,abcd
k=x.t;
k=Math.round(k/2);
x0=nbitab(x.arr.slice(0,k));
x1=nbitab(x.arr.slice(k,x.t));
y0=nbitab(y.arr.slice(0,k));
y1=nbitab(y.arr.slice(k,y.t));
ac=x0.multiply(y0);
bd=x1.multiply(y1);
y0=y0.add(y1);
x0=x0.add(x1);
abcd=nbitab(ac.arr.concat(bd.arr));
return abcd.add(((y0.multiply(x0)).subtract(ac.add(bd))).rightShift2(k));
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// The function returns this shifted by n words (not bits)
// Right shift means that the number grows
function bnRightShift2(n){
var i;
for(i=0;i<n;i++)
{this.arr.unshift(0);}
this.t+=n;
return this;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// These functions reshapes a big integer. If a function outputs a big integer which array elements are larger than 2^28, use these functions
// to reshape the result.
// this.voidresh() reshapes this while this.reshape() returns a reshaped copy of this without modifying this

function bnVoidresh(){
var i,d;
var c=0;
for(i=0;i<this.t;i++){
d=this.arr[i]+c;
this.arr[i]=d&0xfffffff;//((1<<this.DB)-1);
c=d>>28;//this.DB;
}
if(c){this.arr[this.t]=c;this.t++}
}
//-----------
function bnReshape(){var r=nbi();this.resh(r);return r;}

function bnpReshape(r){
var i,d;
var c=0;
for(i=0;i<this.t;i++){
d=this.arr[i]+c;
r.arr[i]=d&0xfffffff;//((1<<this.DB)-1);
c=d>>28;//this.DB;
}
if(c){r.arr[this.t]=c;r.t=this.t+1}else{r.t=this.t;}
r.s=this.s;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

// private
BigInteger.prototype.resh=bnpReshape;
BigInteger.prototype.multIntTo=bnpMultIntTo2;

// public
BigInteger.prototype.voidresh=bnVoidresh
BigInteger.prototype.reshape=bnReshape;
BigInteger.prototype.rightShift2 = bnRightShift2;
BigInteger.prototype.multInt=bnMultInt;
BigInteger.prototype.isZero=bnIsZero

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------3/3-------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// This third pard contains functions that have been implemented to accelerate computations in Z_{p28}, where p28 = 2^224 + 2^140 + 2^56 +1 is a prime 
// that has been chosen for the particular architecture of the library that represents big integers with arrays which elements are 28 bits long. 
// The functions require entries in Z_{p28} and outputs the result in this field too
//
// Here is the way to use these functions
//
// z=a.modp28(p); with p = p28 (mandatory), computes a mod p28
// z=a.add2(b); computes a + b mod p28
// z=a.subtract2(b); computes a - b modp28
//
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reduction (public) modulo p28 = 2^224 + 2^140 + 2^56 +1 
// this <= 16 words
// the function modp28 calls the private function pModp28 that accepts only entries between 0 and p
function bnModp28(m){ 
var r=nbi();
// if this < 0, this mod p = p-(|this| mod p)
if(this.s<0){return m.subtract(this.abs().modp28(m));}
// if this < p, return this
if(this.compareTo(m)<0){return this;}
// else, normal case
this.pModp28(m,r);return r;
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reduction (private) modulo p28 = 2^224 + 2^140 + 2^56 +1 
// this <= 16 words
// 0 < this < p
// Considering x = 2^28, we have x^8 = - x^5 - x^2 - 1 mod p
// 				      x^9 = - x^6 - x^3 - x mod p
//				      and so on...
//
function bnpModp28(m,r){
var i,c,a,c7;
var x=this.arr;
for(i=this.t;i<16;i++)x[i]=0;
a=x[7]-x[10]-x[15];
c7=a>>28;r.arr[7]=a&0xfffffff;
a=x[0]-x[8]+x[11]-c7;
c=a>>28;r.arr[0]=a&0xfffffff;
a=x[1]-x[9]+x[12]+c;
c=a>>28;r.arr[1]=a&0xfffffff;
a=x[2]-x[8]-x[10]+x[11]+x[13]+c-c7;
c=a>>28;r.arr[2]=a&0xfffffff;
a=x[3]-x[9]-x[11]+x[12]+x[14]+c;
c=a>>28;r.arr[3]=a&0xfffffff;
a=x[4]-x[10]-x[12]+x[13]+x[15]+c;
c=a>>28;r.arr[4]=a&0xfffffff;
a=x[5]-x[8]-x[13]+x[14]+c-c7;
c=a>>28;r.arr[5]=a&0xfffffff;
a=x[6]-x[9]-x[14]+x[15]+c;
c=a>>28;r.arr[6]=a&0xfffffff;
r.arr[7]+=c;

// the next part is almost never executed, because r.arr[7] +c is unlikely 
// to overflow (>28 bits), c being a very small integer (most of the time 0 or 1).
//---------------------------------------------------------------
if(r.arr[7]>>28){
c=r.arr[7]>>28;r.arr[7]&=0xfffffff;
c=-c;
var prop=0;var c2=c;var c3=c;
while(c!=0){r.arr[prop]+=c;c=r.arr[prop]>>28;r.arr[prop++]&=0xfffffff;}
var prop=2;
while(c2!=0){r.arr[prop]+=c2;c2=r.arr[prop]>>28;r.arr[prop++]&=0xfffffff;}
var prop=5;
while(c3!=0){r.arr[prop]+=c3;c3=r.arr[prop]>>28;r.arr[prop++]&=0xfffffff;}
}
//----------------------------------------------------------------
r.s=0; // result is always positive
r.t=8; // 
return r;
}
//-------------------------------------------------------------------------------------------------------------------
// subtraction (public) of 2 elements in Z_{p28}
// returns this-a
// requires this and b in Z_{p28}
// result is in Z_{p28} too
function bnSubtract2(a) { var r = nbi(); this.subTo2(a,r); return r; }

// subtraction (private)
function bnpSubTo2(b,r) {
var a,c,c7,i;
for(i=b.t;i<8;i++)b.arr[i]=0; // fill the array with 0's to avoid operations with undefined numbers
for(i=this.t;i<8;i++)this.arr[i]=0; // the same with this
	
a=this.arr[7]-b.arr[7];c7=a>>28;
r.arr[7]=a&0xfffffff;
a=this.arr[0]-b.arr[0]-c7;c=a>>28;
r.arr[0]=a&0xfffffff;
a=this.arr[1]-b.arr[1]+c;c=a>>28;
r.arr[1]=a&0xfffffff;
a=this.arr[2]-b.arr[2]+c-c7;c=a>>28;
r.arr[2]=a&0xfffffff;
a=this.arr[3]-b.arr[3]+c;c=a>>28;
r.arr[3]=a&0xfffffff;
a=this.arr[4]-b.arr[4]+c;c=a>>28;
r.arr[4]=a&0xfffffff;
a=this.arr[5]-b.arr[5]+c-c7;c=a>>28;
r.arr[5]=a&0xfffffff;
a=this.arr[6]-b.arr[6]+c;c=a>>28;
r.arr[6]=a&0xfffffff;
r.arr[7]+=c;

if(r.arr[7]>>28){r=nbi();this.subTo(b,r);} // almost never happens because c is a very small integer

r.s=0;
r.t=8;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// addition (public) of 2 elements in Z_{p28}
// returns this+a
// requires this and b in Z_{p28}
// result is in Z_{p28} too
function bnAdd2(a) { var r = nbi(); this.addTo2(a,r); return r; }

// addition (private)
function bnpAddTo2(b,r) {
var a,c,c7,i;
	
for(i=b.t;i<8;i++)b.arr[i]=0;// fill the array with 0's to avoid operations with undefined numbers
for(i=this.t;i<8;i++)this.arr[i]=0;// the same with this
	
a=this.arr[7]+b.arr[7];c7=a>>28;
r.arr[7]=a&0xfffffff;
a=this.arr[0]+b.arr[0]-c7;c=a>>28;
r.arr[0]=a&0xfffffff;
a=this.arr[1]+b.arr[1]+c;c=a>>28;
r.arr[1]=a&0xfffffff;
a=this.arr[2]+b.arr[2]+c-c7;c=a>>28;
r.arr[2]=a&0xfffffff;
a=this.arr[3]+b.arr[3]+c;c=a>>28;
r.arr[3]=a&0xfffffff;
a=this.arr[4]+b.arr[4]+c;c=a>>28;
r.arr[4]=a&0xfffffff;
a=this.arr[5]+b.arr[5]+c-c7;c=a>>28;
r.arr[5]=a&0xfffffff;
a=this.arr[6]+b.arr[6]+c;c=a>>28;
r.arr[6]=a&0xfffffff;
r.arr[7]+=c;

if(r.arr[7]>>28){r=nbi();this.addTo(a,r);}// almost never happens because c is a very small integer

r.s=0;
r.t=8;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

// private
BigInteger.prototype.pModp28=bnpModp28;
BigInteger.prototype.subTo2 = bnpSubTo2;
BigInteger.prototype.addTo2 = bnpAddTo2;

// public
BigInteger.prototype.modp28=bnModp28;
BigInteger.prototype.add2 = bnAdd2;
BigInteger.prototype.subtract2 = bnSubtract2;


// these functions allow to carry out operations without need to create a new object,
// which may take some time, when an already instanciated big integer can be re-used
// this has been used for addition and doubling of elliptic curve points
BigInteger.prototype.spAdd=function(b,r){this.addTo2(b,r);return r;}
BigInteger.prototype.spSubtract=function(b,r){this.subTo2(b,r);return r;}
BigInteger.prototype.spMod=function(m,r){this.pModp28(m,r);return r;}

