var n=24;//13;//19//24;//;
var m=10;//18;//14;10;//
var w=2;
var c=75;//1//75;//1;
var p=(1<<n)-c;

table1=[14289347,14894395,8423662,7818613,16777140,2487794,1882746,8353479,8958528];
table2=[14894395,7818613,2487794,8353479,1,14894395,7818613,2487794,8353479]; 
table4=[7818613,8353479,14894395,2487794,1,7818613,8353479,14894395,2487794];

function OEF(){
	//constructeur
	//t=nombre de mots de l'element
	this.arr=[0,0,0,0,0,0,0,0,0,0];//,0,0,0,0,0,0,0,0];//,0,0,0,0,0,0,0,0];
	}
//----------------------------------------------------------------------------------	
OEF.ONE=noef(1);
//----------------------------------------------------------------------------------	
OEF.prototype.toString=function(){
//~ var i,s;
//~ s="'".concat(base64Encode(this.arr[0].toString(16))).concat("'");//["'"+hex2b64(this.arr[0].toString(16))+"'"];	
//~ for(i=1;i<8;i++){s=s.concat(",'".concat(base64Encode(this.arr[i].toString(16))).concat("'"));}
return this.arr.toString();//s;
}
//----------------------------------------------------------------------------------	
	
function noef(i) { var r = new OEF(); r.arr[0]=i; return r; }
function noeftab(tab){var r = new OEF(); r.arr=tab; return r;}
function noeftab64(tab){var r=new OEF();
	for(var i=0;i<8;i++){r.arr[i]=parseInt(base64Decode(tab[i]),16);}
	return r;}
function randOEF(){
	var r=new OEF();
	for(var ii=0;ii<m;ii++){r.arr[ii]=Math.floor(Math.random()*p);}
	return r;
	}

OEF.prototype.add=function(a){
	//fonction add principale
	r=new OEF();
	return this.addPrivate(a,r);
	}
	
OEF.prototype.addPrivate=function(a,r){
	//fonction auxiliaire
	//on suppose que les elements des tableaux des arguments sont <p.
	var i;
	for(i=0;i<m;i++){
		r.arr[i]=(this.arr[i]+a.arr[i])%p;
		//~ if (r.arr[i]>p){ r.arr[i]-=p; } //mod p
	}
	return r;
}
//----------------------------------------------------------------------------------
OEF.prototype.subtract=function(a){
	//fonction sub principale
	r=new OEF();
	return this.subPrivate(a,r);
	}
	
OEF.prototype.subPrivate=function(a,r){
	//fonction auxiliaire
	//on suppose que les elements des tableaux des arguments sont <p.
	var i;
	for(i=0;i<m;i++){
		r.arr[i]=(this.arr[i]-a.arr[i]+p)%p;
		//~ if (r.arr[i]<0){ r.arr[i]+=p; } //mod p
	}
	return r;
}
//----------------------------------------------------------------------------------
OEF.prototype.multaccmod=function(a){
	//Avec Acc. Pour max 13 bits (mots de 32)
	r=new OEF();
	return this.multaccmodPrivate(a,r);	
}
OEF.prototype.multaccmodPrivate=function(a){
	var i,j,k;
	for(i=m;i;){
		--i;
		for(j=m;j;){
			--j;
			//document.write(i+' '+j+'---');
			if(i+j>m-1){r.arr[i+j-m]+=w*this.arr[i]*a.arr[j];}
			else{r.arr[i+j]+=this.arr[i]*a.arr[j];}
			}
		}
	for(k=m;k;){
		--k;
		var v=r.arr[k]>>n;
		var u=r.arr[k]-(v<<n);
		//~ document.write(r.arr[k]+'---');
		r.arr[k]=v+u;
		var v=r.arr[k]>>n;
		var u=r.arr[k]-(v<<n);
		//~ document.write(r.arr[k]+'---');
		r.arr[k]=v+u;
		if (r.arr[k]>p) {r.arr[k]-=p;}
			}
	return r;
}
//----------------------------------------------------------------------------------
OEF.prototype.multiply=function(a){
	//Pour max 24 bits (mots de 52)
	var r=new OEF();
	return this.multaccPrivate(a,r);	
}
OEF.prototype.multaccPrivate=function(a,r){
	var i,j,k,l,T;
	for(i=0;i<m;i++){
		k=i;l=0;T=this.arr[i];
		for(j=m-i;j;j--){r.arr[k++]+=T*a.arr[l++];}
		k-=m;T*=w;
		for(j=i;j;j--){r.arr[k++]+=T*a.arr[l++];}
		}
	for(k=m;k;){r.arr[--k]%=p;}
	return r;
}
//----------------------------------------------------------------------------------
OEF.prototype.multsansacc=function(a){
	//Sans Acc. Pour max 15 bits (mots de 32)
	r=new OEF();
	return this.multaccmodPrivate(a,r);	
}
OEF.prototype.multsansaccPrivate=function(a){
	var i,j,k;
	for(i=m;i;){
		--i;
		for(j=m;j;){
			--j;
			if(i+j>m-1){r.arr[i+j-m]+=w*this.arr[i]*a.arr[j];}
			else{k=i+j;
				r.arr[k]+=this.arr[i]*a.arr[j];
				var v=r.arr[k]>>n;
				var u=r.arr[k]-(v<<n);
				r.arr[k]=v+u;
				if (r.arr[k]>p) {r.arr[k]-=p;}
				}
			}
		}

	return r;
}

//----------------------------------------------------------------------------------
OEF.prototype.scalarMult=function(scalar){var r=new OEF();this.scalarMultPrivate(scalar,r);return r;}
OEF.prototype.scalarMultPrivate=function(scalar,r){
	for(var i=0;i<m;i++){r.arr[i]=(this.arr[i]*scalar)%p;}
	}
function modInv(a){
	var u,v,x,x1,x2,Q,r
	u=a;v=p;
	x1=1;x2=0;
	while(u!=1){
		r=v%u;q=(v-r)/u;x=x2-q*x1;
		v=u;u=r,x2=x1;x1=x;		
		}
	x1%=p;if(x1<0){x1+=p;}
	return x1;
	}


function tableFrob(){
	var table1=new Array();
	var table2=new Array();
	var table4=new Array();
	var j,exponent;
	for(j=1;j<m;j++){
		table1[j-1]=new BigInteger(w.toString()).modPow(new BigInteger(p.toString()).multiply(new BigInteger(j.toString())).divide(new BigInteger(m.toString())),new BigInteger(p.toString()));
		table2[j-1]=new BigInteger(w.toString()).modPow(new BigInteger(p.toString()).square().multiply(new BigInteger(j.toString())).divide(new BigInteger(m.toString())),new BigInteger(p.toString()));
		table4[j-1]=new BigInteger(w.toString()).modPow(new BigInteger(p.toString()).square().square().multiply(new BigInteger(j.toString())).divide(new BigInteger(m.toString())),new BigInteger(p.toString()));
		}
		document.write('table1=[')
	for(j=1;j<m;j++){
		document.write(table1[j-1]);if(j<m-1)document.write(',');
		if(j==m-1)document.write('];');
		}
		document.write("<br/>");
		document.write('table2=[')
	for(j=1;j<m;j++){
		document.write(table2[j-1]);if(j<m-1)document.write(',');
		if(j==m-1)document.write('];');
		}
		document.write("<br/>");
		document.write('table4=[')
	for(j=1;j<m;j++){
		document.write(table4[j-1]);if(j<m-1)document.write(',');
		if(j==m-1)document.write('];');
		}
		document.write("<br/>");
		}
OEF.prototype.frobenius=function(i){
	r=new OEF;
	r.arr[0]=this.arr[0]; //elements of Fp are fixed by the map
	if(i==1){for(j=1;j<m;j++){r.arr[j]=this.arr[j]*table1[j-1]%p;}}
	if(i==2){for(j=1;j<m;j++){r.arr[j]=this.arr[j]*table2[j-1]%p;}}
	if(i==4){for(j=1;j<m;j++){r.arr[j]=this.arr[j]*table4[j-1]%p;}}
	return r;
	}
OEF.prototype.modInverse=function(){
	//step 1
	var t1=this.frobenius(1);
	var t2=t1.multiply(this);
	var t3=t2.frobenius(2);
	t2=t2.multiply(t3);
	t3=t2.frobenius(4);
	t2=t2.multiply(t3);
	t2=t2.frobenius(2);
	var r=t1.multiply(t2);///a^(r-1)
	//step 2
	var r2=r.multiply(this);//a^r
	//step 3
	r2=modInv(r2.arr[0]);
	//step 4
	return r.scalarMult(r2);
	}
OEF.prototype.square=function(){
	var r=new OEF();
	return this.squarePrivate(r);	
}
OEF.prototype.squarePrivate=function(r){
	var i,j;
	for(i=0;i<m;i++){
		if(2*i>m-1){r.arr[2*i-m]+=w*this.arr[i]*this.arr[i];}
		else{r.arr[2*i]+=this.arr[i]*this.arr[i];};
		for(j=i+1;j<m;j++){
			if(i+j>m-1){r.arr[i+j-m]+=2*w*this.arr[i]*this.arr[j];}
			else{r.arr[i+j]+=2*this.arr[i]*this.arr[j];}
		}
	}
	for(k=m;k;){r.arr[--k]%=p;}
	return r;
}
OEF.prototype.isZero=function(){
	var i=m;
	while(i--){if(this.arr[i]!==0)return 0;}
	return 1;
	}
OEF.prototype.spAdd=function(b,r){this.addPrivate(b,r);return r;}
OEF.prototype.spSubtract=function(b,r){this.subPrivate(b,r);return r;}
OEF.prototype.spScalarMult=function(b,r){this.scalarMultPrivate(b,r);return r;}

	