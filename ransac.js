var bestInliers;
var mainRotX;
var bestFit;
var sample;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function dot_product(vector1, vector2) {
  var result = 0;
  for (var i = 0; i < 3; i++) {
    result += vector1[i] * vector2[i];
  }
  return result;
}

function findBestLine() {
	var bestmod;
	var besterr = 1000000;
	for(var i = 0; i < 170; i++) {
		var rand1 = p[getRandomInt(0,p.length-1)];
                var rand2 = p[getRandomInt(0,p.length-1)];
		
		var k = (rand2[1] - rand1[1]) / (rand2[0]- rand2[0])
		var b = rand1[1]-k*rand1[0];
		var err = 0;

		for(var j = 0; j < p.length;j++) {
			var dist = Math.abs()
		}
	}
}


function findBestPlane(p) {
	var bestmod;
	var besterr = 10000000
	for(var i = 0; i < 220; i++) {

		var rand1 = p[getRandomInt(0,p.length-1)];
		var rand2 = p[getRandomInt(0,p.length-1)];
		var rand3 = p[getRandomInt(0,p.length-1)];

		var PR = [rand2[0]-rand1[0],rand2[1]-rand1[1],rand2[2]-rand1[2]];
		var PQ = [rand3[0]-rand1[0],rand3[1]-rand1[1],rand3[2]-rand1[2]];

		var PRxPQ =[PR[1]*PQ[2] - PR[2]*PQ[1],PR[2]*PQ[0] - PR[0]*PQ[2], PR[0]*PQ[1] - PR[1]*PQ[0]]
		var a = PRxPQ[0]
		var b = PRxPQ[1]
		var c = PRxPQ[2]
		var d = a*(-rand1[0])+b*(-rand1[1])+c*(-rand1[2]);

		var err = 0
		for(var j =0; j < p.length; j++) {

			var distance = Math.abs(a*p[j][0]+b*p[j][1] + c*p[j][2]+d)/Math.sqrt(Math.pow(a,2)+Math.pow(b,2)+Math.pow(c,2))//Math.abs(-k*p[j][0] + 1*p[j][1]+b)/Math.sqrt(Math.pow(k,2)+1);
			err += distance
		}
		if(err < besterr) {
			besterr = err
			bestmod = [a,b,c,d] //[k,b]
		}
	}
	return bestmod;
}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

function chunk(arr, chunkSize) {
  var R = [];
  for (var i=0,len=arr.length; i<len; i+=chunkSize)
    R.push(arr.slice(i,i+chunkSize));
  return R;
}


function ransac(points1, tosi=[]) {
	if(mainRotX) 
	{
		var te = points.geometry.clone()
		te.applyMatrix(points.matrix)
		//points.geometry.applyMatrix4(points.matrix)
		var dat = te.getAttribute('position').array
	}
	else {
		var dat = points1;
		//var dat = points.geometry.getAttribute('position').array
	}
	
	var dataSet = [];
	
	for(var j = 0; j <dat.length-1;j+=3) {
		if(tosi.length == 0) {
			if(dat[j+2]<0) {
				dataSet.push([dat[j],dat[j+1],dat[j+2]])
			}
		}
		else {
			if(dat[j+2] < 0) {
				if(dat[j] < tosi[0] && dat[j] > tosi[1]) {
					if(dat[j+1] < tosi[2] && dat[j+1] > tosi[3]) {
						dataSet.push([dat[j],dat[j+1],dat[j+2]]);
					}
				}
			}	
		}
	}
	if(dataSet.length > 100000) {
		var half = Math.ceil(dataSet.length/4);
		dataSet = dataSet.splice(0,(half));
		console.log(dataSet.length)
	}
	var n = 1
	var ratio = Math.round(dataSet.length/n)
	var test = chunk(dataSet,ratio);
        
	var t = 0.2
	var lena = ratio/(6*n);
	var iters = 0;
	bestErr = 10000000;
	if(ratio > 300000) {
		var b= 150
	}
	else if(ratio > 100000) {
		var b = 200
	}
	else if(ratio < 5000){
		var b = 3000
	}
	else {
		b =400
	}
	for(var z = 0; z < b; z++) {
		data = test[iters];
		var maybeInliers = [];
		
		var cache = [];
		if(ratio > 100000) {
			var man = 500
		}
		else if(ratio < 15000) {
			var man = 15
		}
		else {
			var man = 200
		}
		for(var i = 0; i < ratio/man; i++) {
			var rand = getRandomInt(0,data.length-1)
			maybeInliers.push(data[rand]);
			cache.push(data[rand])
		}

		var maybeModel = findBestPlane(maybeInliers)	
		var alsoInliers = [];
		thisErr = 0;
		var testSet = [];
	
		for(var  l = 0; l < data.length-1; l++) {
			if(!maybeInliers.includes(data[l])){
				var dist = Math.abs(maybeModel[0]*data[l][0] + maybeModel[1]*data[l][1]+maybeModel[2]*data[l][2]+maybeModel[3])/Math.sqrt(Math.pow(maybeModel[0],2)+Math.pow(maybeModel[1],2)+Math.pow(maybeModel[2],2));
				if(dist < t) {
					testSet = data
					alsoInliers.push(data[l])
					thisErr += dist
				}
			}
		}
		
		if(alsoInliers.length > lena) {
			var betterModel = maybeModel;
			if(thisErr < bestErr ) {
				sample = cache;
				bestInliers = alsoInliers
				bestFit = betterModel;
				bestErr = thisErr;
			}
		}
	 if(z%(b/100))
	 	self.postMessage([z,0,0,0]);
	}
	
	var sqrt = Math.sqrt(Math.pow(bestFit[0],2)+Math.pow(bestFit[1],2)+Math.pow(bestFit[2],2))
	var rotz =(dot_product([bestFit[0],bestFit[1],bestFit[2]],[0,0,1])/sqrt)
	var rotx =(dot_product([bestFit[0],bestFit[1],bestFit[2]],[1,0,0])/sqrt)
	var roty= (dot_product([bestFit[0],bestFit[1],bestFit[2]],[0,1,0])/sqrt)
	
	rotx = Math.PI/2 - Math.acos(rotx)
	roty = Math.PI/2 - Math.acos(roty)
	
	//var axHelper = new THREE.AxesHelper(5);
	//scene.add(axHelper)
	
	if(!mainRotX) {	
		//rotx = 0
		//roty = 0
		//points.rotateX(roty)
		self.postMessage([Math.abs(rotx),roty,bestInliers])
	}
	
	var rotmat = [[Math.cos(rotx),0,Math.sin(rotx)],[0,1,0],[-Math.sin(rotx),0,Math.cos(rotx)]]
	var rotmatX = [[1,0,0],[0,Math.cos(roty),-Math.sin(roty)],[0,Math.sin(roty),Math.cos(roty)]]
	var rotmatZ = [[Math.cos(rotz),-Math.sin(rotz),0],[Math.sin(rotz),Math.cos(rotz),0],[0,0,1]]
	var rotated = 1//multiplyMatrices(rotmatX,rotmat)
	rotated = 1//multiplyMatrices(rotated,rotmatZ)
	mainRotX = rotated


	var p1 = [-bestFit[3]/bestFit[0],0,0]
	var p2 = [0,-bestFit[3]/bestFit[1],0]
	var p3 = [0,0,-bestFit[3]/bestFit[2]]

	self.postMessage([p1,p2,p3,0,0]);

	return bestFit// ,bestInliers;
}


var newP;
function runner(points1,matrix) {
	console.log(ransac(points1));
}


self.onmessage = function(event) {
		runner(event.data[0],event.data[1]);
} 

