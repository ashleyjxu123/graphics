var VSHADER_SOURCE =
  'struct Material {\n' +		// Describes one Phong material by its reflectances:
	'		vec3 u_Ke;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
	'		vec3 u_Ka;\n' +			// Ka: ambient reflectance (r,g,b)
	//'		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
	'		vec3 u_Ks;\n' + 		// Ks: specular reflectance (r,g,b)
	'		int u_Kshiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
  '		};\n' +

'struct Lamp {\n' +
  'vec3 u_LampPos;\n' + // Phong Illum: position
  'vec3 u_LampAmbi;\n' + // Phong Illum: ambient
  'vec3 u_LampDiff;\n' + // Phong Illum: diffuse
  'vec3 u_LampSpec;\n' + // Phong Illum: specular
  'float u_LampOn;\n' +
  '};\n' +


  'uniform int shademodev;\n' +
  'uniform int lightmodev;\n' +
  'uniform vec3 u_Kd0; \n' + //  Instead, we'll use this 'uniform' 

 	//-------------ATTRIBUTES of each vertex, read from our Vertex Buffer Object
   'attribute vec4 a_Position; \n' +		// vertex position (model coord sys)
   'attribute vec4 a_Normal; \n' +			// vertex normal vector (model coord sys)

  //-------------UNIFORMS: values set from JavaScript before a drawing command.
  
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  
  'uniform vec3 u_eyePosWorldg;\n' +
  'uniform int v_ATT;\n'+
  'uniform mat4 u_NormalMatrix; \n' + // Inverse Transpose of ModelMatrix;
  'uniform Material materialg0;\n' +
  'uniform Lamp lampg0;\n' +
  'uniform Lamp lampg1;\n' + 

  //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
  'varying mat4 u_MvpMatrix; \n' +
  'varying vec4 v_Position; \n' +
  'varying vec3 v_Normal; \n' +					// Why Vec3? its not a point, hence w==0
  'varying vec3 v_Kd; \n' +             // Phong Lighting: diffuse reflectance
 
  'void main() { \n' +
  
  '  u_MvpMatrix=u_ProjMatrix*u_ViewMatrix*u_ModelMatrix;\n' +
    // Compute CVV coordinate values from our given vertex. This 'built-in'
		// 'varying' value gets interpolated to set screen position for each pixel.
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // Calculate the vertex position & normal vec in the WORLD coordinate system
		// for use as a 'varying' variable: fragment shaders get per-pixel values
		// (interpolated between vertices for our drawing primitive (TRIANGLE)).
  '  v_Position = u_ModelMatrix * a_Position; \n' +
    // 3D surface normal of our vertex, in world coords.  ('varying'--its value
		// gets interpolated (in world coords) for each pixel's fragment shader.
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  
  '  vec3 pointLightDirection0 = lampg0.u_LampPos - v_Position.xyz;\n' +
  '  vec3 pointLightDirection1 = lampg1.u_LampPos - v_Position.xyz;\n' +

  '  float distance0 = length(pointLightDirection0);\n' +
  '  float distance1 = length(pointLightDirection1);\n' +  
  '  float ATT0;\n' +
  '  float ATT1;\n' + 
  '  if(v_ATT==1){\n' +
  '  ATT0 = 1.0;\n' +
  '  ATT1 = 1.0;\n' +
  '  }\n'+
  '  if(v_ATT==2){\n' +
  '     ATT0 = 1.0/(distance0);\n' +
  '     ATT1 = 1.0/(distance1);\n' +
  '  }\n'+
  '  if(v_ATT==3){\n' +
  '     ATT0 = 1.0/(distance0*distance0);\n' +
  '     ATT1 = 1.0/(distance1*distance1);\n' +
  '  }\n'+


  'if(shademodev==0){\n' +
  '  v_Kd = u_Kd0; \n' + // find per-pixel diffuse reflectance from per-vertex
                            // (no per-pixel Ke,Ka, or Ks, but you can do it...)
  '} \n' +
  'if(shademodev==1){ \n' +
 '  vec3 normal = normalize((vec3(u_NormalMatrix * a_Normal))); \n' +
 '  vec4 positon = u_ModelMatrix * a_Position;\n'+

 '  vec3 lightDirection = normalize(lampg0.u_LampPos - positon.xyz); \n' +
 '  vec3 lightDirection1 = normalize(lampg1.u_LampPos - positon.xyz); \n' +

 '  vec3 eyeDirection = normalize(u_eyePosWorldg - positon.xyz); \n' +

 '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
 '  float nDotL1 = max(dot(lightDirection1, normal), 0.0); \n' +

 '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
 '  vec3 H1 = normalize(lightDirection1 + eyeDirection); \n' +

 '  float nDotH = max(dot(H, normal), 0.0); \n' +
 '  float nDotH1 = max(dot(H1, normal), 0.0); \n' +

 '  vec3 BH = reflect(-lightDirection,normal); \n' +
 '  vec3 BH1 = reflect(-lightDirection1,normal); \n' +

 '  float nBDotH = max(dot(BH, eyeDirection), 0.0); \n' +
 '  float nBDotH1 = max(dot(BH1, eyeDirection), 0.0); \n' +
 
 'float e640= 0.0;\n' +
 'if(lightmodev==0){\n' + 
  '   e640 = pow(nDotH, float(materialg0.u_Kshiny)); \n' +
  '}\n' +
  'if(lightmodev==1){\n' + 
  '  e640 = pow(nBDotH, float(materialg0.u_Kshiny)); \n' +
  '}\n' +

  'float e641= 0.0;\n' +
  'if(lightmodev==0){\n' + 
  '   e641 = pow(nDotH1, float(materialg0.u_Kshiny)); \n' +
  '}\n' +
  'if(lightmodev==1){\n' + 
  '  e641 = pow(nBDotH1, float(materialg0.u_Kshiny)); \n' +
  '}\n' +

  // Calculate the final colors
  '  vec3 emissive = materialg0.u_Ke;' +
  '  vec3 ambient = lampg0.u_LampAmbi * materialg0.u_Ka*lampg0.u_LampOn*ATT0+lampg1.u_LampAmbi * materialg0.u_Ka*lampg1.u_LampOn*ATT1;\n' +
  '  vec3 diffuse = lampg0.u_LampDiff * u_Kd0*nDotL*lampg0.u_LampOn*ATT0+lampg1.u_LampDiff * u_Kd0 * nDotL1*lampg1.u_LampOn*ATT1;\n' +
  '  vec3 speculr = lampg0.u_LampSpec * materialg0.u_Ks*e640*lampg0.u_LampOn*ATT0+lampg1.u_LampSpec * materialg0.u_Ks * e641*lampg1.u_LampOn*ATT1;\n' +
  '  v_Kd = diffuse+speculr+emissive+ambient; \n' +

  '} \n' +
  '} \n';

var FSHADER_SOURCE =
  '#ifdef GL_ES \n' +
  'precision mediump float; \n' +
  '#endif \n' +

  'struct Lamp {\n' +
    'vec3 u_LampPos; \n' +
    'vec3 u_LampAmbi;\n' + 
    'vec3 u_LampDiff;\n' + 
    'vec3 u_LampSpec;\n' + 
    'float u_LampOn;\n' +
    '};\n' +

  'struct Material{\n' +
    'vec3 u_Ke;\n' + 
    'vec3 u_Ka;\n' + 
    'vec3 u_Ks;\n' + 
    'int u_Kshiny;\n' + 
    '};\n' +

  //-------------UNIFORMS: values set from JavaScript before a drawing command.
  'uniform Lamp lamp0;\n' +
  'uniform Lamp lamp1;\n' +
  'uniform int lightmodef;\n' +
  'uniform Material material0;\n' +
  'uniform vec3 u_eyePosWorld; \n' + 
  'uniform int shademodef;\n' +
  'uniform int f_ATT;\n'+

  //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_Position;\n' + 
  'varying vec3 v_Kd; \n' + 
  'varying vec4 v_Color;\n' +
  

  'void main() { \n' +

  '  vec3 pointLightDirection0 = lamp0.u_LampPos - v_Position.xyz;\n' +
  '  vec3 pointLightDirection1 = lamp1.u_LampPos - v_Position.xyz;\n' +

  '  float distance0 = length(pointLightDirection0);\n' +
  '  float distance1 = length(pointLightDirection1);\n' +  
  '  float ATT0;\n' +
  '  float ATT1;\n' + 
  '  if(f_ATT==1){\n' +
  '     ATT0 = 1.0;\n' +
  '     ATT1 = 1.0;\n' +
  '  }\n'+
  '  if(f_ATT==2){\n' +
  '     ATT0 = 1.0 / (distance0);\n' +
  '     ATT1 = 1.0 / (distance1);\n' +
  '  }\n'+
  '  if(f_ATT==3){\n' +
  '     ATT0 = 1.0 / (distance0*distance0);\n' +
  '     ATT1 = 1.0 / (distance1*distance1);\n' +
  '  }\n'+

  
  'if(shademodef==0){\n' +
  // Normalize! !!IMPORTANT!! TROUBLE if you don't! 
  // normals interpolated for each pixel aren't 1.0 in length any more!
  '  vec3 normal = normalize(v_Normal); \n' +
  // Calculate the light direction vector, make it unit-length (1.0).
  '  vec3 lightDirection = normalize(lamp0.u_LampPos - v_Position.xyz);\n' +
  // The dot product of the light direction and the normal
     	// (use max() to discard any negatives from lights below the surface)
     	// (look in GLSL manual: what other functions would help?)
  '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
  // The Blinn-Phong lighting model computes the specular term faster 
  	 	// because it replaces the (V*R)^shiny weighting with (H*N)^shiny,
  	 	// where 'halfway' vector H has a direction half-way between L and V"
  	 	// H = norm(norm(V) + norm(L)) 
  	 	// (see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
  '  vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +
  '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
  '  float nDotH = max(dot(H, normal), 0.0); \n' +
  // (use max() to discard any negatives from lights below the surface)
			// Apply the 'shininess' exponent K_e:
  
      
  '  vec3 lightDirection1 = normalize(lamp1.u_LampPos - v_Position.xyz);\n' +
  '  float nDotL1 = max(dot(lightDirection1, normal), 0.0); \n' +
  '  vec3 H1 = normalize(lightDirection1 + eyeDirection); \n' +
  '  float nDotH1 = max(dot(H1, normal), 0.0); \n' +
  '  vec3 BH = reflect(-lightDirection, normal); \n' +
  '  vec3 BH1 = reflect(-lightDirection1, normal); \n' +
  '  float nBDotH = max(dot(BH, eyeDirection), 0.0); \n' +
  '  float nBDotH1 = max(dot(BH1, eyeDirection), 0.0); \n' +
  
  'float e640= 0.0;\n' +
  'if(lightmodef==0){\n' + 
  '   e640 = pow(nDotH, float(material0.u_Kshiny));\n' +
  '}\n' +
  'if(lightmodef==1){\n' + 
  '  e640 = pow(nBDotH, float(material0.u_Kshiny));\n' +
  '}\n' +

  'float e641= 0.0;\n' +
  'if(lightmodef==0){\n' + 
  '   e641 = pow(nDotH1, float(material0.u_Kshiny));\n' +
  '}\n' +
  
  'if(lightmodef==1){\n' + 
  '  e641 = pow(nBDotH1, float(material0.u_Kshiny));\n' +
  '}\n' +
  // Calculate the final colors
  '  vec3 emissive = material0.u_Ke;' +
  '  vec3 ambient = ATT0*lamp0.u_LampAmbi*material0.u_Ka*lamp0.u_LampOn + ATT1*lamp1.u_LampAmbi*material0.u_Ka*lamp1.u_LampOn; \n' +
  '  vec3 diffuse = ATT0*lamp0.u_LampDiff*v_Kd*nDotL*lamp0.u_LampOn + ATT1*lamp1.u_LampDiff*v_Kd*nDotL1*lamp1.u_LampOn; \n' +
  '  vec3 speculr = ATT0*lamp0.u_LampSpec*material0.u_Ks*e640*lamp0.u_LampOn + ATT1*lamp1.u_LampSpec*material0.u_Ks*e641*lamp1.u_LampOn; \n' +
  '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
  '} \n' +
  'if(shademodef==1){\n' +
  '   gl_FragColor=vec4(v_Kd,1.0);\n' +
  '} \n' +
  '} \n';


var canvas;
var gl;
var buffercount;

var u_ModelMatrix;
var u_NormalMatrix;
var u_ViewMatrix;
var u_ProjMatrix;
var u_lightmode;
var u_lightmodeg;
var modelMatrix = new Matrix4();
var normalMatrix = new Matrix4(); 
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var currentAngle = 0;
var ANGLE_STEP = 45;

// For camera:---------------------
var g_EyepointX = 8;
var g_EyepointY = 0;
var g_EyepointZ = 1.5;
var g_Theta = 180;
var g_Tilt = 90;
var g_LookatX = g_EyepointX + Math.cos(g_Theta * Math.PI / 180);
var g_LookatY = g_EyepointY + Math.sin(g_Theta  * Math.PI / 180);
var g_LookatZ = g_EyepointZ + Math.cos(g_Tilt * Math.PI / 180);

// For lighting and shading:---------------------
     // start with worldlight on and headlight on
var worldlight = 1;
var headlight = 1;
     // start with light mode 0 and shade mode 0
var lightmode = 0;
var shademodev = 0;

var u_shademodev;
var u_shademodef;

var v_ATT;
var f_ATT;

function Lamp() {
  this.u_LampPosg;
  this.u_LampAmbig;
  this.u_LampDiffg;
  this.u_LampSpecg;
  this.u_LampPos;
  this.u_LampAmbi;
  this.u_LampDiff;
  this.u_LampSpec;
  this.u_on;
  this.u_ong;
  this.lampPos = new Float32Array(3); 
  this.lampAmbi = new Float32Array(3); 
  this.lampDiff = new Float32Array(3); 
  this.lampSpec = new Float32Array(3); 
  this.on;

  this.addValue = function() {
    gl.uniform3fv(this.u_LampPosg, this.lampPos);
    gl.uniform3fv(this.u_LampAmbig, this.lampAmbi);
    gl.uniform3fv(this.u_LampDiffg, this.lampDiff); 
    gl.uniform3fv(this.u_LampSpecg, this.lampSpec); 
    gl.uniform3fv(this.u_LampPos, this.lampPos);
    gl.uniform3fv(this.u_LampAmbi, this.lampAmbi); 
    gl.uniform3fv(this.u_LampDiff, this.lampDiff); 
    gl.uniform3fv(this.u_LampSpec, this.lampSpec); 
    gl.uniform1f(this.u_on, this.on);
    gl.uniform1f(this.u_ong, this.on);
  }

};
var lampWorld = new Lamp();
var lampHead = new Lamp();
var lampWorldX = 3
var lampWorldY = 3
var lampWorldZ = 10

function makeMaterial() {
  this.u_Ke;
  this.u_Ka;
  this.u_Kd;
  this.u_Ks;
  this.u_Kshiny;
  this.u_Keg;
  this.u_Kag;
  this.u_Ksg;
  this.u_Kshinyg;
};

var setMat = new makeMaterial();

function Material() {
  this.matl_Ke = new Float32Array(3); 
  this.matl_Ka = new Float32Array(3); 
  this.matl_Kd = new Float32Array(3); 
  this.matl_Ks = new Float32Array(3); 
  this.matl_Kshiny = 0.0;
  this.addValue = function(MAT) {
    gl.uniform3fv(MAT.u_Ke, this.matl_Ke); 
    gl.uniform3fv(MAT.u_Ka, this.matl_Ka); 
    gl.uniform3fv(MAT.u_Kd, this.matl_Kd); 
    gl.uniform3fv(MAT.u_Ks, this.matl_Ks); 
    gl.uniform1i(MAT.u_Kshiny, this.matl_Kshiny);
    gl.uniform3fv(MAT.u_Keg, this.matl_Ke); 
    gl.uniform3fv(MAT.u_Kag, this.matl_Ka); 
    gl.uniform3fv(MAT.u_Ksg, this.matl_Ks); 
    gl.uniform1i(MAT.u_Kshinyg, this.matl_Kshiny);
  }
}

var material0 = new Material();
var material1 = new Material();
var material2 = new Material();
var material3 = new Material();
var material4 = new Material();
var material5 = new Material();
var material6 = new Material();
var material7 = new Material();
var material8 = new Material();
var material9 = new Material();
var material10 = new Material();
var material11 = new Material();
var material12 = new Material();
var material13 = new Material();
var material14 = new Material();
var material15 = new Material();


function main() {

  canvas = document.getElementById('webgl');
  
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  buffercount = initVertexBuffers(gl);
  if (buffercount < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
 
  u_shademodev = gl.getUniformLocation(gl.program, 'shademodev');
  u_shademodef = gl.getUniformLocation(gl.program, 'shademodef')
  gl.uniform1i(u_shademodev, shademodev);
  gl.uniform1i(u_shademodef, shademodev);
  //u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
  //u_eyePosWorldg = gl.getUniformLocation(gl.program, 'u_eyePosWorldg');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ModelMatrix || !u_NormalMatrix) {
    console.log('Failed to get uLoc_ matrix storage locations');
    return;
  }
  u_lightmode = gl.getUniformLocation(gl.program, 'lightmodef');
  u_lightmodeg = gl.getUniformLocation(gl.program, 'lightmodev');
  v_ATT=gl.getUniformLocation(gl.program,'v_ATT');
  f_ATT=gl.getUniformLocation(gl.program,'f_ATT');
  gl.uniform1i(v_ATT, 1);
  gl.uniform1i(f_ATT, 1);

  gl.uniform1i(u_lightmode, lightmode);
  gl.uniform1i(u_lightmodeg, lightmode);


  // Set Material
  setMat.u_Ke = gl.getUniformLocation(gl.program, 'material0.u_Ke');
  setMat.u_Ka = gl.getUniformLocation(gl.program, 'material0.u_Ka');
  setMat.u_Kd = gl.getUniformLocation(gl.program, 'u_Kd0');
  setMat.u_Ks = gl.getUniformLocation(gl.program, 'material0.u_Ks');
  setMat.u_Kshiny = gl.getUniformLocation(gl.program, 'material0.u_Kshiny');

  setMat.u_Keg = gl.getUniformLocation(gl.program, 'materialg0.u_Ke');
  setMat.u_Kag = gl.getUniformLocation(gl.program, 'materialg0.u_Ka');
  setMat.u_Ksg = gl.getUniformLocation(gl.program, 'materialg0.u_Ks');
  setMat.u_Kshinyg = gl.getUniformLocation(gl.program, 'materialg0.u_Kshiny');


  // Set Lamps
  // World Light
  lampWorld.u_LampPos = gl.getUniformLocation(gl.program, 'lamp0.u_LampPos');
  lampWorld.u_LampAmbi = gl.getUniformLocation(gl.program, 'lamp0.u_LampAmbi');
  lampWorld.u_LampDiff = gl.getUniformLocation(gl.program, 'lamp0.u_LampDiff');
  lampWorld.u_LampSpec = gl.getUniformLocation(gl.program, 'lamp0.u_LampSpec');
  lampWorld.u_on = gl.getUniformLocation(gl.program, 'lamp0.u_LampOn');

  lampWorld.u_LampPosg = gl.getUniformLocation(gl.program, 'lampg0.u_LampPos');
  lampWorld.u_LampAmbig = gl.getUniformLocation(gl.program, 'lampg0.u_LampAmbi');
  lampWorld.u_LampDiffg = gl.getUniformLocation(gl.program, 'lampg0.u_LampDiff');
  lampWorld.u_LampSpecg = gl.getUniformLocation(gl.program, 'lampg0.u_LampSpec');
  lampWorld.u_on = gl.getUniformLocation(gl.program, 'lamp0.u_LampOn');
  lampWorld.u_ong = gl.getUniformLocation(gl.program, 'lampg0.u_LampOn');

  lampWorld.lampPos.set([lampWorldX, lampWorldY, lampWorldZ]);
  lampWorld.lampAmbi.set([0.4, 0.4, 0.4]);
  lampWorld.lampDiff.set([1.0, 1.0, 1.0]);
  lampWorld.lampSpec.set([1.0, 1.0, 1.0]);
  lampWorld.on = 1;
  lampWorld.addValue();

  // Headlight
  lampHead.u_LampPos = gl.getUniformLocation(gl.program, 'lamp1.u_LampPos');
  lampHead.u_LampAmbi = gl.getUniformLocation(gl.program, 'lamp1.u_LampAmbi');
  lampHead.u_LampDiff = gl.getUniformLocation(gl.program, 'lamp1.u_LampDiff');
  lampHead.u_LampSpec = gl.getUniformLocation(gl.program, 'lamp1.u_LampSpec');
  lampHead.u_on = gl.getUniformLocation(gl.program, 'lamp1.u_LampOn');

  lampHead.u_LampPosg = gl.getUniformLocation(gl.program, 'lampg1.u_LampPos');
  lampHead.u_LampAmbig = gl.getUniformLocation(gl.program, 'lampg1.u_LampAmbi');
  lampHead.u_LampDiffg = gl.getUniformLocation(gl.program, 'lampg1.u_LampDiff');
  lampHead.u_LampSpecg = gl.getUniformLocation(gl.program, 'lampg1.u_LampSpec');
  lampHead.u_on = gl.getUniformLocation(gl.program, 'lamp1.u_LampOn');
  lampHead.u_ong = gl.getUniformLocation(gl.program, 'lampg1.u_LampOn');

  lampHead.lampPos.set([g_EyepointX, g_EyepointY, g_EyepointZ]);
  lampHead.lampAmbi.set([0.4, 0.4, 0.4]);
  lampHead.lampDiff.set([1.0, 1.0, 1.0]);
  lampHead.lampSpec.set([1.0, 1.0, 1.0]);
  if (headlight == 1) {
    lampHead.on = 1;
  } else {
    lampHead.on = 0;
  }
  lampHead.addValue();


  // Taken from materials_Ayerdi04.js - some modifications
  // GOLD_SHINY
  material0.matl_Ke.set([0.0, 0.0, 0.0]);
  material0.matl_Ka.set([0.24725,  0.2245,   0.0645, ]);
  material0.matl_Kd.set([0.34615, 0.3143, 0.0903, ]);
  material0.matl_Ks.set([0.797357, 0.723991, 0.208006, ]);
  material0.matl_Kshiny = 83.2; 

  // PEARL
  material1.matl_Ke.set([0.0,      0.0,      0.0,      ]);
  material1.matl_Ka.set([0.25,     0.20725,  0.20725,  ]);
  material1.matl_Kd.set([0.25 * 2,     0.20725 * 3,  0.20725 * 3,   ]);
  material1.matl_Ks.set([0.296648, 0.296648, 0.296648, ]);
  material1.matl_Kshiny = 83.2; 

  // TURQUOISE
  material2.matl_Ke.set([0.0,      0.0,      0.0,]);
  material2.matl_Ka.set([0.1,      0.18725,  0.1745, ]);
  material2.matl_Kd.set([0.396,    0.74151,  0.69102, ]);
  material2.matl_Ks.set([0.297254, 0.30829,  0.306678, ]);
  material2.matl_Kshiny = 83.2;

 // BLACK
  material3.matl_Ke.set([0.0, 0.0, 0.0]);
  material3.matl_Ka.set([0.0,     0.0,    0.0,  ]);
  material3.matl_Kd.set([0.01,    0.01,   0.01, ]);
  material3.matl_Ks.set([0.5,     0.5,    0.5,  ]);
  material3.matl_Kshiny = 32.0;

  // ORANGE
  material4.matl_Ke.set([0.0, 0.0, 0.0]);
  material4.matl_Ka.set([0.329412, 0.223529, 0.027451, ]);
  material4.matl_Kd.set([0.780392, 0.568627, 0.113725, ]);
  material4.matl_Ks.set([0.992157, 0.941176, 0.807843, ]);
  material4.matl_Kshiny = 83.2;

  // RUBY
  material5.matl_Ke.set([0.0, 0.0, 0.0]);
  material5.matl_Ka.set([0.1745,   0.01175,  0.01175 ]);
  material5.matl_Kd.set([0.61424,  0.04136,  0.04136, ]);
  material5.matl_Ks.set([0.727811, 0.626959, 0.626959,  ]);
  material5.matl_Kshiny = 76.8;
  // BLUE
  material6.matl_Ke.set([0.0, 0.0, 0.0]);
  material6.matl_Ka.set([0.05,    0.05,   0.05, ]);
  material6.matl_Kd.set([0.0,     0.2,    0.6 ]);
  material6.matl_Ks.set([0.1,     0.2,    0.3, ]);
  material6.matl_Kshiny = 60.0;

   // GREEN
   material7.matl_Ke.set([0.0, 0.0, 0.0]);
   material7.matl_Ka.set([0.0,    0.8,   0.0, ]);
   material7.matl_Kd.set([0.0,     0.8,    0.0, ]);
   material7.matl_Ks.set([0.1,     0.8,    0.3, ]);
   material7.matl_Kshiny = 60.0;

  // JADE
  material8.matl_Ke.set([0.0, 0.0, 0.0]);
  material8.matl_Ka.set([0.135,    0.2225,   0.1575, ]);
  material8.matl_Kd.set([0.54,     0.89,     0.63,  ]);
  material8.matl_Ks.set([0.316228, 0.316228, 0.316228, ]);
  material8.matl_Kshiny = 12.8;

  // OBSIDIAN
  material9.matl_Ke.set([0.0, 0.0, 0.0]);
  material9.matl_Ka.set([0.05375,  0.05,     0.06625, ]);
  material9.matl_Kd.set([0.18275,  0.17,     0.22525, ]);
  material9.matl_Ks.set([0.332741, 0.328634, 0.346435, ]);
  material9.matl_Kshiny = 38.4;

  // BRONZE_SHINY
  material10.matl_Ke.set([0.0, 0.0, 0.0]);
  material10.matl_Ka.set([0.25,     0.148,    0.06475, ]);
  material10.matl_Kd.set([0.4,      0.2368,   0.1036,  ]);
  material10.matl_Ks.set([0.774597, 0.458561, 0.200621,  ]);
  material10.matl_Kshiny = 76.8;

  // COPPER_DULL
  material11.matl_Ke.set([0.0, 0.0, 0.0]);
  material11.matl_Ka.set([0.19125,  0.0735,   0.0225, ]);
  material11.matl_Kd.set([0.7038,   0.27048,  0.0828, ]);
  material11.matl_Ks.set([0.256777, 0.137622, 0.086014,  ]);
  material11.matl_Kshiny = 12.8;

  // MYKEYDOWN connect to keys
  document.onkeydown = function(ev) {
  myKeyDown(ev);
  };

  // TICK
  var tick = function() {
      currentAngle = animate(currentAngle);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      drawScene();
      requestAnimationFrame(tick, canvas);
  };
  tick();
  drawResize();
}

function initVertexBuffers(gl) { 
  var sq2	= Math.sqrt(2.0);
  var tetraVerts = new Float32Array([
  
    0.00, 0.00, sq2, 1,		1, 1, 1, 
		0.19, 0.00, 0.00, 1, 	1, 1 ,1, 
		0.0,  0.49, 0.00, 1,	1, 1, 1,
	
		0.00, 0.00, sq2, 1,		1, 1, 1,
		0.0,  0.49, 0.00, 1, 	1, 1, 1,
		-0.19, 0.00, 0.00, 1,	1, 1, 1,
	
		0.00, 0.00, sq2, 1,		1, 1, 1,
		-0.19, 0.00, 0.00, 1,	1, 1, 1,
		0.19, 0.00, 0.00, 1,	1, 1, 1,
	
		-0.19, 0.00, 0.00, 1,	1, 1, 1,
		0.0,  0.49, 0.00, 1,	1, 1, 1,
		0.19, 0.00, 0.00, 1,	1, 1, 1,

  ]);

  makeSphere();
  makeGroundGrid();
 
  mySiz = tetraVerts.length + sphVerts.length + gndVerts.length; 
  var vertices = new Float32Array(mySiz);
  tetraStart = 0;
  for (i = 0, j = 0; j < tetraVerts.length; i++, j++) {
    vertices[i] = tetraVerts[j];
  }
  gndStart = i;
  for (j = 0; j < gndVerts.length; i++, j++) {
    vertices[i] = gndVerts[j];
  }
  sphStart = i;
  for (j = 0; j < sphVerts.length; i++, j++) {
    vertices[i] = sphVerts[j];
  }
  

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the shape buffer object');
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  var FSIZE = vertices.BYTES_PER_ELEMENT;
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * 7, 0);

  gl.enableVertexAttribArray(a_Position);
  var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return -1;
  }
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 7, FSIZE * 4);
  gl.enableVertexAttribArray(a_Normal);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// start the center sphere with material9
var CURRENT_MAT = material9;

// DRAWSCENE set views and lamps then draw all
function drawScene() {

  gl.viewport(0, 0, canvas.width, canvas.height);
 
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  viewMatrix.setLookAt(g_EyepointX, g_EyepointY, g_EyepointZ, 
                      g_LookatX, g_LookatY,  g_LookatZ,
                       0, 0, 1);
  
  lampWorld.lampPos.set([lampWorldX, lampWorldY, lampWorldZ]);
  lampWorld.on = worldlight;
  lampWorld.addValue();

  lampHead.lampPos.set([g_EyepointX, g_EyepointY, g_EyepointZ]);
  lampHead.lampAmbi.set([0.75, 0.75, 0.75]);
  lampHead.lampDiff.set([1.0, 1.0, 1.0]);
  lampHead.lampSpec.set([1.0, 1.0, 1.0]);
  lampHead.on = headlight;
  lampHead.addValue();
  
  gl.uniform1i(u_lightmode, lightmode);
  gl.uniform1i(u_lightmodeg, lightmode);
  gl.uniform1i(u_shademodev, shademodev);
  gl.uniform1i(u_shademodef, shademodev);
  
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  projMatrix.setPerspective(35, canvas.width / canvas.height, 1, 40);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  drawAll();

};
  

// DRAWALL objects
function drawAll() {
  // Ground Grid
  material0.addValue(setMat);

  modelMatrix.setRotate(0, 1, 0, 0);
  modelMatrix.scale(0.2, 0.2, 0.2); // shrink the drawing axes 
  modelMatrix.rotate(90, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.LINES, gndStart / 7, gndVerts.length / 7);

  //Sphere
  material6.addValue(setMat);
  modelMatrix.setTranslate(0, -1.5, 0.6); 
  modelMatrix.scale(0.4, 0.4, 0.4);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / 7, sphVerts.length / 7);
  
  material2.addValue(setMat);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(45 + currentAngle, 1, 0, 0);
  modelMatrix.translate(0, 0, 2.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / 7, sphVerts.length / 7);
 
  material6.addValue(setMat);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(45 + currentAngle, 1, 0, 0);
  modelMatrix.translate(0, 0, 2.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / 7, sphVerts.length / 7);
  
  material2.addValue(setMat);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(currentAngle + 45, 1, 0, 0);
  modelMatrix.translate(0, 0, 2.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / 7, sphVerts.length / 7);

  //Small Foward Sphere
  material2.addValue(setMat);
  modelMatrix.setTranslate(1, -2, 0.2); 
  modelMatrix.scale(0.2, 0.2, 0.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / 7, sphVerts.length / 7);
  
  material6.addValue(setMat);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(45 + currentAngle, 1, 0, 0);
  modelMatrix.translate(0, 0, 2.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / 7, sphVerts.length / 7);
 
  material2.addValue(setMat);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(45 + currentAngle, 1, 0, 0);
  modelMatrix.translate(0, 0, 2.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / 7, sphVerts.length / 7);
  
  material6.addValue(setMat);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(currentAngle + 45, 1, 0, 0);
  modelMatrix.translate(0, 0, 2.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / 7, sphVerts.length / 7);

  // Central Sphere
  CURRENT_MAT.addValue(setMat);
  modelMatrix.setTranslate(0, 0, 0.6); 
  modelMatrix.scale(.6, .6, .6);
  modelMatrix.rotate(currentAngle + 45, 1, 1, 1)
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / 7, sphVerts.length / 7);
  
  // Tetra
  material5.addValue(setMat);
  modelMatrix.setTranslate(0, 2, .2, 0);
  modelMatrix.scale(0.8, 0.8, 0.8);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 12);

  material4.addValue(setMat);
  modelMatrix.translate(0, 0, 1.35);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(45 + currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 12);

  material5.addValue(setMat);
  modelMatrix.translate(0, 0, 1.35);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(45 + currentAngle, 2, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 12);

  // Smaller Forward Tetra
  material4.addValue(setMat);
  modelMatrix.setTranslate(0, 1.5, 0 , 0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 12);

  material5.addValue(setMat);
  modelMatrix.translate(0, 0, 1.35);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(45 + currentAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 12);
  
  material4.addValue(setMat);
  modelMatrix.translate(0, 0, 1.35);
  modelMatrix.scale(0.8, 0.8, 0.8);
  modelMatrix.rotate(45 + currentAngle, 2, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 12);
}


// RESIZE : canvas should fill browser of any size
function drawResize() {
  var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
  canvas.width = innerWidth - xtraMargin;
  canvas.height = (innerHeight* (2/3)) - xtraMargin;
  // IMPORTANT!  Need a fresh drawing in the re-sized viewports.
  drawAll();				// draw in all viewports.
}


var g_last = Date.now();

// CHANGEMATERIAL : change material of central large slowly spinning sphere and redraw
function changeMaterial() {

        if(CURRENT_MAT == material1) 
        {
          CURRENT_MAT = material0
          
          drawAll();
        } else
        if(CURRENT_MAT == material0) 
        {
          CURRENT_MAT = material2
  
          drawAll();
        } else
        if(CURRENT_MAT == material2) 
        {
          CURRENT_MAT = material3
  
          drawAll();
        } else
        if(CURRENT_MAT == material3) 
        {
          CURRENT_MAT = material4

          drawAll();
        } else
        if(CURRENT_MAT == material4) 
        {
          CURRENT_MAT = material5
 
          drawAll();
        }
        else
        if(CURRENT_MAT == material5) 
        {
          CURRENT_MAT = material6

          drawAll();
        }
        
        else
        if(CURRENT_MAT == material6) 
        {
          CURRENT_MAT = material7

          drawAll();
        }
        else
        if(CURRENT_MAT == material7) 
        {
          CURRENT_MAT = material8

          drawAll();
        }
        else
        if(CURRENT_MAT == material8) 
        {
          CURRENT_MAT = material9

          drawAll();
        }
        else
        if(CURRENT_MAT == material9) 
        {
          CURRENT_MAT = material10

          drawAll();
        }
        else
        if(CURRENT_MAT == material10) 
        {
          CURRENT_MAT = material11

          drawAll();
        }
        else
        if(CURRENT_MAT == material11) 
        {
          CURRENT_MAT = material1

          drawAll();
        }
        
}

// ANIMATE : animate angle for rotate
function animate(angle) {
  //==============================================================================
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;    
  
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
  }

  // MYKEYDOWN : keyboard controls
 function myKeyDown(ev) {

  if(ev.keyCode == 77){
  // if m is pressed, change material and redraw (there is also a button for this)
        changeMaterial();
  } else
			
  if(ev.keyCode == 76) { // The L arrow key was pressed
    
      g_Theta  -= 1;
      g_LookatX = g_EyepointX + Math.cos(g_Theta * Math.PI / 180);
      g_LookatY = g_EyepointY + Math.sin(g_Theta * Math.PI / 180);
    } else 
    if (ev.keyCode == 74) { // The J arrow key was pressed
      g_Theta  += 1;
      g_LookatX = g_EyepointX + Math.cos(g_Theta * Math.PI / 180);
      g_LookatY = g_EyepointY + Math.sin(g_Theta * Math.PI / 180);
    } else 
    if (ev.keyCode == 73){  // The I arrow key was pressed
      if (g_Tilt > 0) {
        g_Tilt -= 1;
        g_LookatZ  = g_EyepointZ + Math.cos(g_Tilt * Math.PI / 180);
      }
    } else 
    if (ev.keyCode == 75) { // The K arrow key was pressed
      if (g_Tilt < 180) {
        g_Tilt += 1;
        g_LookatZ  = g_EyepointZ + Math.cos(g_Tilt * Math.PI / 180);
      }
    } else 
    if (ev.keyCode == 65) { // The A arrow key was pressed
      var sintheta = 0.1 * Math.sin(g_Theta * Math.PI / 180);
      var costheta = 0.1 * Math.cos(g_Theta * Math.PI / 180);
      g_EyepointX += sintheta;
      g_EyepointY += costheta;
      g_LookatX += sintheta;
      g_LookatY += costheta;
    } else 
    if (ev.keyCode == 68) { // The D arrow key was pressed
      var sintheta = 0.1 * Math.sin(g_Theta * Math.PI / 180);
      var costheta = 0.1 * Math.cos(g_Theta * Math.PI / 180);
      g_EyepointX -= sintheta;
      g_EyepointY -= costheta;
      g_LookatX -= sintheta;
      g_LookatY -= costheta;
    } else 
    if (ev.keyCode == 87) { // The W arrow key was pressed
      var sintheta = 0.1 * Math.sin(g_Theta * Math.PI / 180);
      var costheta = 0.1 * Math.cos(g_Theta * Math.PI / 180);
      g_EyepointX += costheta;
      g_EyepointY += sintheta;
      g_LookatX += costheta;
      g_LookatY += sintheta;
    }  else 
    if (ev.keyCode == 83) { // The S arrow key was pressed
      var sintheta = 0.1 * Math.sin(g_Theta * Math.PI / 180);
      var costheta = 0.1 * Math.cos(g_Theta * Math.PI / 180);
      g_EyepointX -= costheta;
      g_EyepointY -= sintheta;
      g_LookatX -= costheta;
      g_LookatY -= sintheta;
    }
}

function lampWorldUp() {
  lampWorldY += 1.5;
}
function lampWorldDown() {
  lampWorldY -= 1.5;
}
function lampWorldRight() {
  lampWorldX += 1.5;
}
function lampWorldLeft() {
  lampWorldY -= 1.5;
}
function lampWorldZUp() {
  lampWorldY += 1.5;
}
function lampWorldZDown() {
  lampWorldY -= 1.5;
}

function ATT1 () {
  gl.uniform1i(v_ATT, 1);
  gl.uniform1i(f_ATT, 1);
}

function ATT2 () {
  gl.uniform1i(v_ATT, 2);
  gl.uniform1i(f_ATT, 2);
}

function ATT3 () {
    gl.uniform1i(v_ATT, 3);
    gl.uniform1i(f_ATT, 3);
}

function lightWorld() {
  if (worldlight == 0) {
    worldlight= 1
  } else {
    worldlight = 0
  }
}

function lightHead() {
  if (headlight == 1) {
    headlight = 0;
  } else {
    headlight = 1;
  }
}

function changeLight() {
  if (lightmode == 0) {
    lightmode = 1
  } else {
    lightmode = 0
  }
}

function changeShade() {
  if (shademodev == 0) {
    shademodev = 1
  } else {
    shademodev = 0
  }
}

function setAmbient() {
  var red = document.getElementById('ambient_red').value;
  var green = document.getElementById('ambient_green').value;
  var blue = document.getElementById('ambient_blue').value;
  if (!red || !green || !blue ) {
    alert("Please fill entire row and resumbit.")
  } 
  if (red < 0 || green < 0 || blue < 0 || red > 1 || green > 1 || blue > 1) {
    alert("Please only enter values in range 0.0 to 1.0 and resumbit.")
  }
  else
  {
    lampWorld.lampAmbi.set([red, green, blue]);
  }
}

function setDiffuse() {
  var red = document.getElementById('diffuse_red').value;
  var green = document.getElementById('diffuse_green').value;
  var blue = document.getElementById('diffuse_blue').value;
  if (!red || !green || !blue ) {
    alert("Please fill entire row and resumbit.")
  } 
  if (red < 0 || green < 0 || blue < 0 || red > 1 || green > 1 || blue > 1) {
    alert("Please only enter values in range 0.0 to 1.0 and resumbit.")
  }
  else {
    lampWorld.lampDiff.set([red, green, blue]);
  }
}

function setSpecular() {
  var red = document.getElementById('specular_red').value;
  var green = document.getElementById('specular_green').value;
  var blue = document.getElementById('specular_blue').value;
  if (!red || !green || !blue ) {
    alert("Please fill entire row and resumbit.")
  } 
  if (red < 0 || green < 0 || blue < 0 || red > 1 || green > 1 || blue > 1) {
    alert("Please only enter values in range 0.0 to 1.0 and resumbit.")
  }
  else {
    lampWorld.lampSpec.set([red, green, blue]);
  }
}


// sphVerts from Slack
function makeSphere() {

sphVerts = new Float32Array([
0.0,-1.0,0.0,1.0,-1.306012939612e-06,-0.9999999999991471,7.024692550196524e-18,
0.20318100000000006,-0.96795,0.14761800000000003,1.0,0.21095266289464853,-0.9654061618992498,0.15326420516420788,
-0.07760699999999998,-0.96795,0.23885299999999998,1.0,-0.08057675620781352,-0.9654060832357604,0.2479888723519962,
0.7236069999999999,-0.44721999999999995,0.525725,1.0,0.7236067216830413,-0.4472196513214831,0.5257260653677089,
0.6095470000000001,-0.657519,0.4428559999999999,1.0,0.6042310408008547,-0.6649722006723842,0.43899524105124693,
0.812729,-0.502301,0.2952379999999999,1.0,0.8151848055269568,-0.503817229437447,0.2857305236756347,
0.0,-1.0,0.0,1.0,-1.306012939612e-06,-0.9999999999991471,7.024692550196524e-18,
-0.07760699999999998,-0.96795,0.23885299999999998,1.0,-0.08057675620781352,-0.9654060832357604,0.2479888723519962,
-0.251147,-0.967949,0.0,1.0,-0.26075247981128585,-0.965405688957526,8.4223782992918e-07,
0.0,-1.0,0.0,1.0,-1.306012939612e-06,-0.9999999999991471,7.024692550196524e-18,
-0.251147,-0.967949,0.0,1.0,-0.26075247981128585,-0.965405688957526,8.4223782992918e-07,
-0.07760699999999998,-0.96795,-0.23885299999999998,1.0,-0.08057588379380852,-0.9654061724258667,-0.24798880860410688,
0.0,-1.0,0.0,1.0,-1.306012939612e-06,-0.9999999999991471,7.024692550196524e-18,
-0.07760699999999998,-0.96795,-0.23885299999999998,1.0,-0.08057588379380852,-0.9654061724258667,-0.24798880860410688,
0.20318100000000006,-0.96795,-0.14761800000000003,1.0,0.21095286907952562,-0.9654060533326492,-0.15326460522832558,
0.7236069999999999,-0.44721999999999995,0.525725,1.0,0.7236067216830413,-0.4472196513214831,0.5257260653677089,
0.812729,-0.502301,0.2952379999999999,1.0,0.8151848055269568,-0.503817229437447,0.2857305236756347,
0.860698,-0.251151,0.442858,1.0,0.864986890060841,-0.24306353018273283,0.4389963557001157,
-0.2763880000000001,-0.44721999999999995,0.850649,1.0,-0.27638775259514803,-0.44721995820039745,0.8506492339399584,
-0.02963899999999997,-0.502302,0.8641839999999998,1.0,-0.019838689717257413,-0.5038192559913451,0.8635812548235572,
-0.155215,-0.25115200000000004,0.955422,1.0,-0.15021677729008256,-0.24306351370824936,0.9583084305819194,
-0.894426,-0.44721600000000006,0.0,1.0,-0.8944264388330798,-0.44721509983046726,3.5123469383576465e-18,
-0.831051,-0.502299,0.23885299999999998,1.0,-0.8274488479658778,-0.5038149789897272,0.24798965894876002,
-0.956626,-0.25114900000000007,0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524763,0.1532652367601444,
-0.2763880000000001,-0.44721999999999995,-0.850649,1.0,-0.2763877525951483,-0.44721995820039734,-0.8506492339399583,
-0.48397099999999993,-0.502302,-0.716565,1.0,-0.4915461091474215,-0.5038186497816622,-0.7103162610515219,
-0.43600700000000003,-0.25115200000000004,-0.864188,1.0,-0.4417472320955005,-0.24306420283334987,-0.8635850718006606,
0.7236069999999999,-0.44721999999999995,-0.525725,1.0,0.7236067216830413,-0.4472196513214831,-0.525726065367709,
0.531941,-0.502302,-0.681712,1.0,0.5236579140350146,-0.503818798851909,-0.6869854488938736,
0.6871589999999999,-0.25115200000000004,-0.681715,1.0,0.6848117102472356,-0.2430639714860927,-0.6869882293559796,
0.7236069999999999,-0.44721999999999995,0.525725,1.0,0.7236067216830413,-0.4472196513214831,0.5257260653677089,
0.860698,-0.251151,0.442858,1.0,0.864986890060841,-0.24306353018273283,0.4389963557001157,
0.6871589999999999,-0.25115200000000004,0.6817150000000001,1.0,0.6848111757491196,-0.24306484466307332,0.6869884532203029,
-0.2763880000000001,-0.44721999999999995,0.850649,1.0,-0.27638775259514803,-0.44721995820039745,0.8506492339399584,
-0.155215,-0.25115200000000004,0.955422,1.0,-0.15021677729008256,-0.24306351370824936,0.9583084305819194,
-0.43600700000000003,-0.25115200000000004,0.864188,1.0,-0.4417470436660011,-0.2430638114471244,0.8635852783466985,
-0.894426,-0.44721600000000006,0.0,1.0,-0.8944264388330798,-0.44721509983046726,3.5123469383576465e-18,
-0.956626,-0.25114900000000007,0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524763,0.1532652367601444,
-0.956626,-0.25114900000000007,-0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524766,-0.15326523676014436,
-0.2763880000000001,-0.44721999999999995,-0.850649,1.0,-0.2763877525951483,-0.44721995820039734,-0.8506492339399583,
-0.43600700000000003,-0.25115200000000004,-0.864188,1.0,-0.4417472320955005,-0.24306420283334987,-0.8635850718006606,
-0.155215,-0.25115200000000004,-0.955422,1.0,-0.1502164527684422,-0.24306415178722385,-0.9583083196099383,
0.7236069999999999,-0.44721999999999995,-0.525725,1.0,0.7236067216830413,-0.4472196513214831,-0.525726065367709,
0.6871589999999999,-0.25115200000000004,-0.681715,1.0,0.6848117102472356,-0.2430639714860927,-0.6869882293559796,
0.860698,-0.251151,-0.442858,1.0,0.8649868190167103,-0.2430628154105527,-0.4389968914377966,
0.2763880000000001,0.44721999999999995,0.850649,1.0,0.27638775259514803,0.44721995820039745,0.8506492339399583,
0.48397099999999993,0.502302,0.7165650000000001,1.0,0.4915465997259058,0.5038185159472155,0.7103160164931138,
0.23282200000000008,0.657519,0.7165629999999998,1.0,0.2307912277766018,0.6649729391400707,0.7103142962047043,
-0.723607,0.44721999999999995,0.525725,1.0,-0.7236067216830413,0.4472196513214834,0.5257260653677087,
-0.531941,0.502302,0.6817120000000001,1.0,-0.5236576234680893,0.50381866852951,0.6869857659550921,
-0.609547,0.657519,0.4428559999999999,1.0,-0.6042309075875276,0.6649723338191165,0.4389952227201456,
-0.723607,0.44721999999999995,-0.525725,1.0,-0.7236067216830412,0.44721965132148317,-0.5257260653677089,
-0.812729,0.5023010000000001,-0.295238,1.0,-0.8151846510833863,0.503817580270061,-0.2857303456913146,
-0.609547,0.657519,-0.442856,1.0,-0.6042309075875275,0.6649723338191165,-0.43899522272014574,
0.2763880000000001,0.44721999999999995,-0.850649,1.0,0.27638775259514836,0.44721995820039734,-0.8506492339399583,
0.02963899999999997,0.502302,-0.864184,1.0,0.019838395348954305,0.5038189457553266,-0.8635814425796619,
0.23282200000000008,0.657519,-0.716563,1.0,0.230791227776602,0.6649729391400707,-0.7103142962047043,
0.8944260000000002,0.44721600000000006,0.0,1.0,0.8944264388330799,0.4472150998304671,-7.024693876715296e-18,
0.831051,0.502299,-0.23885299999999998,1.0,0.8274486846864867,0.5038152762710822,-0.24798959979502425,
0.753442,0.6575150000000001,0.0,1.0,0.746871320486886,0.6649685937201661,-3.519020267383579e-18,
0.251147,0.967949,0.0,1.0,0.26075244445654044,0.9654056985070778,0.0,
0.07760699999999998,0.9679500000000001,-0.23885299999999998,1.0,0.0805764015653053,0.9654061629757468,-0.24798867715932643,
0.0,1.0,0.0,1.0,1.3060129397770804e-06,0.9999999999991471,0.0,
0.52573,0.850652,0.0,1.0,0.5257289266852015,0.8506521590206104,-1.057645314374342e-17,
0.3618000000000001,0.8944290000000001,-0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,-0.2675181875552053,
0.251147,0.967949,0.0,1.0,0.26075244445654044,0.9654056985070778,0.0,
0.753442,0.6575150000000001,0.0,1.0,0.746871320486886,0.6649685937201661,-3.519020267383579e-18,
0.6381939999999999,0.7236099999999999,-0.262864,1.0,0.6317479702095651,0.7275492343102217,-0.2675193708700447,
0.52573,0.850652,0.0,1.0,0.5257289266852015,0.8506521590206104,-1.057645314374342e-17,
0.251147,0.967949,0.0,1.0,0.26075244445654044,0.9654056985070778,0.0,
0.3618000000000001,0.8944290000000001,-0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,-0.2675181875552053,
0.07760699999999998,0.9679500000000001,-0.23885299999999998,1.0,0.0805764015653053,0.9654061629757468,-0.24798867715932643,
0.3618000000000001,0.8944290000000001,-0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,-0.2675181875552053,
0.16245599999999993,0.850654,-0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,-0.49999589042931863,
0.07760699999999998,0.9679500000000001,-0.23885299999999998,1.0,0.0805764015653053,0.9654061629757468,-0.24798867715932643,
0.52573,0.850652,0.0,1.0,0.5257289266852015,0.8506521590206104,-1.057645314374342e-17,
0.6381939999999999,0.7236099999999999,-0.262864,1.0,0.6317479702095651,0.7275492343102217,-0.2675193708700447,
0.3618000000000001,0.8944290000000001,-0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,-0.2675181875552053,
0.6381939999999999,0.7236099999999999,-0.262864,1.0,0.6317479702095651,0.7275492343102217,-0.2675193708700447,
0.44720899999999997,0.7236120000000001,-0.525728,1.0,0.44964377423881924,0.7275512992269764,-0.5181598047720494,
0.3618000000000001,0.8944290000000001,-0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,-0.2675181875552053,
0.3618000000000001,0.8944290000000001,-0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,-0.2675181875552053,
0.44720899999999997,0.7236120000000001,-0.525728,1.0,0.44964377423881924,0.7275512992269764,-0.5181598047720494,
0.16245599999999993,0.850654,-0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,-0.49999589042931863,
0.44720899999999997,0.7236120000000001,-0.525728,1.0,0.44964377423881924,0.7275512992269764,-0.5181598047720494,
0.23282200000000008,0.657519,-0.716563,1.0,0.230791227776602,0.6649729391400707,-0.7103142962047043,
0.16245599999999993,0.850654,-0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,-0.49999589042931863,
0.753442,0.6575150000000001,0.0,1.0,0.746871320486886,0.6649685937201661,-3.519020267383579e-18,
0.831051,0.502299,-0.23885299999999998,1.0,0.8274486846864867,0.5038152762710822,-0.24798959979502425,
0.6381939999999999,0.7236099999999999,-0.262864,1.0,0.6317479702095651,0.7275492343102217,-0.2675193708700447,
0.831051,0.502299,-0.23885299999999998,1.0,0.8274486846864867,0.5038152762710822,-0.24798959979502425,
0.6881889999999999,0.525736,-0.499997,1.0,0.688189315323338,0.5257353070007666,-0.49999785324299634,
0.6381939999999999,0.7236099999999999,-0.262864,1.0,0.6317479702095651,0.7275492343102217,-0.2675193708700447,
0.6381939999999999,0.7236099999999999,-0.262864,1.0,0.6317479702095651,0.7275492343102217,-0.2675193708700447,
0.6881889999999999,0.525736,-0.499997,1.0,0.688189315323338,0.5257353070007666,-0.49999785324299634,
0.44720899999999997,0.7236120000000001,-0.525728,1.0,0.44964377423881924,0.7275512992269764,-0.5181598047720494,
0.6881889999999999,0.525736,-0.499997,1.0,0.688189315323338,0.5257353070007666,-0.49999785324299634,
0.48397099999999993,0.502302,-0.716565,1.0,0.4915463260698537,0.5038187053981455,-0.7103160714908299,
0.44720899999999997,0.7236120000000001,-0.525728,1.0,0.44964377423881924,0.7275512992269764,-0.5181598047720494,
0.44720899999999997,0.7236120000000001,-0.525728,1.0,0.44964377423881924,0.7275512992269764,-0.5181598047720494,
0.48397099999999993,0.502302,-0.716565,1.0,0.4915463260698537,0.5038187053981455,-0.7103160714908299,
0.23282200000000008,0.657519,-0.716563,1.0,0.230791227776602,0.6649729391400707,-0.7103142962047043,
0.48397099999999993,0.502302,-0.716565,1.0,0.4915463260698537,0.5038187053981455,-0.7103160714908299,
0.2763880000000001,0.44721999999999995,-0.850649,1.0,0.27638775259514836,0.44721995820039734,-0.8506492339399583,
0.23282200000000008,0.657519,-0.716563,1.0,0.230791227776602,0.6649729391400707,-0.7103142962047043,
0.07760699999999998,0.9679500000000001,-0.23885299999999998,1.0,0.0805764015653053,0.9654061629757468,-0.24798867715932643,
-0.20318100000000006,0.9679500000000001,-0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,-0.15326456386980095,
0.0,1.0,0.0,1.0,1.3060129397770804e-06,0.9999999999991471,0.0,
0.16245599999999993,0.850654,-0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,-0.49999589042931863,
-0.13819700000000001,0.8944299999999998,-0.425319,1.0,-0.14064429309391377,0.8904261866643726,-0.4328514628858925,
0.07760699999999998,0.9679500000000001,-0.23885299999999998,1.0,0.0805764015653053,0.9654061629757468,-0.24798867715932643,
0.23282200000000008,0.657519,-0.716563,1.0,0.230791227776602,0.6649729391400707,-0.7103142962047043,
-0.052790000000000004,0.7236120000000001,-0.688185,1.0,-0.059207598386989156,0.7275518109725035,-0.6834931035817958,
0.16245599999999993,0.850654,-0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,-0.49999589042931863,
0.07760699999999998,0.9679500000000001,-0.23885299999999998,1.0,0.0805764015653053,0.9654061629757468,-0.24798867715932643,
-0.13819700000000001,0.8944299999999998,-0.425319,1.0,-0.14064429309391377,0.8904261866643726,-0.4328514628858925,
-0.20318100000000006,0.9679500000000001,-0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,-0.15326456386980095,
-0.13819700000000001,0.8944299999999998,-0.425319,1.0,-0.14064429309391377,0.8904261866643726,-0.4328514628858925,
-0.425323,0.850654,-0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570991,-0.3090123785945165,
-0.20318100000000006,0.9679500000000001,-0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,-0.15326456386980095,
0.16245599999999993,0.850654,-0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,-0.49999589042931863,
-0.052790000000000004,0.7236120000000001,-0.688185,1.0,-0.059207598386989156,0.7275518109725035,-0.6834931035817958,
-0.13819700000000001,0.8944299999999998,-0.425319,1.0,-0.14064429309391377,0.8904261866643726,-0.4328514628858925,
-0.052790000000000004,0.7236120000000001,-0.688185,1.0,-0.059207598386989156,0.7275518109725035,-0.6834931035817958,
-0.361804,0.7236120000000001,-0.587778,1.0,-0.3538539217412299,0.7275517393882928,-0.5877549392233308,
-0.13819700000000001,0.8944299999999998,-0.425319,1.0,-0.14064429309391377,0.8904261866643726,-0.4328514628858925,
-0.13819700000000001,0.8944299999999998,-0.425319,1.0,-0.14064429309391377,0.8904261866643726,-0.4328514628858925,
-0.361804,0.7236120000000001,-0.587778,1.0,-0.3538539217412299,0.7275517393882928,-0.5877549392233308,
-0.425323,0.850654,-0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570991,-0.3090123785945165,
-0.361804,0.7236120000000001,-0.587778,1.0,-0.3538539217412299,0.7275517393882928,-0.5877549392233308,
-0.609547,0.657519,-0.442856,1.0,-0.6042309075875275,0.6649723338191165,-0.43899522272014574,
-0.425323,0.850654,-0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570991,-0.3090123785945165,
0.23282200000000008,0.657519,-0.716563,1.0,0.230791227776602,0.6649729391400707,-0.7103142962047043,
0.02963899999999997,0.502302,-0.864184,1.0,0.019838395348954305,0.5038189457553266,-0.8635814425796619,
-0.052790000000000004,0.7236120000000001,-0.688185,1.0,-0.059207598386989156,0.7275518109725035,-0.6834931035817958,
0.02963899999999997,0.502302,-0.864184,1.0,0.019838395348954305,0.5038189457553266,-0.8635814425796619,
-0.262869,0.525738,-0.809012,1.0,-0.2628688830438233,0.5257372869737825,-0.8090119006619986,
-0.052790000000000004,0.7236120000000001,-0.688185,1.0,-0.059207598386989156,0.7275518109725035,-0.6834931035817958,
-0.052790000000000004,0.7236120000000001,-0.688185,1.0,-0.059207598386989156,0.7275518109725035,-0.6834931035817958,
-0.262869,0.525738,-0.809012,1.0,-0.2628688830438233,0.5257372869737825,-0.8090119006619986,
-0.361804,0.7236120000000001,-0.587778,1.0,-0.3538539217412299,0.7275517393882928,-0.5877549392233308,
-0.262869,0.525738,-0.809012,1.0,-0.2628688830438233,0.5257372869737825,-0.8090119006619986,
-0.531941,0.502302,-0.681712,1.0,-0.5236577408730431,0.5038188776590388,-0.6869855230921009,
-0.361804,0.7236120000000001,-0.587778,1.0,-0.3538539217412299,0.7275517393882928,-0.5877549392233308,
-0.361804,0.7236120000000001,-0.587778,1.0,-0.3538539217412299,0.7275517393882928,-0.5877549392233308,
-0.531941,0.502302,-0.681712,1.0,-0.5236577408730431,0.5038188776590388,-0.6869855230921009,
-0.609547,0.657519,-0.442856,1.0,-0.6042309075875275,0.6649723338191165,-0.43899522272014574,
-0.531941,0.502302,-0.681712,1.0,-0.5236577408730431,0.5038188776590388,-0.6869855230921009,
-0.723607,0.44721999999999995,-0.525725,1.0,-0.7236067216830412,0.44721965132148317,-0.5257260653677089,
-0.609547,0.657519,-0.442856,1.0,-0.6042309075875275,0.6649723338191165,-0.43899522272014574,
-0.20318100000000006,0.9679500000000001,-0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,-0.15326456386980095,
-0.20318100000000006,0.9679500000000001,0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,0.15326456386980092,
0.0,1.0,0.0,1.0,1.3060129397770804e-06,0.9999999999991471,0.0,
-0.425323,0.850654,-0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570991,-0.3090123785945165,
-0.44721,0.8944290000000001,0.0,1.0,-0.4551286493768027,0.8904256917432513,3.526214980202345e-18,
-0.20318100000000006,0.9679500000000001,-0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,-0.15326456386980095,
-0.609547,0.657519,-0.442856,1.0,-0.6042309075875275,0.6649723338191165,-0.43899522272014574,
-0.670817,0.723611,-0.16245699999999996,1.0,-0.6683380216406349,0.7275501061976027,-0.15490362100783547,
-0.425323,0.850654,-0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570991,-0.3090123785945165,
-0.20318100000000006,0.9679500000000001,-0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,-0.15326456386980095,
-0.44721,0.8944290000000001,0.0,1.0,-0.4551286493768027,0.8904256917432513,3.526214980202345e-18,
-0.20318100000000006,0.9679500000000001,0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,0.15326456386980092,
-0.44721,0.8944290000000001,0.0,1.0,-0.4551286493768027,0.8904256917432513,3.526214980202345e-18,
-0.425323,0.850654,0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570992,0.3090123785945165,
-0.20318100000000006,0.9679500000000001,0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,0.15326456386980092,
-0.425323,0.850654,-0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570991,-0.3090123785945165,
-0.670817,0.723611,-0.16245699999999996,1.0,-0.6683380216406349,0.7275501061976027,-0.15490362100783547,
-0.44721,0.8944290000000001,0.0,1.0,-0.4551286493768027,0.8904256917432513,3.526214980202345e-18,
-0.670817,0.723611,-0.16245699999999996,1.0,-0.6683380216406349,0.7275501061976027,-0.15490362100783547,
-0.670817,0.723611,0.16245700000000007,1.0,-0.6683380216406349,0.7275501061976029,0.15490362100783564,
-0.44721,0.8944290000000001,0.0,1.0,-0.4551286493768027,0.8904256917432513,3.526214980202345e-18,
-0.44721,0.8944290000000001,0.0,1.0,-0.4551286493768027,0.8904256917432513,3.526214980202345e-18,
-0.670817,0.723611,0.16245700000000007,1.0,-0.6683380216406349,0.7275501061976029,0.15490362100783564,
-0.425323,0.850654,0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570992,0.3090123785945165,
-0.670817,0.723611,0.16245700000000007,1.0,-0.6683380216406349,0.7275501061976029,0.15490362100783564,
-0.609547,0.657519,0.4428559999999999,1.0,-0.6042309075875276,0.6649723338191165,0.4389952227201456,
-0.425323,0.850654,0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570992,0.3090123785945165,
-0.609547,0.657519,-0.442856,1.0,-0.6042309075875275,0.6649723338191165,-0.43899522272014574,
-0.812729,0.5023010000000001,-0.295238,1.0,-0.8151846510833863,0.503817580270061,-0.2857303456913146,
-0.670817,0.723611,-0.16245699999999996,1.0,-0.6683380216406349,0.7275501061976027,-0.15490362100783547,
-0.812729,0.5023010000000001,-0.295238,1.0,-0.8151846510833863,0.503817580270061,-0.2857303456913146,
-0.850648,0.525736,0.0,1.0,-0.850648504669507,0.5257348395374611,-2.2739670286765194e-07,
-0.670817,0.723611,-0.16245699999999996,1.0,-0.6683380216406349,0.7275501061976027,-0.15490362100783547,
-0.670817,0.723611,-0.16245699999999996,1.0,-0.6683380216406349,0.7275501061976027,-0.15490362100783547,
-0.850648,0.525736,0.0,1.0,-0.850648504669507,0.5257348395374611,-2.2739670286765194e-07,
-0.670817,0.723611,0.16245700000000007,1.0,-0.6683380216406349,0.7275501061976029,0.15490362100783564,
-0.850648,0.525736,0.0,1.0,-0.850648504669507,0.5257348395374611,-2.2739670286765194e-07,
-0.812729,0.5023010000000001,0.2952379999999999,1.0,-0.8151843815554107,0.5038178905016056,0.28573056763082694,
-0.670817,0.723611,0.16245700000000007,1.0,-0.6683380216406349,0.7275501061976029,0.15490362100783564,
-0.670817,0.723611,0.16245700000000007,1.0,-0.6683380216406349,0.7275501061976029,0.15490362100783564,
-0.812729,0.5023010000000001,0.2952379999999999,1.0,-0.8151843815554107,0.5038178905016056,0.28573056763082694,
-0.609547,0.657519,0.4428559999999999,1.0,-0.6042309075875276,0.6649723338191165,0.4389952227201456,
-0.812729,0.5023010000000001,0.2952379999999999,1.0,-0.8151843815554107,0.5038178905016056,0.28573056763082694,
-0.723607,0.44721999999999995,0.525725,1.0,-0.7236067216830413,0.4472196513214834,0.5257260653677087,
-0.609547,0.657519,0.4428559999999999,1.0,-0.6042309075875276,0.6649723338191165,0.4389952227201456,
-0.20318100000000006,0.9679500000000001,0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,0.15326456386980092,
0.07760699999999998,0.9679500000000001,0.23885299999999998,1.0,0.08057640156530528,0.9654061629757468,0.24798867715932643,
0.0,1.0,0.0,1.0,1.3060129397770804e-06,0.9999999999991471,0.0,
-0.425323,0.850654,0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570992,0.3090123785945165,
-0.13819700000000001,0.8944299999999998,0.425319,1.0,-0.1406442930939137,0.8904261866643726,0.4328514628858925,
-0.20318100000000006,0.9679500000000001,0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,0.15326456386980092,
-0.609547,0.657519,0.4428559999999999,1.0,-0.6042309075875276,0.6649723338191165,0.4389952227201456,
-0.361804,0.7236120000000001,0.5877780000000001,1.0,-0.35385392174123004,0.7275517393882929,0.5877549392233307,
-0.425323,0.850654,0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570992,0.3090123785945165,
-0.20318100000000006,0.9679500000000001,0.14761800000000003,1.0,-0.21095224816685468,0.9654061955752871,0.15326456386980092,
-0.13819700000000001,0.8944299999999998,0.425319,1.0,-0.1406442930939137,0.8904261866643726,0.4328514628858925,
0.07760699999999998,0.9679500000000001,0.23885299999999998,1.0,0.08057640156530528,0.9654061629757468,0.24798867715932643,
-0.13819700000000001,0.8944299999999998,0.425319,1.0,-0.1406442930939137,0.8904261866643726,0.4328514628858925,
0.16245599999999993,0.850654,0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,0.49999589042931875,
0.07760699999999998,0.9679500000000001,0.23885299999999998,1.0,0.08057640156530528,0.9654061629757468,0.24798867715932643,
-0.425323,0.850654,0.3090109999999999,1.0,-0.4253228822840165,0.8506537460570992,0.3090123785945165,
-0.361804,0.7236120000000001,0.5877780000000001,1.0,-0.35385392174123004,0.7275517393882929,0.5877549392233307,
-0.13819700000000001,0.8944299999999998,0.425319,1.0,-0.1406442930939137,0.8904261866643726,0.4328514628858925,
-0.361804,0.7236120000000001,0.5877780000000001,1.0,-0.35385392174123004,0.7275517393882929,0.5877549392233307,
-0.052790000000000004,0.7236120000000001,0.688185,1.0,-0.0592075983869889,0.7275518109725035,0.6834931035817959,
-0.13819700000000001,0.8944299999999998,0.425319,1.0,-0.1406442930939137,0.8904261866643726,0.4328514628858925,
-0.13819700000000001,0.8944299999999998,0.425319,1.0,-0.1406442930939137,0.8904261866643726,0.4328514628858925,
-0.052790000000000004,0.7236120000000001,0.688185,1.0,-0.0592075983869889,0.7275518109725035,0.6834931035817959,
0.16245599999999993,0.850654,0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,0.49999589042931875,
-0.052790000000000004,0.7236120000000001,0.688185,1.0,-0.0592075983869889,0.7275518109725035,0.6834931035817959,
0.23282200000000008,0.657519,0.7165629999999998,1.0,0.2307912277766018,0.6649729391400707,0.7103142962047043,
0.16245599999999993,0.850654,0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,0.49999589042931875,
-0.609547,0.657519,0.4428559999999999,1.0,-0.6042309075875276,0.6649723338191165,0.4389952227201456,
-0.531941,0.502302,0.6817120000000001,1.0,-0.5236576234680893,0.50381866852951,0.6869857659550921,
-0.361804,0.7236120000000001,0.5877780000000001,1.0,-0.35385392174123004,0.7275517393882929,0.5877549392233307,
-0.531941,0.502302,0.6817120000000001,1.0,-0.5236576234680893,0.50381866852951,0.6869857659550921,
-0.262869,0.525738,0.8090120000000001,1.0,-0.26286917763817624,0.5257368727147139,0.8090120741472168,
-0.361804,0.7236120000000001,0.5877780000000001,1.0,-0.35385392174123004,0.7275517393882929,0.5877549392233307,
-0.361804,0.7236120000000001,0.5877780000000001,1.0,-0.35385392174123004,0.7275517393882929,0.5877549392233307,
-0.262869,0.525738,0.8090120000000001,1.0,-0.26286917763817624,0.5257368727147139,0.8090120741472168,
-0.052790000000000004,0.7236120000000001,0.688185,1.0,-0.0592075983869889,0.7275518109725035,0.6834931035817959,
-0.262869,0.525738,0.8090120000000001,1.0,-0.26286917763817624,0.5257368727147139,0.8090120741472168,
0.02963899999999997,0.502302,0.8641839999999998,1.0,0.01983839534895446,0.5038189457553266,0.8635814425796619,
-0.052790000000000004,0.7236120000000001,0.688185,1.0,-0.0592075983869889,0.7275518109725035,0.6834931035817959,
-0.052790000000000004,0.7236120000000001,0.688185,1.0,-0.0592075983869889,0.7275518109725035,0.6834931035817959,
0.02963899999999997,0.502302,0.8641839999999998,1.0,0.01983839534895446,0.5038189457553266,0.8635814425796619,
0.23282200000000008,0.657519,0.7165629999999998,1.0,0.2307912277766018,0.6649729391400707,0.7103142962047043,
0.02963899999999997,0.502302,0.8641839999999998,1.0,0.01983839534895446,0.5038189457553266,0.8635814425796619,
0.2763880000000001,0.44721999999999995,0.850649,1.0,0.27638775259514803,0.44721995820039745,0.8506492339399583,
0.23282200000000008,0.657519,0.7165629999999998,1.0,0.2307912277766018,0.6649729391400707,0.7103142962047043,
0.07760699999999998,0.9679500000000001,0.23885299999999998,1.0,0.08057640156530528,0.9654061629757468,0.24798867715932643,
0.251147,0.967949,0.0,1.0,0.26075244445654044,0.9654056985070778,0.0,
0.0,1.0,0.0,1.0,1.3060129397770804e-06,0.9999999999991471,0.0,
0.16245599999999993,0.850654,0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,0.49999589042931875,
0.3618000000000001,0.8944290000000001,0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,0.26751818755520523,
0.07760699999999998,0.9679500000000001,0.23885299999999998,1.0,0.08057640156530528,0.9654061629757468,0.24798867715932643,
0.23282200000000008,0.657519,0.7165629999999998,1.0,0.2307912277766018,0.6649729391400707,0.7103142962047043,
0.44720899999999997,0.7236120000000001,0.525728,1.0,0.4496437742388191,0.7275512992269764,0.5181598047720494,
0.16245599999999993,0.850654,0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,0.49999589042931875,
0.07760699999999998,0.9679500000000001,0.23885299999999998,1.0,0.08057640156530528,0.9654061629757468,0.24798867715932643,
0.3618000000000001,0.8944290000000001,0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,0.26751818755520523,
0.251147,0.967949,0.0,1.0,0.26075244445654044,0.9654056985070778,0.0,
0.3618000000000001,0.8944290000000001,0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,0.26751818755520523,
0.52573,0.850652,0.0,1.0,0.5257289266852015,0.8506521590206104,-1.057645314374342e-17,
0.251147,0.967949,0.0,1.0,0.26075244445654044,0.9654056985070778,0.0,
0.16245599999999993,0.850654,0.49999499999999997,1.0,0.16245637815790648,0.8506538865776185,0.49999589042931875,
0.44720899999999997,0.7236120000000001,0.525728,1.0,0.4496437742388191,0.7275512992269764,0.5181598047720494,
0.3618000000000001,0.8944290000000001,0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,0.26751818755520523,
0.44720899999999997,0.7236120000000001,0.525728,1.0,0.4496437742388191,0.7275512992269764,0.5181598047720494,
0.6381939999999999,0.7236099999999999,0.262864,1.0,0.6317479702095651,0.7275492343102217,0.2675193708700447,
0.3618000000000001,0.8944290000000001,0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,0.26751818755520523,
0.3618000000000001,0.8944290000000001,0.26286300000000007,1.0,0.36820620295749656,0.8904258595923642,0.26751818755520523,
0.6381939999999999,0.7236099999999999,0.262864,1.0,0.6317479702095651,0.7275492343102217,0.2675193708700447,
0.52573,0.850652,0.0,1.0,0.5257289266852015,0.8506521590206104,-1.057645314374342e-17,
0.6381939999999999,0.7236099999999999,0.262864,1.0,0.6317479702095651,0.7275492343102217,0.2675193708700447,
0.753442,0.6575150000000001,0.0,1.0,0.746871320486886,0.6649685937201661,-3.519020267383579e-18,
0.52573,0.850652,0.0,1.0,0.5257289266852015,0.8506521590206104,-1.057645314374342e-17,
0.23282200000000008,0.657519,0.7165629999999998,1.0,0.2307912277766018,0.6649729391400707,0.7103142962047043,
0.48397099999999993,0.502302,0.7165650000000001,1.0,0.4915465997259058,0.5038185159472155,0.7103160164931138,
0.44720899999999997,0.7236120000000001,0.525728,1.0,0.4496437742388191,0.7275512992269764,0.5181598047720494,
0.48397099999999993,0.502302,0.7165650000000001,1.0,0.4915465997259058,0.5038185159472155,0.7103160164931138,
0.6881889999999999,0.525736,0.499997,1.0,0.6881896241859202,0.5257346676673482,0.49999810037193615,
0.44720899999999997,0.7236120000000001,0.525728,1.0,0.4496437742388191,0.7275512992269764,0.5181598047720494,
0.44720899999999997,0.7236120000000001,0.525728,1.0,0.4496437742388191,0.7275512992269764,0.5181598047720494,
0.6881889999999999,0.525736,0.499997,1.0,0.6881896241859202,0.5257346676673482,0.49999810037193615,
0.6381939999999999,0.7236099999999999,0.262864,1.0,0.6317479702095651,0.7275492343102217,0.2675193708700447,
0.6881889999999999,0.525736,0.499997,1.0,0.6881896241859202,0.5257346676673482,0.49999810037193615,
0.831051,0.502299,0.23885299999999998,1.0,0.8274487904509396,0.5038149163054394,0.24798997820359664,
0.6381939999999999,0.7236099999999999,0.262864,1.0,0.6317479702095651,0.7275492343102217,0.2675193708700447,
0.6381939999999999,0.7236099999999999,0.262864,1.0,0.6317479702095651,0.7275492343102217,0.2675193708700447,
0.831051,0.502299,0.23885299999999998,1.0,0.8274487904509396,0.5038149163054394,0.24798997820359664,
0.753442,0.6575150000000001,0.0,1.0,0.746871320486886,0.6649685937201661,-3.519020267383579e-18,
0.831051,0.502299,0.23885299999999998,1.0,0.8274487904509396,0.5038149163054394,0.24798997820359664,
0.8944260000000002,0.44721600000000006,0.0,1.0,0.8944264388330799,0.4472150998304671,-7.024693876715296e-18,
0.753442,0.6575150000000001,0.0,1.0,0.746871320486886,0.6649685937201661,-3.519020267383579e-18,
0.956626,0.25114900000000007,-0.14761800000000003,1.0,0.9578262483355788,0.24306118218022527,-0.15326493309476094,
0.831051,0.502299,-0.23885299999999998,1.0,0.8274486846864867,0.5038152762710822,-0.24798959979502425,
0.8944260000000002,0.44721600000000006,0.0,1.0,0.8944264388330799,0.4472150998304671,-7.024693876715296e-18,
0.951058,0.0,-0.309013,1.0,0.9510575012112954,5.074933413732154e-07,-0.30901396309789836,
0.861804,0.2763960000000001,-0.425322,1.0,0.8593175031254149,0.27241679196618035,-0.43285392487207186,
0.956626,0.25114900000000007,-0.14761800000000003,1.0,0.9578262483355788,0.24306118218022527,-0.15326493309476094,
0.860698,-0.251151,-0.442858,1.0,0.8649868190167103,-0.2430628154105527,-0.4389968914377966,
0.8090190000000002,0.0,-0.587782,1.0,0.8089870842176278,0.008873212629478702,-0.5877594437069411,
0.951058,0.0,-0.309013,1.0,0.9510575012112954,5.074933413732154e-07,-0.30901396309789836,
0.956626,0.25114900000000007,-0.14761800000000003,1.0,0.9578262483355788,0.24306118218022527,-0.15326493309476094,
0.861804,0.2763960000000001,-0.425322,1.0,0.8593175031254149,0.27241679196618035,-0.43285392487207186,
0.831051,0.502299,-0.23885299999999998,1.0,0.8274486846864867,0.5038152762710822,-0.24798959979502425,
0.861804,0.2763960000000001,-0.425322,1.0,0.8593175031254149,0.27241679196618035,-0.43285392487207186,
0.6881889999999999,0.525736,-0.499997,1.0,0.688189315323338,0.5257353070007666,-0.49999785324299634,
0.831051,0.502299,-0.23885299999999998,1.0,0.8274486846864867,0.5038152762710822,-0.24798959979502425,
0.951058,0.0,-0.309013,1.0,0.9510575012112954,5.074933413732154e-07,-0.30901396309789836,
0.8090190000000002,0.0,-0.587782,1.0,0.8089870842176278,0.008873212629478702,-0.5877594437069411,
0.861804,0.2763960000000001,-0.425322,1.0,0.8593175031254149,0.27241679196618035,-0.43285392487207186,
0.8090190000000002,0.0,-0.587782,1.0,0.8089870842176278,0.008873212629478702,-0.5877594437069411,
0.6708210000000001,0.276397,-0.688189,1.0,0.6772151552047805,0.272417935232739,-0.6834969657024793,
0.861804,0.2763960000000001,-0.425322,1.0,0.8593175031254149,0.27241679196618035,-0.43285392487207186,
0.861804,0.2763960000000001,-0.425322,1.0,0.8593175031254149,0.27241679196618035,-0.43285392487207186,
0.6708210000000001,0.276397,-0.688189,1.0,0.6772151552047805,0.272417935232739,-0.6834969657024793,
0.6881889999999999,0.525736,-0.499997,1.0,0.688189315323338,0.5257353070007666,-0.49999785324299634,
0.6708210000000001,0.276397,-0.688189,1.0,0.6772151552047805,0.272417935232739,-0.6834969657024793,
0.48397099999999993,0.502302,-0.716565,1.0,0.4915463260698537,0.5038187053981455,-0.7103160714908299,
0.6881889999999999,0.525736,-0.499997,1.0,0.688189315323338,0.5257353070007666,-0.49999785324299634,
0.860698,-0.251151,-0.442858,1.0,0.8649868190167103,-0.2430628154105527,-0.4389968914377966,
0.6871589999999999,-0.25115200000000004,-0.681715,1.0,0.6848117102472356,-0.2430639714860927,-0.6869882293559796,
0.8090190000000002,0.0,-0.587782,1.0,0.8089870842176278,0.008873212629478702,-0.5877594437069411,
0.6871589999999999,-0.25115200000000004,-0.681715,1.0,0.6848117102472356,-0.2430639714860927,-0.6869882293559796,
0.5877859999999999,0.0,-0.809017,1.0,0.5877858829948915,-2.554691144635855e-08,-0.809016536142442,
0.8090190000000002,0.0,-0.587782,1.0,0.8089870842176278,0.008873212629478702,-0.5877594437069411,
0.8090190000000002,0.0,-0.587782,1.0,0.8089870842176278,0.008873212629478702,-0.5877594437069411,
0.5877859999999999,0.0,-0.809017,1.0,0.5877858829948915,-2.554691144635855e-08,-0.809016536142442,
0.6708210000000001,0.276397,-0.688189,1.0,0.6772151552047805,0.272417935232739,-0.6834969657024793,
0.5877859999999999,0.0,-0.809017,1.0,0.5877858829948915,-2.554691144635855e-08,-0.809016536142442,
0.43600700000000003,0.25115200000000004,-0.864188,1.0,0.44174743584464,0.2430637566759591,-0.8635850931525253,
0.6708210000000001,0.276397,-0.688189,1.0,0.6772151552047805,0.272417935232739,-0.6834969657024793,
0.6708210000000001,0.276397,-0.688189,1.0,0.6772151552047805,0.272417935232739,-0.6834969657024793,
0.43600700000000003,0.25115200000000004,-0.864188,1.0,0.44174743584464,0.2430637566759591,-0.8635850931525253,
0.48397099999999993,0.502302,-0.716565,1.0,0.4915463260698537,0.5038187053981455,-0.7103160714908299,
0.43600700000000003,0.25115200000000004,-0.864188,1.0,0.44174743584464,0.2430637566759591,-0.8635850931525253,
0.2763880000000001,0.44721999999999995,-0.850649,1.0,0.27638775259514836,0.44721995820039734,-0.8506492339399583,
0.48397099999999993,0.502302,-0.716565,1.0,0.4915463260698537,0.5038187053981455,-0.7103160714908299,
0.1552150000000001,0.25115200000000004,-0.955422,1.0,0.15021657377136222,0.24306347133980513,-0.9583084732301164,
0.02963899999999997,0.502302,-0.864184,1.0,0.019838395348954305,0.5038189457553266,-0.8635814425796619,
0.2763880000000001,0.44721999999999995,-0.850649,1.0,0.27638775259514836,0.44721995820039734,-0.8506492339399583,
0.0,0.0,-1.0,1.0,8.386527000463054e-07,1.0350315843348408e-07,-0.999999999999643,
-0.13819899999999996,0.276397,-0.951055,1.0,-0.14612907117205193,0.2724178643965829,-0.9510177715037708,
0.1552150000000001,0.25115200000000004,-0.955422,1.0,0.15021657377136222,0.24306347133980513,-0.9583084732301164,
-0.155215,-0.25115200000000004,-0.955422,1.0,-0.1502164527684422,-0.24306415178722385,-0.9583083196099383,
-0.30901599999999996,0.0,-0.951057,1.0,-0.30900375318742496,0.00887256725174435,-0.9510194309615595,
0.0,0.0,-1.0,1.0,8.386527000463054e-07,1.0350315843348408e-07,-0.999999999999643,
0.1552150000000001,0.25115200000000004,-0.955422,1.0,0.15021657377136222,0.24306347133980513,-0.9583084732301164,
-0.13819899999999996,0.276397,-0.951055,1.0,-0.14612907117205193,0.2724178643965829,-0.9510177715037708,
0.02963899999999997,0.502302,-0.864184,1.0,0.019838395348954305,0.5038189457553266,-0.8635814425796619,
-0.13819899999999996,0.276397,-0.951055,1.0,-0.14612907117205193,0.2724178643965829,-0.9510177715037708,
-0.262869,0.525738,-0.809012,1.0,-0.2628688830438233,0.5257372869737825,-0.8090119006619986,
0.02963899999999997,0.502302,-0.864184,1.0,0.019838395348954305,0.5038189457553266,-0.8635814425796619,
0.0,0.0,-1.0,1.0,8.386527000463054e-07,1.0350315843348408e-07,-0.999999999999643,
-0.30901599999999996,0.0,-0.951057,1.0,-0.30900375318742496,0.00887256725174435,-0.9510194309615595,
-0.13819899999999996,0.276397,-0.951055,1.0,-0.14612907117205193,0.2724178643965829,-0.9510177715037708,
-0.30901599999999996,0.0,-0.951057,1.0,-0.30900375318742496,0.00887256725174435,-0.9510194309615595,
-0.4472149999999999,0.276397,-0.850649,1.0,-0.440777418602302,0.2724181414021976,-0.8552798509758447,
-0.13819899999999996,0.276397,-0.951055,1.0,-0.14612907117205193,0.2724178643965829,-0.9510177715037708,
-0.13819899999999996,0.276397,-0.951055,1.0,-0.14612907117205193,0.2724178643965829,-0.9510177715037708,
-0.4472149999999999,0.276397,-0.850649,1.0,-0.440777418602302,0.2724181414021976,-0.8552798509758447,
-0.262869,0.525738,-0.809012,1.0,-0.2628688830438233,0.5257372869737825,-0.8090119006619986,
-0.4472149999999999,0.276397,-0.850649,1.0,-0.440777418602302,0.2724181414021976,-0.8552798509758447,
-0.531941,0.502302,-0.681712,1.0,-0.5236577408730431,0.5038188776590388,-0.6869855230921009,
-0.262869,0.525738,-0.809012,1.0,-0.2628688830438233,0.5257372869737825,-0.8090119006619986,
-0.155215,-0.25115200000000004,-0.955422,1.0,-0.1502164527684422,-0.24306415178722385,-0.9583083196099383,
-0.43600700000000003,-0.25115200000000004,-0.864188,1.0,-0.4417472320955005,-0.24306420283334987,-0.8635850718006606,
-0.30901599999999996,0.0,-0.951057,1.0,-0.30900375318742496,0.00887256725174435,-0.9510194309615595,
-0.43600700000000003,-0.25115200000000004,-0.864188,1.0,-0.4417472320955005,-0.24306420283334987,-0.8635850718006606,
-0.587786,0.0,-0.809017,1.0,-0.5877863671165282,8.898111888585574e-08,-0.8090161844066818,
-0.30901599999999996,0.0,-0.951057,1.0,-0.30900375318742496,0.00887256725174435,-0.9510194309615595,
-0.30901599999999996,0.0,-0.951057,1.0,-0.30900375318742496,0.00887256725174435,-0.9510194309615595,
-0.587786,0.0,-0.809017,1.0,-0.5877863671165282,8.898111888585574e-08,-0.8090161844066818,
-0.4472149999999999,0.276397,-0.850649,1.0,-0.440777418602302,0.2724181414021976,-0.8552798509758447,
-0.587786,0.0,-0.809017,1.0,-0.5877863671165282,8.898111888585574e-08,-0.8090161844066818,
-0.687159,0.25115200000000004,-0.681715,1.0,-0.6848117463759701,0.2430639454016199,-0.6869882025706792,
-0.4472149999999999,0.276397,-0.850649,1.0,-0.440777418602302,0.2724181414021976,-0.8552798509758447,
-0.4472149999999999,0.276397,-0.850649,1.0,-0.440777418602302,0.2724181414021976,-0.8552798509758447,
-0.687159,0.25115200000000004,-0.681715,1.0,-0.6848117463759701,0.2430639454016199,-0.6869882025706792,
-0.531941,0.502302,-0.681712,1.0,-0.5236577408730431,0.5038188776590388,-0.6869855230921009,
-0.687159,0.25115200000000004,-0.681715,1.0,-0.6848117463759701,0.2430639454016199,-0.6869882025706792,
-0.723607,0.44721999999999995,-0.525725,1.0,-0.7236067216830412,0.44721965132148317,-0.5257260653677089,
-0.531941,0.502302,-0.681712,1.0,-0.5236577408730431,0.5038188776590388,-0.6869855230921009,
-0.860698,0.2511510000000001,-0.442858,1.0,-0.8649868290678857,0.2430624631623782,-0.43899706666505395,
-0.812729,0.5023010000000001,-0.295238,1.0,-0.8151846510833863,0.503817580270061,-0.2857303456913146,
-0.723607,0.44721999999999995,-0.525725,1.0,-0.7236067216830412,0.44721965132148317,-0.5257260653677089,
-0.951058,0.0,-0.309013,1.0,-0.9510573479382253,-7.330831644240639e-07,-0.30901443482816815,
-0.947213,0.2763960000000001,-0.162458,1.0,-0.9496281766536325,0.27241723641349325,-0.15490376176946866,
-0.860698,0.2511510000000001,-0.442858,1.0,-0.8649868290678857,0.2430624631623782,-0.43899706666505395,
-0.956626,-0.25114900000000007,-0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524766,-0.15326523676014436,
-1.0,9.999999999177334e-07,0.0,1.0,-0.999960625461639,0.008873980299981307,-5.7641038767457417e-08,
-0.951058,0.0,-0.309013,1.0,-0.9510573479382253,-7.330831644240639e-07,-0.30901443482816815,
-0.860698,0.2511510000000001,-0.442858,1.0,-0.8649868290678857,0.2430624631623782,-0.43899706666505395,
-0.947213,0.2763960000000001,-0.162458,1.0,-0.9496281766536325,0.27241723641349325,-0.15490376176946866,
-0.812729,0.5023010000000001,-0.295238,1.0,-0.8151846510833863,0.503817580270061,-0.2857303456913146,
-0.947213,0.2763960000000001,-0.162458,1.0,-0.9496281766536325,0.27241723641349325,-0.15490376176946866,
-0.850648,0.525736,0.0,1.0,-0.850648504669507,0.5257348395374611,-2.2739670286765194e-07,
-0.812729,0.5023010000000001,-0.295238,1.0,-0.8151846510833863,0.503817580270061,-0.2857303456913146,
-0.951058,0.0,-0.309013,1.0,-0.9510573479382253,-7.330831644240639e-07,-0.30901443482816815,
-1.0,9.999999999177334e-07,0.0,1.0,-0.999960625461639,0.008873980299981307,-5.7641038767457417e-08,
-0.947213,0.2763960000000001,-0.162458,1.0,-0.9496281766536325,0.27241723641349325,-0.15490376176946866,
-1.0,9.999999999177334e-07,0.0,1.0,-0.999960625461639,0.008873980299981307,-5.7641038767457417e-08,
-0.947213,0.276397,0.162458,1.0,-0.9496280396827057,0.2724178616838374,0.1549035018454631,
-0.947213,0.2763960000000001,-0.162458,1.0,-0.9496281766536325,0.27241723641349325,-0.15490376176946866,
-0.947213,0.2763960000000001,-0.162458,1.0,-0.9496281766536325,0.27241723641349325,-0.15490376176946866,
-0.947213,0.276397,0.162458,1.0,-0.9496280396827057,0.2724178616838374,0.1549035018454631,
-0.850648,0.525736,0.0,1.0,-0.850648504669507,0.5257348395374611,-2.2739670286765194e-07,
-0.947213,0.276397,0.162458,1.0,-0.9496280396827057,0.2724178616838374,0.1549035018454631,
-0.812729,0.5023010000000001,0.2952379999999999,1.0,-0.8151843815554107,0.5038178905016056,0.28573056763082694,
-0.850648,0.525736,0.0,1.0,-0.850648504669507,0.5257348395374611,-2.2739670286765194e-07,
-0.956626,-0.25114900000000007,-0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524766,-0.15326523676014436,
-0.956626,-0.25114900000000007,0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524763,0.1532652367601444,
-1.0,9.999999999177334e-07,0.0,1.0,-0.999960625461639,0.008873980299981307,-5.7641038767457417e-08,
-0.956626,-0.25114900000000007,0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524763,0.1532652367601444,
-0.951058,0.0,0.309013,1.0,-0.951057331086145,-8.671557238488273e-07,0.3090144866936615,
-1.0,9.999999999177334e-07,0.0,1.0,-0.999960625461639,0.008873980299981307,-5.7641038767457417e-08,
-1.0,9.999999999177334e-07,0.0,1.0,-0.999960625461639,0.008873980299981307,-5.7641038767457417e-08,
-0.951058,0.0,0.309013,1.0,-0.951057331086145,-8.671557238488273e-07,0.3090144866936615,
-0.947213,0.276397,0.162458,1.0,-0.9496280396827057,0.2724178616838374,0.1549035018454631,
-0.951058,0.0,0.309013,1.0,-0.951057331086145,-8.671557238488273e-07,0.3090144866936615,
-0.860698,0.2511510000000001,0.442858,1.0,-0.8649867092922593,0.24306239483169045,0.43899734050040895,
-0.947213,0.276397,0.162458,1.0,-0.9496280396827057,0.2724178616838374,0.1549035018454631,
-0.947213,0.276397,0.162458,1.0,-0.9496280396827057,0.2724178616838374,0.1549035018454631,
-0.860698,0.2511510000000001,0.442858,1.0,-0.8649867092922593,0.24306239483169045,0.43899734050040895,
-0.812729,0.5023010000000001,0.2952379999999999,1.0,-0.8151843815554107,0.5038178905016056,0.28573056763082694,
-0.860698,0.2511510000000001,0.442858,1.0,-0.8649867092922593,0.24306239483169045,0.43899734050040895,
-0.723607,0.44721999999999995,0.525725,1.0,-0.7236067216830413,0.4472196513214834,0.5257260653677087,
-0.812729,0.5023010000000001,0.2952379999999999,1.0,-0.8151843815554107,0.5038178905016056,0.28573056763082694,
-0.687159,0.25115200000000004,0.6817150000000001,1.0,-0.6848115755465203,0.24306396103886968,0.6869883673262506,
-0.531941,0.502302,0.6817120000000001,1.0,-0.5236576234680893,0.50381866852951,0.6869857659550921,
-0.723607,0.44721999999999995,0.525725,1.0,-0.7236067216830413,0.4472196513214834,0.5257260653677087,
-0.587786,0.0,0.8090169999999999,1.0,-0.5877858058415312,4.349631417008017e-07,0.8090165921976091,
-0.44721600000000006,0.276397,0.8506480000000001,1.0,-0.440777780043386,0.2724176399428321,0.8552798244247329,
-0.687159,0.25115200000000004,0.6817150000000001,1.0,-0.6848115755465203,0.24306396103886968,0.6869883673262506,
-0.43600700000000003,-0.25115200000000004,0.864188,1.0,-0.4417470436660011,-0.2430638114471244,0.8635852783466985,
-0.309017,-1.0000000000287557e-06,0.9510559999999999,1.0,-0.30900470758363174,0.008872576054985893,0.9510191207779699,
-0.587786,0.0,0.8090169999999999,1.0,-0.5877858058415312,4.349631417008017e-07,0.8090165921976091,
-0.687159,0.25115200000000004,0.6817150000000001,1.0,-0.6848115755465203,0.24306396103886968,0.6869883673262506,
-0.44721600000000006,0.276397,0.8506480000000001,1.0,-0.440777780043386,0.2724176399428321,0.8552798244247329,
-0.531941,0.502302,0.6817120000000001,1.0,-0.5236576234680893,0.50381866852951,0.6869857659550921,
-0.44721600000000006,0.276397,0.8506480000000001,1.0,-0.440777780043386,0.2724176399428321,0.8552798244247329,
-0.262869,0.525738,0.8090120000000001,1.0,-0.26286917763817624,0.5257368727147139,0.8090120741472168,
-0.531941,0.502302,0.6817120000000001,1.0,-0.5236576234680893,0.50381866852951,0.6869857659550921,
-0.587786,0.0,0.8090169999999999,1.0,-0.5877858058415312,4.349631417008017e-07,0.8090165921976091,
-0.309017,-1.0000000000287557e-06,0.9510559999999999,1.0,-0.30900470758363174,0.008872576054985893,0.9510191207779699,
-0.44721600000000006,0.276397,0.8506480000000001,1.0,-0.440777780043386,0.2724176399428321,0.8552798244247329,
-0.309017,-1.0000000000287557e-06,0.9510559999999999,1.0,-0.30900470758363174,0.008872576054985893,0.9510191207779699,
-0.13819899999999996,0.276397,0.951055,1.0,-0.14613018086329244,0.2724171419127992,0.9510178079473188,
-0.44721600000000006,0.276397,0.8506480000000001,1.0,-0.440777780043386,0.2724176399428321,0.8552798244247329,
-0.44721600000000006,0.276397,0.8506480000000001,1.0,-0.440777780043386,0.2724176399428321,0.8552798244247329,
-0.13819899999999996,0.276397,0.951055,1.0,-0.14613018086329244,0.2724171419127992,0.9510178079473188,
-0.262869,0.525738,0.8090120000000001,1.0,-0.26286917763817624,0.5257368727147139,0.8090120741472168,
-0.13819899999999996,0.276397,0.951055,1.0,-0.14613018086329244,0.2724171419127992,0.9510178079473188,
0.02963899999999997,0.502302,0.8641839999999998,1.0,0.01983839534895446,0.5038189457553266,0.8635814425796619,
-0.262869,0.525738,0.8090120000000001,1.0,-0.26286917763817624,0.5257368727147139,0.8090120741472168,
-0.43600700000000003,-0.25115200000000004,0.864188,1.0,-0.4417470436660011,-0.2430638114471244,0.8635852783466985,
-0.155215,-0.25115200000000004,0.955422,1.0,-0.15021677729008256,-0.24306351370824936,0.9583084305819194,
-0.309017,-1.0000000000287557e-06,0.9510559999999999,1.0,-0.30900470758363174,0.008872576054985893,0.9510191207779699,
-0.155215,-0.25115200000000004,0.955422,1.0,-0.15021677729008256,-0.24306351370824936,0.9583084305819194,
0.0,0.0,1.0,1.0,-6.802996438484687e-08,1.7058485892572035e-07,0.9999999999999832,
-0.309017,-1.0000000000287557e-06,0.9510559999999999,1.0,-0.30900470758363174,0.008872576054985893,0.9510191207779699,
-0.309017,-1.0000000000287557e-06,0.9510559999999999,1.0,-0.30900470758363174,0.008872576054985893,0.9510191207779699,
0.0,0.0,1.0,1.0,-6.802996438484687e-08,1.7058485892572035e-07,0.9999999999999832,
-0.13819899999999996,0.276397,0.951055,1.0,-0.14613018086329244,0.2724171419127992,0.9510178079473188,
0.0,0.0,1.0,1.0,-6.802996438484687e-08,1.7058485892572035e-07,0.9999999999999832,
0.1552150000000001,0.25115200000000004,0.955422,1.0,0.15021657377136222,0.24306347133980513,0.9583084732301164,
-0.13819899999999996,0.276397,0.951055,1.0,-0.14613018086329244,0.2724171419127992,0.9510178079473188,
-0.13819899999999996,0.276397,0.951055,1.0,-0.14613018086329244,0.2724171419127992,0.9510178079473188,
0.1552150000000001,0.25115200000000004,0.955422,1.0,0.15021657377136222,0.24306347133980513,0.9583084732301164,
0.02963899999999997,0.502302,0.8641839999999998,1.0,0.01983839534895446,0.5038189457553266,0.8635814425796619,
0.1552150000000001,0.25115200000000004,0.955422,1.0,0.15021657377136222,0.24306347133980513,0.9583084732301164,
0.2763880000000001,0.44721999999999995,0.850649,1.0,0.27638775259514803,0.44721995820039745,0.8506492339399583,
0.02963899999999997,0.502302,0.8641839999999998,1.0,0.01983839534895446,0.5038189457553266,0.8635814425796619,
0.43600700000000003,0.25115200000000004,0.864188,1.0,0.4417474635405354,0.24306379703966605,0.8635850676245875,
0.48397099999999993,0.502302,0.7165650000000001,1.0,0.4915465997259058,0.5038185159472155,0.7103160164931138,
0.2763880000000001,0.44721999999999995,0.850649,1.0,0.27638775259514803,0.44721995820039745,0.8506492339399583,
0.5877859999999999,0.0,0.8090169999999999,1.0,0.5877853232201069,3.613410911975069e-08,0.8090169428429995,
0.67082,0.2763960000000001,0.6881900000000001,1.0,0.6772144971664549,0.27241774977147326,0.6834976916106101,
0.43600700000000003,0.25115200000000004,0.864188,1.0,0.4417474635405354,0.24306379703966605,0.8635850676245875,
0.6871589999999999,-0.25115200000000004,0.6817150000000001,1.0,0.6848111757491196,-0.24306484466307332,0.6869884532203029,
0.8090190000000002,-1.999999999946489e-06,0.5877829999999999,1.0,0.8089866848506967,0.008871945415033243,0.5877600125211242,
0.5877859999999999,0.0,0.8090169999999999,1.0,0.5877853232201069,3.613410911975069e-08,0.8090169428429995,
0.43600700000000003,0.25115200000000004,0.864188,1.0,0.4417474635405354,0.24306379703966605,0.8635850676245875,
0.67082,0.2763960000000001,0.6881900000000001,1.0,0.6772144971664549,0.27241774977147326,0.6834976916106101,
0.48397099999999993,0.502302,0.7165650000000001,1.0,0.4915465997259058,0.5038185159472155,0.7103160164931138,
0.67082,0.2763960000000001,0.6881900000000001,1.0,0.6772144971664549,0.27241774977147326,0.6834976916106101,
0.6881889999999999,0.525736,0.499997,1.0,0.6881896241859202,0.5257346676673482,0.49999810037193615,
0.48397099999999993,0.502302,0.7165650000000001,1.0,0.4915465997259058,0.5038185159472155,0.7103160164931138,
0.5877859999999999,0.0,0.8090169999999999,1.0,0.5877853232201069,3.613410911975069e-08,0.8090169428429995,
0.8090190000000002,-1.999999999946489e-06,0.5877829999999999,1.0,0.8089866848506967,0.008871945415033243,0.5877600125211242,
0.67082,0.2763960000000001,0.6881900000000001,1.0,0.6772144971664549,0.27241774977147326,0.6834976916106101,
0.8090190000000002,-1.999999999946489e-06,0.5877829999999999,1.0,0.8089866848506967,0.008871945415033243,0.5877600125211242,
0.861804,0.27639400000000003,0.4253230000000001,1.0,0.8593173212717677,0.2724158342746917,0.43285488861596255,
0.67082,0.2763960000000001,0.6881900000000001,1.0,0.6772144971664549,0.27241774977147326,0.6834976916106101,
0.67082,0.2763960000000001,0.6881900000000001,1.0,0.6772144971664549,0.27241774977147326,0.6834976916106101,
0.861804,0.27639400000000003,0.4253230000000001,1.0,0.8593173212717677,0.2724158342746917,0.43285488861596255,
0.6881889999999999,0.525736,0.499997,1.0,0.6881896241859202,0.5257346676673482,0.49999810037193615,
0.861804,0.27639400000000003,0.4253230000000001,1.0,0.8593173212717677,0.2724158342746917,0.43285488861596255,
0.831051,0.502299,0.23885299999999998,1.0,0.8274487904509396,0.5038149163054394,0.24798997820359664,
0.6881889999999999,0.525736,0.499997,1.0,0.6881896241859202,0.5257346676673482,0.49999810037193615,
0.6871589999999999,-0.25115200000000004,0.6817150000000001,1.0,0.6848111757491196,-0.24306484466307332,0.6869884532203029,
0.860698,-0.251151,0.442858,1.0,0.864986890060841,-0.24306353018273283,0.4389963557001157,
0.8090190000000002,-1.999999999946489e-06,0.5877829999999999,1.0,0.8089866848506967,0.008871945415033243,0.5877600125211242,
0.860698,-0.251151,0.442858,1.0,0.864986890060841,-0.24306353018273283,0.4389963557001157,
0.951058,0.0,0.309013,1.0,0.9510576790560566,4.844418859218338e-07,0.30901341574156965,
0.8090190000000002,-1.999999999946489e-06,0.5877829999999999,1.0,0.8089866848506967,0.008871945415033243,0.5877600125211242,
0.8090190000000002,-1.999999999946489e-06,0.5877829999999999,1.0,0.8089866848506967,0.008871945415033243,0.5877600125211242,
0.951058,0.0,0.309013,1.0,0.9510576790560566,4.844418859218338e-07,0.30901341574156965,
0.861804,0.27639400000000003,0.4253230000000001,1.0,0.8593173212717677,0.2724158342746917,0.43285488861596255,
0.951058,0.0,0.309013,1.0,0.9510576790560566,4.844418859218338e-07,0.30901341574156965,
0.956626,0.25114900000000007,0.14761800000000003,1.0,0.9578261805030606,0.24306129258052184,0.15326518192989683,
0.861804,0.27639400000000003,0.4253230000000001,1.0,0.8593173212717677,0.2724158342746917,0.43285488861596255,
0.861804,0.27639400000000003,0.4253230000000001,1.0,0.8593173212717677,0.2724158342746917,0.43285488861596255,
0.956626,0.25114900000000007,0.14761800000000003,1.0,0.9578261805030606,0.24306129258052184,0.15326518192989683,
0.831051,0.502299,0.23885299999999998,1.0,0.8274487904509396,0.5038149163054394,0.24798997820359664,
0.956626,0.25114900000000007,0.14761800000000003,1.0,0.9578261805030606,0.24306129258052184,0.15326518192989683,
0.8944260000000002,0.44721600000000006,0.0,1.0,0.8944264388330799,0.4472150998304671,-7.024693876715296e-18,
0.831051,0.502299,0.23885299999999998,1.0,0.8274487904509396,0.5038149163054394,0.24798997820359664,
0.43600700000000003,0.25115200000000004,-0.864188,1.0,0.44174743584464,0.2430637566759591,-0.8635850931525253,
0.1552150000000001,0.25115200000000004,-0.955422,1.0,0.15021657377136222,0.24306347133980513,-0.9583084732301164,
0.2763880000000001,0.44721999999999995,-0.850649,1.0,0.27638775259514836,0.44721995820039734,-0.8506492339399583,
0.5877859999999999,0.0,-0.809017,1.0,0.5877858829948915,-2.554691144635855e-08,-0.809016536142442,
0.3090169999999999,0.0,-0.951056,1.0,0.3090047066659712,-0.008872910630520342,-0.9510191179546391,
0.43600700000000003,0.25115200000000004,-0.864188,1.0,0.44174743584464,0.2430637566759591,-0.8635850931525253,
0.6871589999999999,-0.25115200000000004,-0.681715,1.0,0.6848117102472356,-0.2430639714860927,-0.6869882293559796,
0.44721600000000006,-0.2763979999999999,-0.850648,1.0,0.4407780664296207,-0.27241829131158907,-0.8552794693627569,
0.5877859999999999,0.0,-0.809017,1.0,0.5877858829948915,-2.554691144635855e-08,-0.809016536142442,
0.43600700000000003,0.25115200000000004,-0.864188,1.0,0.44174743584464,0.2430637566759591,-0.8635850931525253,
0.3090169999999999,0.0,-0.951056,1.0,0.3090047066659712,-0.008872910630520342,-0.9510191179546391,
0.1552150000000001,0.25115200000000004,-0.955422,1.0,0.15021657377136222,0.24306347133980513,-0.9583084732301164,
0.3090169999999999,0.0,-0.951056,1.0,0.3090047066659712,-0.008872910630520342,-0.9510191179546391,
0.0,0.0,-1.0,1.0,8.386527000463054e-07,1.0350315843348408e-07,-0.999999999999643,
0.1552150000000001,0.25115200000000004,-0.955422,1.0,0.15021657377136222,0.24306347133980513,-0.9583084732301164,
0.5877859999999999,0.0,-0.809017,1.0,0.5877858829948915,-2.554691144635855e-08,-0.809016536142442,
0.44721600000000006,-0.2763979999999999,-0.850648,1.0,0.4407780664296207,-0.27241829131158907,-0.8552794693627569,
0.3090169999999999,0.0,-0.951056,1.0,0.3090047066659712,-0.008872910630520342,-0.9510191179546391,
0.44721600000000006,-0.2763979999999999,-0.850648,1.0,0.4407780664296207,-0.27241829131158907,-0.8552794693627569,
0.13819899999999996,-0.2763979999999999,-0.951055,1.0,0.14612974047217775,-0.27241779329109583,-0.9510176890299905,
0.3090169999999999,0.0,-0.951056,1.0,0.3090047066659712,-0.008872910630520342,-0.9510191179546391,
0.3090169999999999,0.0,-0.951056,1.0,0.3090047066659712,-0.008872910630520342,-0.9510191179546391,
0.13819899999999996,-0.2763979999999999,-0.951055,1.0,0.14612974047217775,-0.27241779329109583,-0.9510176890299905,
0.0,0.0,-1.0,1.0,8.386527000463054e-07,1.0350315843348408e-07,-0.999999999999643,
0.13819899999999996,-0.2763979999999999,-0.951055,1.0,0.14612974047217775,-0.27241779329109583,-0.9510176890299905,
-0.155215,-0.25115200000000004,-0.955422,1.0,-0.1502164527684422,-0.24306415178722385,-0.9583083196099383,
0.0,0.0,-1.0,1.0,8.386527000463054e-07,1.0350315843348408e-07,-0.999999999999643,
0.6871589999999999,-0.25115200000000004,-0.681715,1.0,0.6848117102472356,-0.2430639714860927,-0.6869882293559796,
0.531941,-0.502302,-0.681712,1.0,0.5236579140350146,-0.503818798851909,-0.6869854488938736,
0.44721600000000006,-0.2763979999999999,-0.850648,1.0,0.4407780664296207,-0.27241829131158907,-0.8552794693627569,
0.531941,-0.502302,-0.681712,1.0,0.5236579140350146,-0.503818798851909,-0.6869854488938736,
0.262869,-0.525738,-0.809012,1.0,0.26286895228372437,-0.5257372320187721,-0.8090119138767345,
0.44721600000000006,-0.2763979999999999,-0.850648,1.0,0.4407780664296207,-0.27241829131158907,-0.8552794693627569,
0.44721600000000006,-0.2763979999999999,-0.850648,1.0,0.4407780664296207,-0.27241829131158907,-0.8552794693627569,
0.262869,-0.525738,-0.809012,1.0,0.26286895228372437,-0.5257372320187721,-0.8090119138767345,
0.13819899999999996,-0.2763979999999999,-0.951055,1.0,0.14612974047217775,-0.27241779329109583,-0.9510176890299905,
0.262869,-0.525738,-0.809012,1.0,0.26286895228372437,-0.5257372320187721,-0.8090119138767345,
-0.02963899999999997,-0.502302,-0.864184,1.0,-0.019838720158978862,-0.5038191057760348,-0.8635813417608618,
0.13819899999999996,-0.2763979999999999,-0.951055,1.0,0.14612974047217775,-0.27241779329109583,-0.9510176890299905,
0.13819899999999996,-0.2763979999999999,-0.951055,1.0,0.14612974047217775,-0.27241779329109583,-0.9510176890299905,
-0.02963899999999997,-0.502302,-0.864184,1.0,-0.019838720158978862,-0.5038191057760348,-0.8635813417608618,
-0.155215,-0.25115200000000004,-0.955422,1.0,-0.1502164527684422,-0.24306415178722385,-0.9583083196099383,
-0.02963899999999997,-0.502302,-0.864184,1.0,-0.019838720158978862,-0.5038191057760348,-0.8635813417608618,
-0.2763880000000001,-0.44721999999999995,-0.850649,1.0,-0.2763877525951483,-0.44721995820039734,-0.8506492339399583,
-0.155215,-0.25115200000000004,-0.955422,1.0,-0.1502164527684422,-0.24306415178722385,-0.9583083196099383,
-0.687159,0.25115200000000004,-0.681715,1.0,-0.6848117463759701,0.2430639454016199,-0.6869882025706792,
-0.860698,0.2511510000000001,-0.442858,1.0,-0.8649868290678857,0.2430624631623782,-0.43899706666505395,
-0.723607,0.44721999999999995,-0.525725,1.0,-0.7236067216830412,0.44721965132148317,-0.5257260653677089,
-0.587786,0.0,-0.809017,1.0,-0.5877863671165282,8.898111888585574e-08,-0.8090161844066818,
-0.809018,0.0,-0.587783,1.0,-0.8089865397400394,-0.008873289185182267,-0.587760191964779,
-0.687159,0.25115200000000004,-0.681715,1.0,-0.6848117463759701,0.2430639454016199,-0.6869882025706792,
-0.43600700000000003,-0.25115200000000004,-0.864188,1.0,-0.4417472320955005,-0.24306420283334987,-0.8635850718006606,
-0.670819,-0.276397,-0.688191,1.0,-0.6772137611074175,-0.2724178575158659,-0.6834983779594587,
-0.587786,0.0,-0.809017,1.0,-0.5877863671165282,8.898111888585574e-08,-0.8090161844066818,
-0.687159,0.25115200000000004,-0.681715,1.0,-0.6848117463759701,0.2430639454016199,-0.6869882025706792,
-0.809018,0.0,-0.587783,1.0,-0.8089865397400394,-0.008873289185182267,-0.587760191964779,
-0.860698,0.2511510000000001,-0.442858,1.0,-0.8649868290678857,0.2430624631623782,-0.43899706666505395,
-0.809018,0.0,-0.587783,1.0,-0.8089865397400394,-0.008873289185182267,-0.587760191964779,
-0.951058,0.0,-0.309013,1.0,-0.9510573479382253,-7.330831644240639e-07,-0.30901443482816815,
-0.860698,0.2511510000000001,-0.442858,1.0,-0.8649868290678857,0.2430624631623782,-0.43899706666505395,
-0.587786,0.0,-0.809017,1.0,-0.5877863671165282,8.898111888585574e-08,-0.8090161844066818,
-0.670819,-0.276397,-0.688191,1.0,-0.6772137611074175,-0.2724178575158659,-0.6834983779594587,
-0.809018,0.0,-0.587783,1.0,-0.8089865397400394,-0.008873289185182267,-0.587760191964779,
-0.670819,-0.276397,-0.688191,1.0,-0.6772137611074175,-0.2724178575158659,-0.6834983779594587,
-0.861803,-0.276396,-0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,-0.43285568883875336,
-0.809018,0.0,-0.587783,1.0,-0.8089865397400394,-0.008873289185182267,-0.587760191964779,
-0.809018,0.0,-0.587783,1.0,-0.8089865397400394,-0.008873289185182267,-0.587760191964779,
-0.861803,-0.276396,-0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,-0.43285568883875336,
-0.951058,0.0,-0.309013,1.0,-0.9510573479382253,-7.330831644240639e-07,-0.30901443482816815,
-0.861803,-0.276396,-0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,-0.43285568883875336,
-0.956626,-0.25114900000000007,-0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524766,-0.15326523676014436,
-0.951058,0.0,-0.309013,1.0,-0.9510573479382253,-7.330831644240639e-07,-0.30901443482816815,
-0.43600700000000003,-0.25115200000000004,-0.864188,1.0,-0.4417472320955005,-0.24306420283334987,-0.8635850718006606,
-0.48397099999999993,-0.502302,-0.716565,1.0,-0.4915461091474215,-0.5038186497816622,-0.7103162610515219,
-0.670819,-0.276397,-0.688191,1.0,-0.6772137611074175,-0.2724178575158659,-0.6834983779594587,
-0.48397099999999993,-0.502302,-0.716565,1.0,-0.4915461091474215,-0.5038186497816622,-0.7103162610515219,
-0.688189,-0.525736,-0.499997,1.0,-0.6881896629138985,-0.5257350598001616,-0.4999976347497809,
-0.670819,-0.276397,-0.688191,1.0,-0.6772137611074175,-0.2724178575158659,-0.6834983779594587,
-0.670819,-0.276397,-0.688191,1.0,-0.6772137611074175,-0.2724178575158659,-0.6834983779594587,
-0.688189,-0.525736,-0.499997,1.0,-0.6881896629138985,-0.5257350598001616,-0.4999976347497809,
-0.861803,-0.276396,-0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,-0.43285568883875336,
-0.688189,-0.525736,-0.499997,1.0,-0.6881896629138985,-0.5257350598001616,-0.4999976347497809,
-0.831051,-0.502299,-0.23885299999999998,1.0,-0.827448675299351,-0.503815221812631,-0.24798974175404667,
-0.861803,-0.276396,-0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,-0.43285568883875336,
-0.861803,-0.276396,-0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,-0.43285568883875336,
-0.831051,-0.502299,-0.23885299999999998,1.0,-0.827448675299351,-0.503815221812631,-0.24798974175404667,
-0.956626,-0.25114900000000007,-0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524766,-0.15326523676014436,
-0.831051,-0.502299,-0.23885299999999998,1.0,-0.827448675299351,-0.503815221812631,-0.24798974175404667,
-0.894426,-0.44721600000000006,0.0,1.0,-0.8944264388330798,-0.44721509983046726,3.5123469383576465e-18,
-0.956626,-0.25114900000000007,-0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524766,-0.15326523676014436,
-0.860698,0.2511510000000001,0.442858,1.0,-0.8649867092922593,0.24306239483169045,0.43899734050040895,
-0.687159,0.25115200000000004,0.6817150000000001,1.0,-0.6848115755465203,0.24306396103886968,0.6869883673262506,
-0.723607,0.44721999999999995,0.525725,1.0,-0.7236067216830413,0.4472196513214834,0.5257260653677087,
-0.951058,0.0,0.309013,1.0,-0.951057331086145,-8.671557238488273e-07,0.3090144866936615,
-0.809018,0.0,0.5877829999999999,1.0,-0.8089865397400394,-0.008873289185182359,0.5877601919647789,
-0.860698,0.2511510000000001,0.442858,1.0,-0.8649867092922593,0.24306239483169045,0.43899734050040895,
-0.956626,-0.25114900000000007,0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524763,0.1532652367601444,
-0.861803,-0.276396,0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,0.43285568883875347,
-0.951058,0.0,0.309013,1.0,-0.951057331086145,-8.671557238488273e-07,0.3090144866936615,
-0.860698,0.2511510000000001,0.442858,1.0,-0.8649867092922593,0.24306239483169045,0.43899734050040895,
-0.809018,0.0,0.5877829999999999,1.0,-0.8089865397400394,-0.008873289185182359,0.5877601919647789,
-0.687159,0.25115200000000004,0.6817150000000001,1.0,-0.6848115755465203,0.24306396103886968,0.6869883673262506,
-0.809018,0.0,0.5877829999999999,1.0,-0.8089865397400394,-0.008873289185182359,0.5877601919647789,
-0.587786,0.0,0.8090169999999999,1.0,-0.5877858058415312,4.349631417008017e-07,0.8090165921976091,
-0.687159,0.25115200000000004,0.6817150000000001,1.0,-0.6848115755465203,0.24306396103886968,0.6869883673262506,
-0.951058,0.0,0.309013,1.0,-0.951057331086145,-8.671557238488273e-07,0.3090144866936615,
-0.861803,-0.276396,0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,0.43285568883875347,
-0.809018,0.0,0.5877829999999999,1.0,-0.8089865397400394,-0.008873289185182359,0.5877601919647789,
-0.861803,-0.276396,0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,0.43285568883875347,
-0.670819,-0.276397,0.688191,1.0,-0.6772137611074175,-0.2724178575158658,0.6834983779594588,
-0.809018,0.0,0.5877829999999999,1.0,-0.8089865397400394,-0.008873289185182359,0.5877601919647789,
-0.809018,0.0,0.5877829999999999,1.0,-0.8089865397400394,-0.008873289185182359,0.5877601919647789,
-0.670819,-0.276397,0.688191,1.0,-0.6772137611074175,-0.2724178575158658,0.6834983779594588,
-0.587786,0.0,0.8090169999999999,1.0,-0.5877858058415312,4.349631417008017e-07,0.8090165921976091,
-0.670819,-0.276397,0.688191,1.0,-0.6772137611074175,-0.2724178575158658,0.6834983779594588,
-0.43600700000000003,-0.25115200000000004,0.864188,1.0,-0.4417470436660011,-0.2430638114471244,0.8635852783466985,
-0.587786,0.0,0.8090169999999999,1.0,-0.5877858058415312,4.349631417008017e-07,0.8090165921976091,
-0.956626,-0.25114900000000007,0.14761800000000003,1.0,-0.9578262170326509,-0.24306111405524763,0.1532652367601444,
-0.831051,-0.502299,0.23885299999999998,1.0,-0.8274488479658778,-0.5038149789897272,0.24798965894876002,
-0.861803,-0.276396,0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,0.43285568883875347,
-0.831051,-0.502299,0.23885299999999998,1.0,-0.8274488479658778,-0.5038149789897272,0.24798965894876002,
-0.688189,-0.525736,0.499997,1.0,-0.6881895511641616,-0.5257349869564159,0.49999786515384953,
-0.861803,-0.276396,0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,0.43285568883875347,
-0.861803,-0.276396,0.42532400000000004,1.0,-0.8593167049440582,-0.2724165069227901,0.43285568883875347,
-0.688189,-0.525736,0.499997,1.0,-0.6881895511641616,-0.5257349869564159,0.49999786515384953,
-0.670819,-0.276397,0.688191,1.0,-0.6772137611074175,-0.2724178575158658,0.6834983779594588,
-0.688189,-0.525736,0.499997,1.0,-0.6881895511641616,-0.5257349869564159,0.49999786515384953,
-0.48397099999999993,-0.502302,0.7165650000000001,1.0,-0.49154612462755637,-0.503818632525199,0.7103162625789089,
-0.670819,-0.276397,0.688191,1.0,-0.6772137611074175,-0.2724178575158658,0.6834983779594588,
-0.670819,-0.276397,0.688191,1.0,-0.6772137611074175,-0.2724178575158658,0.6834983779594588,
-0.48397099999999993,-0.502302,0.7165650000000001,1.0,-0.49154612462755637,-0.503818632525199,0.7103162625789089,
-0.43600700000000003,-0.25115200000000004,0.864188,1.0,-0.4417470436660011,-0.2430638114471244,0.8635852783466985,
-0.48397099999999993,-0.502302,0.7165650000000001,1.0,-0.49154612462755637,-0.503818632525199,0.7103162625789089,
-0.2763880000000001,-0.44721999999999995,0.850649,1.0,-0.27638775259514803,-0.44721995820039745,0.8506492339399584,
-0.43600700000000003,-0.25115200000000004,0.864188,1.0,-0.4417470436660011,-0.2430638114471244,0.8635852783466985,
0.1552150000000001,0.25115200000000004,0.955422,1.0,0.15021657377136222,0.24306347133980513,0.9583084732301164,
0.43600700000000003,0.25115200000000004,0.864188,1.0,0.4417474635405354,0.24306379703966605,0.8635850676245875,
0.2763880000000001,0.44721999999999995,0.850649,1.0,0.27638775259514803,0.44721995820039745,0.8506492339399583,
0.0,0.0,1.0,1.0,-6.802996438484687e-08,1.7058485892572035e-07,0.9999999999999832,
0.3090169999999999,0.0,0.9510559999999999,1.0,0.30900470666597124,-0.008872910630520276,0.9510191179546391,
0.1552150000000001,0.25115200000000004,0.955422,1.0,0.15021657377136222,0.24306347133980513,0.9583084732301164,
-0.155215,-0.25115200000000004,0.955422,1.0,-0.15021677729008256,-0.24306351370824936,0.9583084305819194,
0.13819899999999996,-0.2763979999999999,0.951055,1.0,0.14612974047217758,-0.2724177932910958,0.9510176890299905,
0.0,0.0,1.0,1.0,-6.802996438484687e-08,1.7058485892572035e-07,0.9999999999999832,
0.1552150000000001,0.25115200000000004,0.955422,1.0,0.15021657377136222,0.24306347133980513,0.9583084732301164,
0.3090169999999999,0.0,0.9510559999999999,1.0,0.30900470666597124,-0.008872910630520276,0.9510191179546391,
0.43600700000000003,0.25115200000000004,0.864188,1.0,0.4417474635405354,0.24306379703966605,0.8635850676245875,
0.3090169999999999,0.0,0.9510559999999999,1.0,0.30900470666597124,-0.008872910630520276,0.9510191179546391,
0.5877859999999999,0.0,0.8090169999999999,1.0,0.5877853232201069,3.613410911975069e-08,0.8090169428429995,
0.43600700000000003,0.25115200000000004,0.864188,1.0,0.4417474635405354,0.24306379703966605,0.8635850676245875,
0.0,0.0,1.0,1.0,-6.802996438484687e-08,1.7058485892572035e-07,0.9999999999999832,
0.13819899999999996,-0.2763979999999999,0.951055,1.0,0.14612974047217758,-0.2724177932910958,0.9510176890299905,
0.3090169999999999,0.0,0.9510559999999999,1.0,0.30900470666597124,-0.008872910630520276,0.9510191179546391,
0.13819899999999996,-0.2763979999999999,0.951055,1.0,0.14612974047217758,-0.2724177932910958,0.9510176890299905,
0.44721600000000006,-0.2763979999999999,0.8506480000000001,1.0,0.44077806642962053,-0.27241829131158873,0.8552794693627571,
0.3090169999999999,0.0,0.9510559999999999,1.0,0.30900470666597124,-0.008872910630520276,0.9510191179546391,
0.3090169999999999,0.0,0.9510559999999999,1.0,0.30900470666597124,-0.008872910630520276,0.9510191179546391,
0.44721600000000006,-0.2763979999999999,0.8506480000000001,1.0,0.44077806642962053,-0.27241829131158873,0.8552794693627571,
0.5877859999999999,0.0,0.8090169999999999,1.0,0.5877853232201069,3.613410911975069e-08,0.8090169428429995,
0.44721600000000006,-0.2763979999999999,0.8506480000000001,1.0,0.44077806642962053,-0.27241829131158873,0.8552794693627571,
0.6871589999999999,-0.25115200000000004,0.6817150000000001,1.0,0.6848111757491196,-0.24306484466307332,0.6869884532203029,
0.5877859999999999,0.0,0.8090169999999999,1.0,0.5877853232201069,3.613410911975069e-08,0.8090169428429995,
-0.155215,-0.25115200000000004,0.955422,1.0,-0.15021677729008256,-0.24306351370824936,0.9583084305819194,
-0.02963899999999997,-0.502302,0.8641839999999998,1.0,-0.019838689717257413,-0.5038192559913451,0.8635812548235572,
0.13819899999999996,-0.2763979999999999,0.951055,1.0,0.14612974047217758,-0.2724177932910958,0.9510176890299905,
-0.02963899999999997,-0.502302,0.8641839999999998,1.0,-0.019838689717257413,-0.5038192559913451,0.8635812548235572,
0.262869,-0.525738,0.8090120000000001,1.0,0.26286888259023233,-0.5257372188438393,0.8090119450836976,
0.13819899999999996,-0.2763979999999999,0.951055,1.0,0.14612974047217758,-0.2724177932910958,0.9510176890299905,
0.13819899999999996,-0.2763979999999999,0.951055,1.0,0.14612974047217758,-0.2724177932910958,0.9510176890299905,
0.262869,-0.525738,0.8090120000000001,1.0,0.26286888259023233,-0.5257372188438393,0.8090119450836976,
0.44721600000000006,-0.2763979999999999,0.8506480000000001,1.0,0.44077806642962053,-0.27241829131158873,0.8552794693627571,
0.262869,-0.525738,0.8090120000000001,1.0,0.26286888259023233,-0.5257372188438393,0.8090119450836976,
0.531941,-0.502302,0.6817120000000001,1.0,0.5236580515960895,-0.5038185204865161,0.6869855481837774,
0.44721600000000006,-0.2763979999999999,0.8506480000000001,1.0,0.44077806642962053,-0.27241829131158873,0.8552794693627571,
0.44721600000000006,-0.2763979999999999,0.8506480000000001,1.0,0.44077806642962053,-0.27241829131158873,0.8552794693627571,
0.531941,-0.502302,0.6817120000000001,1.0,0.5236580515960895,-0.5038185204865161,0.6869855481837774,
0.6871589999999999,-0.25115200000000004,0.6817150000000001,1.0,0.6848111757491196,-0.24306484466307332,0.6869884532203029,
0.531941,-0.502302,0.6817120000000001,1.0,0.5236580515960895,-0.5038185204865161,0.6869855481837774,
0.7236069999999999,-0.44721999999999995,0.525725,1.0,0.7236067216830413,-0.4472196513214831,0.5257260653677089,
0.6871589999999999,-0.25115200000000004,0.6817150000000001,1.0,0.6848111757491196,-0.24306484466307332,0.6869884532203029,
0.956626,0.25114900000000007,0.14761800000000003,1.0,0.9578261805030606,0.24306129258052184,0.15326518192989683,
0.956626,0.25114900000000007,-0.14761800000000003,1.0,0.9578262483355788,0.24306118218022527,-0.15326493309476094,
0.8944260000000002,0.44721600000000006,0.0,1.0,0.8944264388330799,0.4472150998304671,-7.024693876715296e-18,
0.951058,0.0,0.309013,1.0,0.9510576790560566,4.844418859218338e-07,0.30901341574156965,
1.0,0.0,0.0,1.0,0.9999606296359095,-0.00887350991183931,0.0,
0.956626,0.25114900000000007,0.14761800000000003,1.0,0.9578261805030606,0.24306129258052184,0.15326518192989683,
0.860698,-0.251151,0.442858,1.0,0.864986890060841,-0.24306353018273283,0.4389963557001157,
0.9472130000000001,-0.276396,0.162458,1.0,0.9496282556409833,-0.27241716831043955,0.15490339730937155,
0.951058,0.0,0.309013,1.0,0.9510576790560566,4.844418859218338e-07,0.30901341574156965,
0.956626,0.25114900000000007,0.14761800000000003,1.0,0.9578261805030606,0.24306129258052184,0.15326518192989683,
1.0,0.0,0.0,1.0,0.9999606296359095,-0.00887350991183931,0.0,
0.956626,0.25114900000000007,-0.14761800000000003,1.0,0.9578262483355788,0.24306118218022527,-0.15326493309476094,
1.0,0.0,0.0,1.0,0.9999606296359095,-0.00887350991183931,0.0,
0.951058,0.0,-0.309013,1.0,0.9510575012112954,5.074933413732154e-07,-0.30901396309789836,
0.956626,0.25114900000000007,-0.14761800000000003,1.0,0.9578262483355788,0.24306118218022527,-0.15326493309476094,
0.951058,0.0,0.309013,1.0,0.9510576790560566,4.844418859218338e-07,0.30901341574156965,
0.9472130000000001,-0.276396,0.162458,1.0,0.9496282556409833,-0.27241716831043955,0.15490339730937155,
1.0,0.0,0.0,1.0,0.9999606296359095,-0.00887350991183931,0.0,
0.9472130000000001,-0.276396,0.162458,1.0,0.9496282556409833,-0.27241716831043955,0.15490339730937155,
0.9472130000000001,-0.276396,-0.162458,1.0,0.9496282556409833,-0.27241716831043955,-0.15490339730937153,
1.0,0.0,0.0,1.0,0.9999606296359095,-0.00887350991183931,0.0,
1.0,0.0,0.0,1.0,0.9999606296359095,-0.00887350991183931,0.0,
0.9472130000000001,-0.276396,-0.162458,1.0,0.9496282556409833,-0.27241716831043955,-0.15490339730937153,
0.951058,0.0,-0.309013,1.0,0.9510575012112954,5.074933413732154e-07,-0.30901396309789836,
0.9472130000000001,-0.276396,-0.162458,1.0,0.9496282556409833,-0.27241716831043955,-0.15490339730937153,
0.860698,-0.251151,-0.442858,1.0,0.8649868190167103,-0.2430628154105527,-0.4389968914377966,
0.951058,0.0,-0.309013,1.0,0.9510575012112954,5.074933413732154e-07,-0.30901396309789836,
0.860698,-0.251151,0.442858,1.0,0.864986890060841,-0.24306353018273283,0.4389963557001157,
0.812729,-0.502301,0.2952379999999999,1.0,0.8151848055269568,-0.503817229437447,0.2857305236756347,
0.9472130000000001,-0.276396,0.162458,1.0,0.9496282556409833,-0.27241716831043955,0.15490339730937155,
0.812729,-0.502301,0.2952379999999999,1.0,0.8151848055269568,-0.503817229437447,0.2857305236756347,
0.8506480000000001,-0.525736,0.0,1.0,0.8506487792762305,-0.5257343952185694,-1.551196823478276e-07,
0.9472130000000001,-0.276396,0.162458,1.0,0.9496282556409833,-0.27241716831043955,0.15490339730937155,
0.9472130000000001,-0.276396,0.162458,1.0,0.9496282556409833,-0.27241716831043955,0.15490339730937155,
0.8506480000000001,-0.525736,0.0,1.0,0.8506487792762305,-0.5257343952185694,-1.551196823478276e-07,
0.9472130000000001,-0.276396,-0.162458,1.0,0.9496282556409833,-0.27241716831043955,-0.15490339730937153,
0.8506480000000001,-0.525736,0.0,1.0,0.8506487792762305,-0.5257343952185694,-1.551196823478276e-07,
0.812729,-0.502301,-0.295238,1.0,0.8151846510833864,-0.5038175802700607,-0.2857303456913148,
0.9472130000000001,-0.276396,-0.162458,1.0,0.9496282556409833,-0.27241716831043955,-0.15490339730937153,
0.9472130000000001,-0.276396,-0.162458,1.0,0.9496282556409833,-0.27241716831043955,-0.15490339730937153,
0.812729,-0.502301,-0.295238,1.0,0.8151846510833864,-0.5038175802700607,-0.2857303456913148,
0.860698,-0.251151,-0.442858,1.0,0.8649868190167103,-0.2430628154105527,-0.4389968914377966,
0.812729,-0.502301,-0.295238,1.0,0.8151846510833864,-0.5038175802700607,-0.2857303456913148,
0.7236069999999999,-0.44721999999999995,-0.525725,1.0,0.7236067216830413,-0.4472196513214831,-0.525726065367709,
0.860698,-0.251151,-0.442858,1.0,0.8649868190167103,-0.2430628154105527,-0.4389968914377966,
0.6095470000000001,-0.657519,-0.442856,1.0,0.60423092704266,-0.6649723365238669,-0.4389951918451463,
0.531941,-0.502302,-0.681712,1.0,0.5236579140350146,-0.503818798851909,-0.6869854488938736,
0.7236069999999999,-0.44721999999999995,-0.525725,1.0,0.7236067216830413,-0.4472196513214831,-0.525726065367709,
0.4253230000000001,-0.850654,-0.3090109999999999,1.0,0.42532286056333185,-0.8506540013904963,-0.3090117056044348,
0.3618030000000001,-0.723612,-0.587779,1.0,0.3538531927575634,-0.727551553663659,-0.5877556080012123,
0.6095470000000001,-0.657519,-0.442856,1.0,0.60423092704266,-0.6649723365238669,-0.4389951918451463,
0.20318100000000006,-0.96795,-0.14761800000000003,1.0,0.21095286907952562,-0.9654060533326492,-0.15326460522832558,
0.1381969999999999,-0.894429,-0.42532100000000006,1.0,0.14064406863988954,-0.890425561238057,-0.4328528223892147,
0.4253230000000001,-0.850654,-0.3090109999999999,1.0,0.42532286056333185,-0.8506540013904963,-0.3090117056044348,
0.6095470000000001,-0.657519,-0.442856,1.0,0.60423092704266,-0.6649723365238669,-0.4389951918451463,
0.3618030000000001,-0.723612,-0.587779,1.0,0.3538531927575634,-0.727551553663659,-0.5877556080012123,
0.531941,-0.502302,-0.681712,1.0,0.5236579140350146,-0.503818798851909,-0.6869854488938736,
0.3618030000000001,-0.723612,-0.587779,1.0,0.3538531927575634,-0.727551553663659,-0.5877556080012123,
0.262869,-0.525738,-0.809012,1.0,0.26286895228372437,-0.5257372320187721,-0.8090119138767345,
0.531941,-0.502302,-0.681712,1.0,0.5236579140350146,-0.503818798851909,-0.6869854488938736,
0.4253230000000001,-0.850654,-0.3090109999999999,1.0,0.42532286056333185,-0.8506540013904963,-0.3090117056044348,
0.1381969999999999,-0.894429,-0.42532100000000006,1.0,0.14064406863988954,-0.890425561238057,-0.4328528223892147,
0.3618030000000001,-0.723612,-0.587779,1.0,0.3538531927575634,-0.727551553663659,-0.5877556080012123,
0.1381969999999999,-0.894429,-0.42532100000000006,1.0,0.14064406863988954,-0.890425561238057,-0.4328528223892147,
0.052788999999999975,-0.723611,-0.688186,1.0,0.05920646379214723,-0.7275510143742654,-0.683494049811852,
0.3618030000000001,-0.723612,-0.587779,1.0,0.3538531927575634,-0.727551553663659,-0.5877556080012123,
0.3618030000000001,-0.723612,-0.587779,1.0,0.3538531927575634,-0.727551553663659,-0.5877556080012123,
0.052788999999999975,-0.723611,-0.688186,1.0,0.05920646379214723,-0.7275510143742654,-0.683494049811852,
0.262869,-0.525738,-0.809012,1.0,0.26286895228372437,-0.5257372320187721,-0.8090119138767345,
0.052788999999999975,-0.723611,-0.688186,1.0,0.05920646379214723,-0.7275510143742654,-0.683494049811852,
-0.02963899999999997,-0.502302,-0.864184,1.0,-0.019838720158978862,-0.5038191057760348,-0.8635813417608618,
0.262869,-0.525738,-0.809012,1.0,0.26286895228372437,-0.5257372320187721,-0.8090119138767345,
0.20318100000000006,-0.96795,-0.14761800000000003,1.0,0.21095286907952562,-0.9654060533326492,-0.15326460522832558,
-0.07760699999999998,-0.96795,-0.23885299999999998,1.0,-0.08057588379380852,-0.9654061724258667,-0.24798880860410688,
0.1381969999999999,-0.894429,-0.42532100000000006,1.0,0.14064406863988954,-0.890425561238057,-0.4328528223892147,
-0.07760699999999998,-0.96795,-0.23885299999999998,1.0,-0.08057588379380852,-0.9654061724258667,-0.24798880860410688,
-0.16245599999999993,-0.850654,-0.49999499999999997,1.0,-0.1624559605874681,-0.8506538252498717,-0.4999961304423903,
0.1381969999999999,-0.894429,-0.42532100000000006,1.0,0.14064406863988954,-0.890425561238057,-0.4328528223892147,
0.1381969999999999,-0.894429,-0.42532100000000006,1.0,0.14064406863988954,-0.890425561238057,-0.4328528223892147,
-0.16245599999999993,-0.850654,-0.49999499999999997,1.0,-0.1624559605874681,-0.8506538252498717,-0.4999961304423903,
0.052788999999999975,-0.723611,-0.688186,1.0,0.05920646379214723,-0.7275510143742654,-0.683494049811852,
-0.16245599999999993,-0.850654,-0.49999499999999997,1.0,-0.1624559605874681,-0.8506538252498717,-0.4999961304423903,
-0.23282199999999997,-0.657519,-0.716563,1.0,-0.23079127648765035,-0.664972933661906,-0.7103142855062675,
0.052788999999999975,-0.723611,-0.688186,1.0,0.05920646379214723,-0.7275510143742654,-0.683494049811852,
0.052788999999999975,-0.723611,-0.688186,1.0,0.05920646379214723,-0.7275510143742654,-0.683494049811852,
-0.23282199999999997,-0.657519,-0.716563,1.0,-0.23079127648765035,-0.664972933661906,-0.7103142855062675,
-0.02963899999999997,-0.502302,-0.864184,1.0,-0.019838720158978862,-0.5038191057760348,-0.8635813417608618,
-0.23282199999999997,-0.657519,-0.716563,1.0,-0.23079127648765035,-0.664972933661906,-0.7103142855062675,
-0.2763880000000001,-0.44721999999999995,-0.850649,1.0,-0.2763877525951483,-0.44721995820039734,-0.8506492339399583,
-0.02963899999999997,-0.502302,-0.864184,1.0,-0.019838720158978862,-0.5038191057760348,-0.8635813417608618,
-0.23282199999999997,-0.657519,-0.716563,1.0,-0.23079127648765035,-0.664972933661906,-0.7103142855062675,
-0.48397099999999993,-0.502302,-0.716565,1.0,-0.4915461091474215,-0.5038186497816622,-0.7103162610515219,
-0.2763880000000001,-0.44721999999999995,-0.850649,1.0,-0.2763877525951483,-0.44721995820039734,-0.8506492339399583,
-0.16245599999999993,-0.850654,-0.49999499999999997,1.0,-0.1624559605874681,-0.8506538252498717,-0.4999961304423903,
-0.447211,-0.723612,-0.525727,1.0,-0.4496452961078909,-0.7275509278708348,-0.5181590055594274,
-0.23282199999999997,-0.657519,-0.716563,1.0,-0.23079127648765035,-0.664972933661906,-0.7103142855062675,
-0.07760699999999998,-0.96795,-0.23885299999999998,1.0,-0.08057588379380852,-0.9654061724258667,-0.24798880860410688,
-0.36180100000000004,-0.894429,-0.26286300000000007,1.0,-0.36820701052687826,-0.8904256400317344,-0.2675178068333686,
-0.16245599999999993,-0.850654,-0.49999499999999997,1.0,-0.1624559605874681,-0.8506538252498717,-0.4999961304423903,
-0.23282199999999997,-0.657519,-0.716563,1.0,-0.23079127648765035,-0.664972933661906,-0.7103142855062675,
-0.447211,-0.723612,-0.525727,1.0,-0.4496452961078909,-0.7275509278708348,-0.5181590055594274,
-0.48397099999999993,-0.502302,-0.716565,1.0,-0.4915461091474215,-0.5038186497816622,-0.7103162610515219,
-0.447211,-0.723612,-0.525727,1.0,-0.4496452961078909,-0.7275509278708348,-0.5181590055594274,
-0.688189,-0.525736,-0.499997,1.0,-0.6881896629138985,-0.5257350598001616,-0.4999976347497809,
-0.48397099999999993,-0.502302,-0.716565,1.0,-0.4915461091474215,-0.5038186497816622,-0.7103162610515219,
-0.16245599999999993,-0.850654,-0.49999499999999997,1.0,-0.1624559605874681,-0.8506538252498717,-0.4999961304423903,
-0.36180100000000004,-0.894429,-0.26286300000000007,1.0,-0.36820701052687826,-0.8904256400317344,-0.2675178068333686,
-0.447211,-0.723612,-0.525727,1.0,-0.4496452961078909,-0.7275509278708348,-0.5181590055594274,
-0.36180100000000004,-0.894429,-0.26286300000000007,1.0,-0.36820701052687826,-0.8904256400317344,-0.2675178068333686,
-0.638195,-0.723609,-0.26286300000000007,1.0,-0.6317494048790507,-0.7275484141008814,-0.2675182135374292,
-0.447211,-0.723612,-0.525727,1.0,-0.4496452961078909,-0.7275509278708348,-0.5181590055594274,
-0.447211,-0.723612,-0.525727,1.0,-0.4496452961078909,-0.7275509278708348,-0.5181590055594274,
-0.638195,-0.723609,-0.26286300000000007,1.0,-0.6317494048790507,-0.7275484141008814,-0.2675182135374292,
-0.688189,-0.525736,-0.499997,1.0,-0.6881896629138985,-0.5257350598001616,-0.4999976347497809,
-0.638195,-0.723609,-0.26286300000000007,1.0,-0.6317494048790507,-0.7275484141008814,-0.2675182135374292,
-0.831051,-0.502299,-0.23885299999999998,1.0,-0.827448675299351,-0.503815221812631,-0.24798974175404667,
-0.688189,-0.525736,-0.499997,1.0,-0.6881896629138985,-0.5257350598001616,-0.4999976347497809,
-0.07760699999999998,-0.96795,-0.23885299999999998,1.0,-0.08057588379380852,-0.9654061724258667,-0.24798880860410688,
-0.251147,-0.967949,0.0,1.0,-0.26075247981128585,-0.965405688957526,8.4223782992918e-07,
-0.36180100000000004,-0.894429,-0.26286300000000007,1.0,-0.36820701052687826,-0.8904256400317344,-0.2675178068333686,
-0.251147,-0.967949,0.0,1.0,-0.26075247981128585,-0.965405688957526,8.4223782992918e-07,
-0.52573,-0.850652,0.0,1.0,-0.5257291351746985,-0.8506520301675546,5.30161602573815e-07,
-0.36180100000000004,-0.894429,-0.26286300000000007,1.0,-0.36820701052687826,-0.8904256400317344,-0.2675178068333686,
-0.36180100000000004,-0.894429,-0.26286300000000007,1.0,-0.36820701052687826,-0.8904256400317344,-0.2675178068333686,
-0.52573,-0.850652,0.0,1.0,-0.5257291351746985,-0.8506520301675546,5.30161602573815e-07,
-0.638195,-0.723609,-0.26286300000000007,1.0,-0.6317494048790507,-0.7275484141008814,-0.2675182135374292,
-0.52573,-0.850652,0.0,1.0,-0.5257291351746985,-0.8506520301675546,5.30161602573815e-07,
-0.753442,-0.657515,0.0,1.0,-0.7468712183386028,-0.6649687084497966,-1.4345962018813593e-07,
-0.638195,-0.723609,-0.26286300000000007,1.0,-0.6317494048790507,-0.7275484141008814,-0.2675182135374292,
-0.638195,-0.723609,-0.26286300000000007,1.0,-0.6317494048790507,-0.7275484141008814,-0.2675182135374292,
-0.753442,-0.657515,0.0,1.0,-0.7468712183386028,-0.6649687084497966,-1.4345962018813593e-07,
-0.831051,-0.502299,-0.23885299999999998,1.0,-0.827448675299351,-0.503815221812631,-0.24798974175404667,
-0.753442,-0.657515,0.0,1.0,-0.7468712183386028,-0.6649687084497966,-1.4345962018813593e-07,
-0.894426,-0.44721600000000006,0.0,1.0,-0.8944264388330798,-0.44721509983046726,3.5123469383576465e-18,
-0.831051,-0.502299,-0.23885299999999998,1.0,-0.827448675299351,-0.503815221812631,-0.24798974175404667,
-0.753442,-0.657515,0.0,1.0,-0.7468712183386028,-0.6649687084497966,-1.4345962018813593e-07,
-0.831051,-0.502299,0.23885299999999998,1.0,-0.8274488479658778,-0.5038149789897272,0.24798965894876002,
-0.894426,-0.44721600000000006,0.0,1.0,-0.8944264388330798,-0.44721509983046726,3.5123469383576465e-18,
-0.52573,-0.850652,0.0,1.0,-0.5257291351746985,-0.8506520301675546,5.30161602573815e-07,
-0.638195,-0.723609,0.262864,1.0,-0.6317485209773642,-0.7275487814839495,0.2675193017412632,
-0.753442,-0.657515,0.0,1.0,-0.7468712183386028,-0.6649687084497966,-1.4345962018813593e-07,
-0.251147,-0.967949,0.0,1.0,-0.26075247981128585,-0.965405688957526,8.4223782992918e-07,
-0.36180100000000004,-0.894428,0.262864,1.0,-0.3682072805368218,-0.8904250916957412,0.26751926031280254,
-0.52573,-0.850652,0.0,1.0,-0.5257291351746985,-0.8506520301675546,5.30161602573815e-07,
-0.753442,-0.657515,0.0,1.0,-0.7468712183386028,-0.6649687084497966,-1.4345962018813593e-07,
-0.638195,-0.723609,0.262864,1.0,-0.6317485209773642,-0.7275487814839495,0.2675193017412632,
-0.831051,-0.502299,0.23885299999999998,1.0,-0.8274488479658778,-0.5038149789897272,0.24798965894876002,
-0.638195,-0.723609,0.262864,1.0,-0.6317485209773642,-0.7275487814839495,0.2675193017412632,
-0.688189,-0.525736,0.499997,1.0,-0.6881895511641616,-0.5257349869564159,0.49999786515384953,
-0.831051,-0.502299,0.23885299999999998,1.0,-0.8274488479658778,-0.5038149789897272,0.24798965894876002,
-0.52573,-0.850652,0.0,1.0,-0.5257291351746985,-0.8506520301675546,5.30161602573815e-07,
-0.36180100000000004,-0.894428,0.262864,1.0,-0.3682072805368218,-0.8904250916957412,0.26751926031280254,
-0.638195,-0.723609,0.262864,1.0,-0.6317485209773642,-0.7275487814839495,0.2675193017412632,
-0.36180100000000004,-0.894428,0.262864,1.0,-0.3682072805368218,-0.8904250916957412,0.26751926031280254,
-0.447211,-0.72361,0.5257290000000001,1.0,-0.44964507698926237,-0.7275501699756488,0.5181602598692076,
-0.638195,-0.723609,0.262864,1.0,-0.6317485209773642,-0.7275487814839495,0.2675193017412632,
-0.638195,-0.723609,0.262864,1.0,-0.6317485209773642,-0.7275487814839495,0.2675193017412632,
-0.447211,-0.72361,0.5257290000000001,1.0,-0.44964507698926237,-0.7275501699756488,0.5181602598692076,
-0.688189,-0.525736,0.499997,1.0,-0.6881895511641616,-0.5257349869564159,0.49999786515384953,
-0.447211,-0.72361,0.5257290000000001,1.0,-0.44964507698926237,-0.7275501699756488,0.5181602598692076,
-0.48397099999999993,-0.502302,0.7165650000000001,1.0,-0.49154612462755637,-0.503818632525199,0.7103162625789089,
-0.688189,-0.525736,0.499997,1.0,-0.6881895511641616,-0.5257349869564159,0.49999786515384953,
-0.251147,-0.967949,0.0,1.0,-0.26075247981128585,-0.965405688957526,8.4223782992918e-07,
-0.07760699999999998,-0.96795,0.23885299999999998,1.0,-0.08057675620781352,-0.9654060832357604,0.2479888723519962,
-0.36180100000000004,-0.894428,0.262864,1.0,-0.3682072805368218,-0.8904250916957412,0.26751926031280254,
-0.07760699999999998,-0.96795,0.23885299999999998,1.0,-0.08057675620781352,-0.9654060832357604,0.2479888723519962,
-0.16245599999999993,-0.850654,0.49999499999999997,1.0,-0.16245708015289456,-0.8506538856343064,0.4999956639446509,
-0.36180100000000004,-0.894428,0.262864,1.0,-0.3682072805368218,-0.8904250916957412,0.26751926031280254,
-0.36180100000000004,-0.894428,0.262864,1.0,-0.3682072805368218,-0.8904250916957412,0.26751926031280254,
-0.16245599999999993,-0.850654,0.49999499999999997,1.0,-0.16245708015289456,-0.8506538856343064,0.4999956639446509,
-0.447211,-0.72361,0.5257290000000001,1.0,-0.44964507698926237,-0.7275501699756488,0.5181602598692076,
-0.16245599999999993,-0.850654,0.49999499999999997,1.0,-0.16245708015289456,-0.8506538856343064,0.4999956639446509,
-0.23282199999999997,-0.657519,0.7165629999999998,1.0,-0.23079124291012987,-0.6649730641972427,0.7103141742131627,
-0.447211,-0.72361,0.5257290000000001,1.0,-0.44964507698926237,-0.7275501699756488,0.5181602598692076,
-0.447211,-0.72361,0.5257290000000001,1.0,-0.44964507698926237,-0.7275501699756488,0.5181602598692076,
-0.23282199999999997,-0.657519,0.7165629999999998,1.0,-0.23079124291012987,-0.6649730641972427,0.7103141742131627,
-0.48397099999999993,-0.502302,0.7165650000000001,1.0,-0.49154612462755637,-0.503818632525199,0.7103162625789089,
-0.23282199999999997,-0.657519,0.7165629999999998,1.0,-0.23079124291012987,-0.6649730641972427,0.7103141742131627,
-0.2763880000000001,-0.44721999999999995,0.850649,1.0,-0.27638775259514803,-0.44721995820039745,0.8506492339399584,
-0.48397099999999993,-0.502302,0.7165650000000001,1.0,-0.49154612462755637,-0.503818632525199,0.7103162625789089,
0.812729,-0.502301,-0.295238,1.0,0.8151846510833864,-0.5038175802700607,-0.2857303456913148,
0.6095470000000001,-0.657519,-0.442856,1.0,0.60423092704266,-0.6649723365238669,-0.4389951918451463,
0.7236069999999999,-0.44721999999999995,-0.525725,1.0,0.7236067216830413,-0.4472196513214831,-0.525726065367709,
0.8506480000000001,-0.525736,0.0,1.0,0.8506487792762305,-0.5257343952185694,-1.551196823478276e-07,
0.670817,-0.723611,-0.16245699999999996,1.0,0.6683377704518599,-0.7275503751292589,-0.15490344165547704,
0.812729,-0.502301,-0.295238,1.0,0.8151846510833864,-0.5038175802700607,-0.2857303456913148,
0.812729,-0.502301,0.2952379999999999,1.0,0.8151848055269568,-0.503817229437447,0.2857305236756347,
0.6708180000000001,-0.72361,0.162458,1.0,0.6683384936921797,-0.727549561234357,0.1549041438986152,
0.8506480000000001,-0.525736,0.0,1.0,0.8506487792762305,-0.5257343952185694,-1.551196823478276e-07,
0.812729,-0.502301,-0.295238,1.0,0.8151846510833864,-0.5038175802700607,-0.2857303456913148,
0.670817,-0.723611,-0.16245699999999996,1.0,0.6683377704518599,-0.7275503751292589,-0.15490344165547704,
0.6095470000000001,-0.657519,-0.442856,1.0,0.60423092704266,-0.6649723365238669,-0.4389951918451463,
0.670817,-0.723611,-0.16245699999999996,1.0,0.6683377704518599,-0.7275503751292589,-0.15490344165547704,
0.4253230000000001,-0.850654,-0.3090109999999999,1.0,0.42532286056333185,-0.8506540013904963,-0.3090117056044348,
0.6095470000000001,-0.657519,-0.442856,1.0,0.60423092704266,-0.6649723365238669,-0.4389951918451463,
0.8506480000000001,-0.525736,0.0,1.0,0.8506487792762305,-0.5257343952185694,-1.551196823478276e-07,
0.6708180000000001,-0.72361,0.162458,1.0,0.6683384936921797,-0.727549561234357,0.1549041438986152,
0.670817,-0.723611,-0.16245699999999996,1.0,0.6683377704518599,-0.7275503751292589,-0.15490344165547704,
0.6708180000000001,-0.72361,0.162458,1.0,0.6683384936921797,-0.727549561234357,0.1549041438986152,
0.447211,-0.894428,9.999999999177334e-07,1.0,0.4551295869979919,-0.8904252124903946,6.877146626628624e-07,
0.670817,-0.723611,-0.16245699999999996,1.0,0.6683377704518599,-0.7275503751292589,-0.15490344165547704,
0.670817,-0.723611,-0.16245699999999996,1.0,0.6683377704518599,-0.7275503751292589,-0.15490344165547704,
0.447211,-0.894428,9.999999999177334e-07,1.0,0.4551295869979919,-0.8904252124903946,6.877146626628624e-07,
0.4253230000000001,-0.850654,-0.3090109999999999,1.0,0.42532286056333185,-0.8506540013904963,-0.3090117056044348,
0.447211,-0.894428,9.999999999177334e-07,1.0,0.4551295869979919,-0.8904252124903946,6.877146626628624e-07,
0.20318100000000006,-0.96795,-0.14761800000000003,1.0,0.21095286907952562,-0.9654060533326492,-0.15326460522832558,
0.4253230000000001,-0.850654,-0.3090109999999999,1.0,0.42532286056333185,-0.8506540013904963,-0.3090117056044348,
0.812729,-0.502301,0.2952379999999999,1.0,0.8151848055269568,-0.503817229437447,0.2857305236756347,
0.6095470000000001,-0.657519,0.4428559999999999,1.0,0.6042310408008547,-0.6649722006723842,0.43899524105124693,
0.6708180000000001,-0.72361,0.162458,1.0,0.6683384936921797,-0.727549561234357,0.1549041438986152,
0.6095470000000001,-0.657519,0.4428559999999999,1.0,0.6042310408008547,-0.6649722006723842,0.43899524105124693,
0.4253230000000001,-0.850654,0.3090109999999999,1.0,0.42532325551188366,-0.8506538075846909,0.30901169551076946,
0.6708180000000001,-0.72361,0.162458,1.0,0.6683384936921797,-0.727549561234357,0.1549041438986152,
0.6708180000000001,-0.72361,0.162458,1.0,0.6683384936921797,-0.727549561234357,0.1549041438986152,
0.4253230000000001,-0.850654,0.3090109999999999,1.0,0.42532325551188366,-0.8506538075846909,0.30901169551076946,
0.447211,-0.894428,9.999999999177334e-07,1.0,0.4551295869979919,-0.8904252124903946,6.877146626628624e-07,
0.4253230000000001,-0.850654,0.3090109999999999,1.0,0.42532325551188366,-0.8506538075846909,0.30901169551076946,
0.20318100000000006,-0.96795,0.14761800000000003,1.0,0.21095266289464853,-0.9654061618992498,0.15326420516420788,
0.447211,-0.894428,9.999999999177334e-07,1.0,0.4551295869979919,-0.8904252124903946,6.877146626628624e-07,
0.447211,-0.894428,9.999999999177334e-07,1.0,0.4551295869979919,-0.8904252124903946,6.877146626628624e-07,
0.20318100000000006,-0.96795,0.14761800000000003,1.0,0.21095266289464853,-0.9654061618992498,0.15326420516420788,
0.20318100000000006,-0.96795,-0.14761800000000003,1.0,0.21095286907952562,-0.9654060533326492,-0.15326460522832558,
0.20318100000000006,-0.96795,0.14761800000000003,1.0,0.21095266289464853,-0.9654061618992498,0.15326420516420788,
0.0,-1.0,0.0,1.0,-1.306012939612e-06,-0.9999999999991471,7.024692550196524e-18,
0.20318100000000006,-0.96795,-0.14761800000000003,1.0,0.21095286907952562,-0.9654060533326492,-0.15326460522832558,
-0.23282199999999997,-0.657519,0.7165629999999998,1.0,-0.23079124291012987,-0.6649730641972427,0.7103141742131627,
-0.02963899999999997,-0.502302,0.8641839999999998,1.0,-0.019838689717257413,-0.5038192559913451,0.8635812548235572,
-0.2763880000000001,-0.44721999999999995,0.850649,1.0,-0.27638775259514803,-0.44721995820039745,0.8506492339399584,
-0.16245599999999993,-0.850654,0.49999499999999997,1.0,-0.16245708015289456,-0.8506538856343064,0.4999956639446509,
0.05278999999999989,-0.723612,0.688185,1.0,0.05920723925994218,-0.7275515145351986,0.6834934502369095,
-0.23282199999999997,-0.657519,0.7165629999999998,1.0,-0.23079124291012987,-0.6649730641972427,0.7103141742131627,
-0.07760699999999998,-0.96795,0.23885299999999998,1.0,-0.08057675620781352,-0.9654060832357604,0.2479888723519962,
0.13819899999999996,-0.894429,0.42532100000000006,1.0,0.1406455146287707,-0.8904254422627637,0.4328525972960891,
-0.16245599999999993,-0.850654,0.49999499999999997,1.0,-0.16245708015289456,-0.8506538856343064,0.4999956639446509,
-0.23282199999999997,-0.657519,0.7165629999999998,1.0,-0.23079124291012987,-0.6649730641972427,0.7103141742131627,
0.05278999999999989,-0.723612,0.688185,1.0,0.05920723925994218,-0.7275515145351986,0.6834934502369095,
-0.02963899999999997,-0.502302,0.8641839999999998,1.0,-0.019838689717257413,-0.5038192559913451,0.8635812548235572,
0.05278999999999989,-0.723612,0.688185,1.0,0.05920723925994218,-0.7275515145351986,0.6834934502369095,
0.262869,-0.525738,0.8090120000000001,1.0,0.26286888259023233,-0.5257372188438393,0.8090119450836976,
-0.02963899999999997,-0.502302,0.8641839999999998,1.0,-0.019838689717257413,-0.5038192559913451,0.8635812548235572,
-0.16245599999999993,-0.850654,0.49999499999999997,1.0,-0.16245708015289456,-0.8506538856343064,0.4999956639446509,
0.13819899999999996,-0.894429,0.42532100000000006,1.0,0.1406455146287707,-0.8904254422627637,0.4328525972960891,
0.05278999999999989,-0.723612,0.688185,1.0,0.05920723925994218,-0.7275515145351986,0.6834934502369095,
0.13819899999999996,-0.894429,0.42532100000000006,1.0,0.1406455146287707,-0.8904254422627637,0.4328525972960891,
0.36180499999999993,-0.723611,0.587779,1.0,0.3538549988818572,-0.7275505518078368,0.5877557607803032,
0.05278999999999989,-0.723612,0.688185,1.0,0.05920723925994218,-0.7275515145351986,0.6834934502369095,
0.05278999999999989,-0.723612,0.688185,1.0,0.05920723925994218,-0.7275515145351986,0.6834934502369095,
0.36180499999999993,-0.723611,0.587779,1.0,0.3538549988818572,-0.7275505518078368,0.5877557607803032,
0.262869,-0.525738,0.8090120000000001,1.0,0.26286888259023233,-0.5257372188438393,0.8090119450836976,
0.36180499999999993,-0.723611,0.587779,1.0,0.3538549988818572,-0.7275505518078368,0.5877557607803032,
0.531941,-0.502302,0.6817120000000001,1.0,0.5236580515960895,-0.5038185204865161,0.6869855481837774,
0.262869,-0.525738,0.8090120000000001,1.0,0.26286888259023233,-0.5257372188438393,0.8090119450836976,
-0.07760699999999998,-0.96795,0.23885299999999998,1.0,-0.08057675620781352,-0.9654060832357604,0.2479888723519962,
0.20318100000000006,-0.96795,0.14761800000000003,1.0,0.21095266289464853,-0.9654061618992498,0.15326420516420788,
0.13819899999999996,-0.894429,0.42532100000000006,1.0,0.1406455146287707,-0.8904254422627637,0.4328525972960891,
0.20318100000000006,-0.96795,0.14761800000000003,1.0,0.21095266289464853,-0.9654061618992498,0.15326420516420788,
0.4253230000000001,-0.850654,0.3090109999999999,1.0,0.42532325551188366,-0.8506538075846909,0.30901169551076946,
0.13819899999999996,-0.894429,0.42532100000000006,1.0,0.1406455146287707,-0.8904254422627637,0.4328525972960891,
0.13819899999999996,-0.894429,0.42532100000000006,1.0,0.1406455146287707,-0.8904254422627637,0.4328525972960891,
0.4253230000000001,-0.850654,0.3090109999999999,1.0,0.42532325551188366,-0.8506538075846909,0.30901169551076946,
0.36180499999999993,-0.723611,0.587779,1.0,0.3538549988818572,-0.7275505518078368,0.5877557607803032,
0.4253230000000001,-0.850654,0.3090109999999999,1.0,0.42532325551188366,-0.8506538075846909,0.30901169551076946,
0.6095470000000001,-0.657519,0.4428559999999999,1.0,0.6042310408008547,-0.6649722006723842,0.43899524105124693,
0.36180499999999993,-0.723611,0.587779,1.0,0.3538549988818572,-0.7275505518078368,0.5877557607803032,
0.36180499999999993,-0.723611,0.587779,1.0,0.3538549988818572,-0.7275505518078368,0.5877557607803032,
0.6095470000000001,-0.657519,0.4428559999999999,1.0,0.6042310408008547,-0.6649722006723842,0.43899524105124693,
0.531941,-0.502302,0.6817120000000001,1.0,0.5236580515960895,-0.5038185204865161,0.6869855481837774,
0.6095470000000001,-0.657519,0.4428559999999999,1.0,0.6042310408008547,-0.6649722006723842,0.43899524105124693,
0.7236069999999999,-0.44721999999999995,0.525725,1.0,0.7236067216830413,-0.4472196513214831,0.5257260653677089,
0.531941,-0.502302,0.6817120000000001,1.0,0.5236580515960895,-0.5038185204865161,0.6869855481837774

])

}

// from Project B and starter
function makeGroundGrid() {
    //==============================================================================
    // Create a list of vertices that create a large grid of lines in the x,y plane
    // centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.
        var floatsPerVertex = 7;
        var xcount = 100;			// # of lines to draw in x,y to make the grid.
        var ycount = 100;		
        var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
         var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
         var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
         
        // Create an (global) array to hold this ground-plane's vertices:
        gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
                            // draw a grid made of xcount+ycount lines; 2 vertices per line.
                            
        var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
        var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
        
        // First, step thru x values as we make vertical lines of constant-x:
        for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
            if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
                gndVerts[j  ] = -xymax + (v  )*xgap;	// x
                gndVerts[j+1] = -xymax;								// y
                gndVerts[j+2] = 0.0;									// z
                gndVerts[j+3] = 1.0;									// w.
            }
            else {				// put odd-numbered vertices at (xnow, +xymax, 0).
                gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
                gndVerts[j+1] = xymax;								// y
                gndVerts[j+2] = 0.0;									// z
                gndVerts[j+3] = 1.0;									// w.
            }
            gndVerts[j+4] = xColr[0];			// red
            gndVerts[j+5] = xColr[1];			// grn
            gndVerts[j+6] = xColr[2];			// blu
        }
        // Second, step thru y values as wqe make horizontal lines of constant-y:
        // (don't re-initialize j--we're adding more vertices to the array)
        for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
            if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
                gndVerts[j  ] = -xymax;								// x
                gndVerts[j+1] = -xymax + (v  )*ygap;	// y
                gndVerts[j+2] = 0.0;									// z
                gndVerts[j+3] = 1.0;									// w.
            }
            else {					// put odd-numbered vertices at (+xymax, ynow, 0).
                gndVerts[j  ] = xymax;								// x
                gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
                gndVerts[j+2] = 0.0;									// z
                gndVerts[j+3] = 1.0;									// w.
            }
            gndVerts[j+4] = yColr[0];			// red
            gndVerts[j+5] = yColr[1];			// grn
            gndVerts[j+6] = yColr[2];			// blu
        }
    }

