//=====================
// vbobox.js library: 
//===================== 

// Written for EECS 351-2,	Intermediate Computer Graphics,
//							Northwestern Univ. EECS Dept., Jack Tumblin
// 2016.05.26 J. Tumblin-- Created; tested on 'TwoVBOs.html' starter code.
// 2017.02.20 J. Tumblin-- updated for EECS 351-1 use for Project C.
// 2018.04.11 J. Tumblin-- minor corrections/renaming for particle systems.
//    --11e: global 'gl' replaced redundant 'myGL' fcn args; 
//    --12: added 'SwitchToMe()' fcn to simplify 'init()' function and to fix 
//      weird subtle errors that sometimes appear when we alternate 'adjust()'
//      and 'draw()' functions of different VBObox objects. CAUSE: found that
//      only the 'draw()' function (and not the 'adjust()' function) made a full
//      changeover from one VBObox to another; thus calls to 'adjust()' for one
//      VBObox could corrupt GPU contents for another.
//      --Created vboStride, vboOffset members to centralize VBO layout in the 
//      constructor function.
//    -- 13 (abandoned) tried to make a 'core' or 'resuable' VBObox object to
//      which we would add on new properties for shaders, uniforms, etc., but
//      I decided there was too little 'common' code that wasn't customized.

//=============================================================================

var floatsPerVertex = 7;

function VBObox0() {
  this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
    'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
    //
    'uniform mat4 u_ModelMat0;\n' +
    'attribute vec4 a_Pos0;\n' +
    'attribute vec3 a_Colr0;\n' +
    'varying vec3 v_Colr0;\n' +
    //
    'void main() {\n' +
    '  gl_Position = u_ModelMat0 * a_Pos0;\n' +
    '	 v_Colr0 = a_Colr0;\n' +
    ' }\n';

  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    'precision mediump float;\n' +
    'varying vec3 v_Colr0;\n' +
    'void main() {\n' +
    '  gl_FragColor = vec4(v_Colr0, 1.0);\n' +
    '}\n';

  var xcount = 100;			// # of lines to draw in x,y to make the grid.
  var ycount = 100;
  var xymax = 50.0;			// grid size; extends to cover +/-xymax in x and y.
  var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
  var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.

  // Create an (global) array to hold this ground-plane's vertices:
  this.vboVerts = (2 * (xcount + ycount) + 6); // # of vertices held in 'vboContents' array
  this.vboContents = new Float32Array(floatsPerVertex * (2 * (xcount + ycount) + 6));
  // draw a grid made of xcount+ycount lines; 2 vertices per line.

  var xgap = xymax / (xcount - 1);		// HALF-spacing between lines in x,y;
  var ygap = xymax / (ycount - 1);		// (why half? because v==(0line number/2))

  // First, step thru x values as we make vertical lines of constant-x:
  for (v = 0, j = 0; v < 2 * xcount; v++, j += floatsPerVertex) {
    if (v % 2 == 0) {	// put even-numbered vertices at (xnow, -xymax, 0)
      this.vboContents[j] = -xymax + (v) * xgap;	// x
      this.vboContents[j + 1] = -xymax;								// y
      this.vboContents[j + 2] = 0.0;									// z
      this.vboContents[j + 3] = 1.0;									// w.
    }
    else {				// put odd-numbered vertices at (xnow, +xymax, 0).
      this.vboContents[j] = -xymax + (v - 1) * xgap;	// x
      this.vboContents[j + 1] = xymax;								// y
      this.vboContents[j + 2] = 0.0;									// z
      this.vboContents[j + 3] = 1.0;									// w.
    }
    this.vboContents[j + 4] = xColr[0];			// red
    this.vboContents[j + 5] = xColr[1];			// grn
    this.vboContents[j + 6] = xColr[2];			// blu
  }
  // Second, step thru y values as wqe make horizontal lines of constant-y:
  // (don't re-initialize j--we're adding more vertices to the array)
  for (v = 0; v < 2 * ycount; v++, j += floatsPerVertex) {
    if (v % 2 == 0) {		// put even-numbered vertices at (-xymax, ynow, 0)
      this.vboContents[j] = -xymax;								// x
      this.vboContents[j + 1] = -xymax + (v) * ygap;	// y
      this.vboContents[j + 2] = 0.0;									// z
      this.vboContents[j + 3] = 1.0;									// w.
    }
    else {					// put odd-numbered vertices at (+xymax, ynow, 0).
      this.vboContents[j] = xymax;								// x
      this.vboContents[j + 1] = -xymax + (v - 1) * ygap;	// y
      this.vboContents[j + 2] = 0.0;									// z
      this.vboContents[j + 3] = 1.0;									// w.
    }
    this.vboContents[j + 4] = yColr[0];			// red
    this.vboContents[j + 5] = yColr[1];			// grn
    this.vboContents[j + 6] = yColr[2];			// blu
  }

  // X axis
  var start = j;
  this.vboContents[start + 0] = 0.0;  // x
  this.vboContents[start + 1] = 0.0;  // y
  this.vboContents[start + 2] = 0.0;  // z
  this.vboContents[start + 3] = 1.0;  // w.
  this.vboContents[start + 4] = 1.0;  // R
  this.vboContents[start + 5] = 0.0;  // G
  this.vboContents[start + 6] = 0.0;  // B
  this.vboContents[start + 7] = xymax;  // x
  this.vboContents[start + 8] = 0.0;  // y
  this.vboContents[start + 9] = 0.0;  // z
  this.vboContents[start + 10] = 1.0;  // w.
  this.vboContents[start + 11] = 1.0;  // R
  this.vboContents[start + 12] = 0.0;  // G
  this.vboContents[start + 13] = 0.0;  // B

  // Y axis
  start += 14;
  this.vboContents[start + 0] = 0.0;  // x
  this.vboContents[start + 1] = 0.0;  // y
  this.vboContents[start + 2] = 0.0;  // z
  this.vboContents[start + 3] = 1.0;  // w.
  this.vboContents[start + 4] = 0.0;  // R
  this.vboContents[start + 5] = 1.0;  // G
  this.vboContents[start + 6] = 0.0;  // B
  this.vboContents[start + 7] = 0.0;  // x
  this.vboContents[start + 8] = xymax;  // y
  this.vboContents[start + 9] = 0.0;  // z
  this.vboContents[start + 10] = 1.0;  // w.
  this.vboContents[start + 11] = 0.0;  // R
  this.vboContents[start + 12] = 1.0;  // G
  this.vboContents[start + 13] = 0.0;  // B

  // Z axis
  start += 14;
  this.vboContents[start + 0] = 0.0;  // x
  this.vboContents[start + 1] = 0.0;  // y
  this.vboContents[start + 2] = 0.0;  // z
  this.vboContents[start + 3] = 1.0;  // w.
  this.vboContents[start + 4] = 0.0;  // R
  this.vboContents[start + 5] = 0.0;  // G
  this.vboContents[start + 6] = 1.0;  // B
  this.vboContents[start + 7] = 0.0;  // x
  this.vboContents[start + 8] = 0.0;  // y
  this.vboContents[start + 9] = xymax;  // z
  this.vboContents[start + 10] = 1.0;  // w.
  this.vboContents[start + 11] = 0.0;  // R
  this.vboContents[start + 12] = 0.0;  // G
  this.vboContents[start + 13] = 1.0;  // B

  this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
  // bytes req'd by 1 vboContents array element;
  // (why? used to compute stride and offset 
  // in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;
  // total number of bytes stored in vboContents
  // (#  of floats in vboContents array) * 
  // (# of bytes/float).
  this.vboStride = this.vboBytes / this.vboVerts;
  // (== # of bytes to store one complete vertex).
  // From any attrib in a given vertex in the VBO, 
  // move forward by 'vboStride' bytes to arrive 
  // at the same attrib for the next vertex. 

  //----------------------Attribute sizes
  this.vboFcount_a_Pos0 = 4;    // # of floats in the VBO needed to store the
  // attribute named a_Pos0. (4: x,y,z,w values)
  this.vboFcount_a_Colr0 = 3;   // # of floats for this attrib (r,g,b values) 
  console.assert((this.vboFcount_a_Pos0 +     // check the size of each and
    this.vboFcount_a_Colr0) *   // every attribute in our VBO
    this.FSIZE == this.vboStride, // for agreeement with'stride'
    "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");

  //----------------------Attribute offsets   
  this.vboOffset_a_Pos0 = 0;    // # of bytes from START of vbo to the START
  // of 1st a_Pos0 attrib value in vboContents[]
  this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;
  // (4 floats * bytes/float) 
  // # of bytes from START of vbo to the START
  // of 1st a_Colr0 attrib value in vboContents[]

  //-----------------------GPU memory locations:
  this.vboLoc;									// GPU tLocation for Vertex Buffer Object, 
  // returned by gl.createBuffer() funcion call
  this.shaderLoc;								// GPU Location for compiled Shader-program  
  // set by compile/link of VERT_SRC and FRAG_SRC.
  //------Attribute locations in our shaders:
  this.a_PosLoc;								// GPU location for 'a_Pos0' attribute
  this.a_ColrLoc;								// GPU location for 'a_Colr0' attribute

  //---------------------- Uniform locations &values in our shaders
  this.ModelMat = new Matrix4();	// Transforms CVV axes to model axes.
  this.u_ModelMatLoc;							// GPU location for u_ModelMat uniform
}

VBObox0.prototype.init = function () {
  //=============================================================================
  // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
  // kept in this VBObox. (This function usually called only once, within main()).
  // Specifically:
  // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
  //  executable 'program' stored and ready to use inside the GPU.  
  // b) create a new VBO object in GPU memory and fill it by transferring in all
  //  the vertex data held in our Float32array member 'VBOcontents'. 
  // c) Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
  // a) Compile,link,upload shaders
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(
      this.constructor.name +
      '.init() failed to create executable Shaders on the GPU. Bye!'
    );
    return;
  }

  gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log(
      this.constructor.name +
      '.init() failed to create VBO in GPU. Bye!'
    );
    return;
  }

  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    this.vboLoc
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    this.vboContents,
    gl.STATIC_DRAW
  );

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_PosLoc = gl.getAttribLocation(gl.program, 'a_Pos0');
  if (this.a_PosLoc < 0) {
    console.log(this.constructor.name +
      '.init() Failed to get GPU location of attribute a_Pos0');
    return -1;	// error exit.
  }
  this.a_ColrLoc = gl.getAttribLocation(gl.program, 'a_Colr0');
  if (this.a_ColrLoc < 0) {
    console.log(this.constructor.name +
      '.init() failed to get the GPU location of attribute a_Colr0');
    return -1;	// error exit.
  }

  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
  this.u_ModelMatLoc = gl.getUniformLocation(gl.program, 'u_ModelMat0');
  if (!this.u_ModelMatLoc) {
    console.log(this.constructor.name +
      '.init() failed to get GPU location for u_ModelMat1 uniform');
    return;
  }
}

VBObox0.prototype.switchToMe = function () {
  // Compile the program
  gl.useProgram(this.shaderLoc);

  // Bind the VBO Loc buffer
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    this.vboLoc
  );

  // Link up the Position attribute
  gl.vertexAttribPointer(
    this.a_PosLoc,
    this.vboFcount_a_Pos0,
    gl.FLOAT,
    false,
    this.vboStride,
    this.vboOffset_a_Pos0
  );

  // Link up the Color attribute
  gl.vertexAttribPointer(
    this.a_ColrLoc,
    this.vboFcount_a_Colr0,
    gl.FLOAT,
    false,
    this.vboStride,
    this.vboOffset_a_Colr0
  );

  // Enable the attributes to use the vertex in the
  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function () {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

  var isOK = true;

  if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
    console.log(this.constructor.name +
      '.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
    console.log(this.constructor.name +
      '.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox0.prototype.adjust = function () {
  //==============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if (this.isReady() == false) {
    console.log('ERROR! before' + this.constructor.name +
      '.adjust() call you needed to call this.switchToMe()!!');
  }

  this.ModelMat.set(mvpMatrix);

  //  this.ModelMat.rotate(g_angleNow0, 0, 0, 1);	  // rotate drawing axes,
  //  this.ModelMat.translate(0.35, 0, 0);							// then translate them.
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(
    this.u_ModelMatLoc,
    false,
    this.ModelMat.elements
  );
}

VBObox0.prototype.draw = function () {
  //=============================================================================
  // Render current VBObox contents.
  if (this.isReady() == false) {
    console.log('ERROR! before' + this.constructor.name +
      '.draw() call you needed to call this.switchToMe()!!');
  }

  gl.drawArrays(
    gl.LINES,
    0,
    this.vboVerts
  );
}

VBObox0.prototype.reload = function () {
  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    0,
    this.vboContents
  );
}

function VBObox1() {
  // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.

  // Constructor goal: 
  // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
  // written into code) in all other VBObox functions. Keeping all these (initial)
  // values here, in this one coonstrutor function, ensures we can change them 
  // easily WITHOUT disrupting any other code, ever!

  this.VERT_SRC =	//--------------------- VERTEX SHADER source code
    //-------------Set precision.
    // GLSL-ES 2.0 defaults (from spec; '4.5.3 Default Precision Qualifiers'):
    // DEFAULT for Vertex Shaders: 	precision highp float; precision highp int;
    //									precision lowp sampler2D; precision lowp samplerCube;
    // DEFAULT for Fragment Shaders:  UNDEFINED for float; precision mediump int;
    //									precision lowp sampler2D;	precision lowp samplerCube;
    //--------------- GLSL Struct Definitions:
    'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
    '		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
    '		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +
    //																
    //-------------ATTRIBUTES of each vertex, read from our Vertex Buffer Object
    'attribute vec4 a_Position; \n' +		// vertex position (model coord sys)
    'attribute vec3 a_Normal; \n' +			// vertex normal vector (model coord sys)
    //
    //-------------UNIFORMS: values set from JavaScript before a drawing command.
    // 	'uniform vec3 u_Kd; \n' +						// Phong diffuse reflectance for the 
    // entire shape. Later: as vertex attrib.
    'uniform MatlT u_MatlSet[1];\n' +		// Array of all materials.
    'uniform mat4 u_MvpMatrix; \n' +
    'uniform mat4 u_ModelMatrix; \n' + 		// Model matrix
    'uniform mat4 u_NormalMatrix; \n' +  	// Inverse Transpose of ModelMatrix;
    // (won't distort normal vec directions
    // but it usually WILL change its length)

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
    'varying vec3 v_Kd; \n' +							// Phong Lighting: diffuse reflectance
    // (I didn't make per-pixel Ke,Ka,Ks;
    // we use 'uniform' values instead)
    'varying vec4 v_Position; \n' +
    'varying vec3 v_Normal; \n' +					// Why Vec3? its not a point, hence w==0
    //-----------------------------------------------------------------------------
    'void main() { \n' +
    // Compute CVV coordinate values from our given vertex. This 'built-in'
    // 'varying' value gets interpolated to set screen position for each pixel.
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // Calculate the vertex position & normal vec in the WORLD coordinate system
    // for use as a 'varying' variable: fragment shaders get per-pixel values
    // (interpolated between vertices for our drawing primitive (TRIANGLE)).
    '  v_Position = u_ModelMatrix * a_Position; \n' +
    // 3D surface normal of our vertex, in world coords.  ('varying'--its value
    // gets interpolated (in world coords) for each pixel's fragment shader.
    '  v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));\n' +
    '	 v_Kd = u_MatlSet[0].diff; \n' +		// find per-pixel diffuse reflectance from per-vertex
    // (no per-pixel Ke,Ka, or Ks, but you can do it...)
    //	'  v_Kd = vec3(1.0, 1.0, 0.0); \n'	+ // TEST; color fixed at green
    '}\n';

  // SHADED, sphere-like dots:
  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    //-------------Set precision.
    // GLSL-ES 2.0 defaults (from spec; '4.5.3 Default Precision Qualifiers'):
    // DEFAULT for Vertex Shaders: 	precision highp float; precision highp int;
    //									precision lowp sampler2D; precision lowp samplerCube;
    // DEFAULT for Fragment Shaders:  UNDEFINED for float; precision mediump int;
    //									precision lowp sampler2D;	precision lowp samplerCube;
    // MATCH the Vertex shader precision for float and int:
    'precision highp float;\n' +
    'precision highp int;\n' +
    //
    //--------------- GLSL Struct Definitions:
    'struct LampT {\n' +		// Describes one point-like Phong light source
    '		vec4 pos;\n' +			// (x,y,z,w);
    ' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
    ' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
    '		vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
    '}; \n' +
    //
    'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
    '		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
    '		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +
    //
    //-------------UNIFORMS: values set from JavaScript before a drawing command.
    // first light source: (YOU write a second one...)
    'uniform LampT u_LampSet[1];\n' +		// Array of all light sources.
    'uniform MatlT u_MatlSet[1];\n' +		// Array of all materials.
    //
    'uniform vec4 u_eyePosWorld; \n' + 	// Camera/eye location in world coords.

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader: 
    'varying vec3 v_Normal;\n' +				// Find 3D surface normal at each pix
    'varying vec4 v_Position;\n' +			// pixel's 3D pos too -- in 'world' coords
    'varying vec3 v_Kd;	\n' +						// Find diffuse reflectance K_d per pix
    // Ambient? Emissive? Specular? almost
    // NEVER change per-vertex: I use 'uniform' values

    'void main() { \n' +
    // Normalize! !!IMPORTANT!! TROUBLE if you don't! 
    // normals interpolated for each pixel aren't 1.0 in length any more!
    '  vec4 normal = normalize(vec4(v_Normal, 1.0)); \n' +
    //	'  vec3 normal = v_Normal; \n' +
    // Find the unit-length light dir vector 'L' (surface pt --> light):
    '  vec4 lightDirection = normalize(u_LampSet[0].pos - v_Position);\n' +
    // Find the unit-length eye-direction vector 'V' (surface pt --> camera)
    '  vec4 eyeDirection = normalize(u_eyePosWorld - v_Position); \n' +
    // The dot product of (unit-length) light direction and the normal vector
    // (use max() to discard any negatives from lights below the surface) 
    // (look in GLSL manual: what other functions would help?)
    // gives us the cosine-falloff factor needed for the diffuse lighting term:
    '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
    // The Blinn-Phong lighting model computes the specular term faster 
    // because it replaces the (V*R)^shiny weighting with (H*N)^shiny,
    // where 'halfway' vector H has a direction half-way between L and V
    // H = norm(norm(V) + norm(L)).  Note L & V already normalized above.
    // (see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
    '  vec4 H = normalize(lightDirection + eyeDirection); \n' +
    '  float nDotH = max(dot(H, normal), 0.0); \n' +
    // (use max() to discard any negatives from lights below the surface)
    // Apply the 'shininess' exponent K_e:
    // Try it two different ways:		The 'new hotness': pow() fcn in GLSL.
    // CAREFUL!  pow() won't accept integer exponents! Convert K_shiny!  
    '  float e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' +
    // Calculate the final color from diffuse reflection and ambient reflection
    //  '	 vec3 emissive = u_Ke;' +
    '	 vec3 emissive = 										u_MatlSet[0].emit;' +
    '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
    '  vec3 diffuse = u_LampSet[0].diff * v_Kd * nDotL;\n' +
    '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +
    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
    '}\n';

  this.lamp0 = new LightsT();
  this.matl0 = new Material();

  this.modelMatrix = new Matrix4();  // Model matrix
  this.mvpMatrix = new Matrix4();    // Model view projection matrix
  this.normalMatrix = new Matrix4(); // Transformation matrix for normals
};


VBObox1.prototype.init = function () {
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(this.constructor.name +
      '.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }

  gl.program = this.shaderLoc;

  // Get the storage locations of uniform variables: the scene
  this.u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
  this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  this.u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  this.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!this.u_ModelMatrix || !this.u_MvpMatrix || !this.u_NormalMatrix) {
    console.log('Failed to get matrix storage locations');
    return;
  }

  //  ... for Phong light source:
  this.u_Lamp0Pos = gl.getUniformLocation(gl.program, 'u_LampSet[0].pos');
  this.u_Lamp0Ambi = gl.getUniformLocation(gl.program, 'u_LampSet[0].ambi');
  this.u_Lamp0Diff = gl.getUniformLocation(gl.program, 'u_LampSet[0].diff');
  this.u_Lamp0Spec = gl.getUniformLocation(gl.program, 'u_LampSet[0].spec');
  if (!this.u_Lamp0Pos || !this.u_Lamp0Ambi || !this.u_Lamp0Diff || !this.u_Lamp0Spec) {
    console.log('Failed to get the Lamp0 storage locations');
    return;
  }

  // ... for Phong material/reflectance:
  this.u_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet[0].emit');
  this.u_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet[0].ambi');
  this.u_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet[0].diff');
  this.u_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet[0].spec');
  this.u_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet[0].shiny');
  if (!this.u_Ke || !this.u_Ka || !this.u_Kd || !this.u_Ks || !this.u_Kshiny) {
    console.log('Failed to get the Phong Reflectance storage locations');
    return;
  }

  // 
  this.vboVerts = this.initVertexBuffers(gl);
  if (this.n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

}

VBObox1.prototype.initVertexBuffers = function (gl) { // Create a sphere
  var SPHERE_DIV = 13;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  this.vboContents = [];
  this.vboIndices = [];

  this.vboPosition_Start = 0;

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      // Vertices
      this.vboContents.push(si * sj);  // X
      this.vboContents.push(cj);       // Y
      this.vboContents.push(ci * sj);  // Z
      this.vboContents.push(1.0);  // Z
      // Normal
      this.vboContents.push(si * sj);
      this.vboContents.push(cj);
      this.vboContents.push(ci * sj);
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV + 1) + i;
      p2 = p1 + (SPHERE_DIV + 1);

      this.vboIndices.push(p1);
      this.vboIndices.push(p2);
      this.vboIndices.push(p1 + 1);

      this.vboIndices.push(p1 + 1);
      this.vboIndices.push(p2);
      this.vboIndices.push(p2 + 1);
    }
  }


  this.bear_Start = this.vboContents.length / 7;
  this.bear_Length = teddyBearVerts.length / 7;
  for (i = 0; i < teddyBearVerts.length; i++) {
    this.vboContents.push(teddyBearVerts[i]);
  }

  this.FSIZE = 4;

  // Write the vertex property to buffers (coordinates and normals)
  // Use the same data for each vertex and its normal because the sphere is
  // centered at the origin, and has radius of 1.0.
  // We create two separate buffers so that you can modify normals if you wish.
  // Create a buffer object
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vboContents), gl.STATIC_DRAW);

  // Setup a_Position
  this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (this.a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return false;
  }

  // Setup a_Normal
  this.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (this.a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return false;
  }

  // Write the indices to the buffer object
  this.indexBuffer = gl.createBuffer();
  if (!this.indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vboIndices), gl.STATIC_DRAW);

  return this.vboIndices.length;
}

VBObox1.prototype.switchToMe = function () {
  gl.useProgram(
    this.shaderLoc
  );

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    this.vboLoc
  );

  gl.vertexAttribPointer(
    this.a_Position,
    4,
    gl.FLOAT,
    false,
    this.FSIZE * 7,
    0
  );

  gl.vertexAttribPointer(
    this.a_Normal,
    3,
    gl.FLOAT,
    false,
    this.FSIZE * 7,
    this.FSIZE * 4
  );

  // --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_Position);
  gl.enableVertexAttribArray(this.a_Normal);

  gl.bindBuffer(
    gl.ELEMENT_ARRAY_BUFFER,
    this.indexBuffer
  );

  // Position the first light source in World coords: 
  gl.uniform4f(this.u_Lamp0Pos, g_lamp0.I_pos[0], g_lamp0.I_pos[1], g_lamp0.I_pos[2], g_lamp0.I_pos[3]);
  gl.uniform3f(this.u_Lamp0Ambi, g_lamp0.I_ambi[0], g_lamp0.I_ambi[1], g_lamp0.I_ambi[2]);
  gl.uniform3f(this.u_Lamp0Diff, g_lamp0.I_diff[0], g_lamp0.I_diff[1], g_lamp0.I_diff[2]);
  gl.uniform3f(this.u_Lamp0Spec, g_lamp0.I_spec[0], g_lamp0.I_spec[1], g_lamp0.I_spec[2]);

  // Set up mvp matrix
  this.mvpMatrix.set(mvpMatrix);

  // Pass the eye position to u_eyePosWorld
  gl.uniform4f(this.u_eyePosWorld, eyePosWorld[0], eyePosWorld[1], eyePosWorld[2], 1);
}

VBObox1.prototype.isReady = function () {
  var isOK = true;
  if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
    console.log(this.constructor.name +
      '.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
    console.log(this.constructor.name +
      '.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  if (gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING) != this.indexBuffer) {
    console.log(this.constructor.name +
      '.isReady() false: vbo at this.indexBuffer not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox1.prototype.adjust = function () {
  if (this.isReady() == false) {
    console.log(
      'ERROR! before' + this.constructor.name +
      '.adjust() call you needed to call this.switchToMe()!!'
    );
  }

  // Transfer new VBOcontents to GPU-------------------------------------------- 
  // this.reload();
}

VBObox1.prototype.draw = function () {
  if (this.isReady() == false) {
    console.log('ERROR! before' + this.constructor.name +
      '.draw() call you needed to call this.switchToMe()!!');
  }

  // Draw the cube
  this.modelMatrix.setIdentity();
  pushMatrix(this.modelMatrix);
  {
    this.modelMatrix.setRotate(g_angleNow, 0, 0, 1);
    this.drawSphere(g_matl0);
  }
  this.modelMatrix = popMatrix();
  pushMatrix(this.modelMatrix);
  {
    this.modelMatrix.translate(-2.0, 2.0, 0.8);
    this.modelMatrix.rotate(90.0, 1, 0, 0);
    this.modelMatrix.rotate(g_bearAngle1, 0, 1, 0);

    this.drawBear(g_matl1);

    pushMatrix(this.modelMatrix);
    {
      this.modelMatrix.scale(0.3, 0.3, 0.3);
      this.modelMatrix.translate(-2.5, 1.5, 0.4);
      this.modelMatrix.rotate(g_bearAngle2, 0, 1, 0);
      this.drawBear(g_matl1);
      pushMatrix(this.modelMatrix);
      {
        this.modelMatrix.scale(0.3, 0.3, 0.3);
        this.modelMatrix.translate(-2.5, 1.5, 0.4);
        this.modelMatrix.rotate(g_bearAngle3, 0, 1, 0);
        this.drawBear(g_matl1);
      }
      this.modelMatrix = popMatrix();
    }
    this.modelMatrix = popMatrix();
  }
  this.modelMatrix = popMatrix();
}

VBObox1.prototype.drawSphere = function (matl) {
  // Update the mvp matrix
  this.mvpMatrix.set(mvpMatrix);
  this.mvpMatrix.multiply(this.modelMatrix);

  // Set up normal matrix
  this.normalMatrix.setInverseOf(this.modelMatrix);
  this.normalMatrix.transpose();

  gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

  // Set the Phong materials' reflectance:
  var Ke = matl.K_emit;
  var Ka = matl.K_ambi;
  var Kd = matl.K_diff;
  var Ks = matl.K_spec;
  var Kshiny = matl.K_shiny;
  gl.uniform3f(this.u_Ke, Ke[0], Ke[1], Ke[2]);       // Ke emissive
  gl.uniform3f(this.u_Ka, Ka[0], Ka[1], Ka[2]);       // Ka ambient
  gl.uniform3f(this.u_Kd, Kd[0], Kd[1], Kd[2]);       // Kd	diffuse
  gl.uniform3f(this.u_Ks, Ks[0], Ks[1], Ks[2]);       // Ks specular
  gl.uniform1i(this.u_Kshiny, Kshiny);               // Kshiny shinyness exponent

  gl.drawElements(gl.TRIANGLES, this.vboVerts, gl.UNSIGNED_SHORT, 0);
}

VBObox1.prototype.drawBear = function (matl) {
  // Update the mvp matrix
  this.mvpMatrix.set(mvpMatrix);
  this.mvpMatrix.multiply(this.modelMatrix);

  // Set up normal matrix
  this.normalMatrix.setInverseOf(this.modelMatrix);
  this.normalMatrix.transpose();

  gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

  // Set the Phong materials' reflectance:
  var Ke = matl.K_emit;
  var Ka = matl.K_ambi;
  var Kd = matl.K_diff;
  var Ks = matl.K_spec;
  var Kshiny = matl.K_shiny;
  gl.uniform3f(this.u_Ke, Ke[0], Ke[1], Ke[2]);       // Ke emissive
  gl.uniform3f(this.u_Ka, Ka[0], Ka[1], Ka[2]);       // Ka ambient
  gl.uniform3f(this.u_Kd, Kd[0], Kd[1], Kd[2]);       // Kd	diffuse
  gl.uniform3f(this.u_Ks, Ks[0], Ks[1], Ks[2]);       // Ks specular
  gl.uniform1i(this.u_Kshiny, Kshiny);               // Kshiny shinyness exponent

  gl.drawArrays(gl.TRIANGLE_STRIP, this.bear_Start, this.bear_Length);
}

VBObox1.prototype.reload = function () {
  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    0,
    new Float32Array(this.vboContents)
  );

  gl.bufferSubData(
    gl.ELEMENT_ARRAY_BUFFER,
    0,
    new Float32Array(this.vboIndices)
  );
}

VBObox1.prototype.empty = function () {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  However, make sure this step is reversible by a call to 
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for 
  // uniforms, all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
}

VBObox1.prototype.restore = function () {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
  // all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
}
//=============================================================================
//=============================================================================
function VBObox2() {
  // Gouraud Shading Box

  this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
    //-------------ATTRIBUTES: of each vertex, read from our Vertex Buffer Object
    'attribute vec4 a_Position; \n' +		// vertex position (model coord sys)
    'attribute vec3 a_Normal; \n' +			// vertex normal vector (model coord sys)
    //  'attribute vec4 a_color;\n' + 		// What would 'per-vertex colors' mean in
    //	in Phong lighting implementation?  disable!
    // (LATER: replace with attrib. for diffuse reflectance?)
    //-------------UNIFORMS: values set from JavaScript before a drawing command.
    'uniform vec3 u_Kd; \n' +						//	Instead, we'll use this 'uniform' 
    // Phong diffuse reflectance for the entire shape
    'uniform mat4 u_MvpMatrix; \n' +
    'uniform mat4 u_ModelMatrix; \n' + 		// Model matrix
    'uniform mat4 u_NormalMatrix; \n' +  	// Inverse Transpose of ModelMatrix;
    // (doesn't distort normal directions)

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
    'varying vec3 v_Kd; \n' +							// Phong Lighting: diffuse reflectance
    // (I didn't make per-pixel Ke,Ka,Ks;
    // we use 'uniform' values instead)
    'varying vec4 v_Position; \n' +
    'varying vec3 v_Normal; \n' +					// Why Vec3? its not a point, hence w==0
    //---------------
    'void main() { \n' +
    // Compute CVV coordinate values from our given vertex. This 'built-in'
    // per-vertex value gets interpolated to set screen position for each pixel.
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // Calculate the vertex position & normal vec in the WORLD coordinate system
    // for use as a 'varying' variable: fragment shaders get per-pixel values
    // (interpolated between vertices for our drawing primitive (TRIANGLE)).
    '  v_Position = u_ModelMatrix * a_Position; \n' +
    // 3D surface normal of our vertex, in world coords.  ('varying'--its value
    // gets interpolated (in world coords) for each pixel's fragment shader.
    '  v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));\n' +
    '	 v_Kd = u_Kd; \n' +		// find per-pixel diffuse reflectance from per-vertex
    '}\n';

  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +

    // first light source: (YOU write a second one...)
    'uniform vec4 u_Lamp0Pos;\n' + 			// Phong Illum: position
    'uniform vec3 u_Lamp0Amb;\n' +   		// Phong Illum: ambient
    'uniform vec3 u_Lamp0Diff;\n' +     // Phong Illum: diffuse
    'uniform vec3 u_Lamp0Spec;\n' +			// Phong Illum: specular

    // first material definition: you write 2nd, 3rd, etc.
    'uniform vec3 u_Ke;\n' +						// Phong Reflectance: emissive
    'uniform vec3 u_Ka;\n' +						// Phong Reflectance: ambient
    // Phong Reflectance: diffuse? -- use v_Kd instead for per-pixel value
    'uniform vec3 u_Ks;\n' +						// Phong Reflectance: specular
    //'uniform int u_Kshiny;\n' +				// Phong Reflectance: 1 < shiny < 200
    //	
    'uniform vec4 u_eyePosWorld; \n' + 	// Camera/eye location in world coords.

    'varying vec3 v_Normal;\n' +				// Find 3D surface normal at each pix
    'varying vec4 v_Position;\n' +			// pixel's 3D pos too -- in 'world' coords
    'varying vec3 v_Kd;	\n' +						// Find diffuse reflectance K_d per pix
    // Ambient? Emissive? Specular? almost
    // NEVER change per-vertex: I use'uniform'

    'void main() { \n' +
    // Normalize! !!IMPORTANT!! TROUBLE if you don't! 
    // normals interpolated for each pixel aren't 1.0 in length any more!
    '  vec3 normal = normalize(v_Normal); \n' +
    //	'  vec3 normal = v_Normal; \n' +
    // Calculate the light direction vector, make it unit-length (1.0).
    '  vec3 lightDirection = normalize(u_Lamp0Pos.xyz - v_Position.xyz);\n' +
    // The dot product of the light direction and the normal
    // (use max() to discard any negatives from lights below the surface)
    // (look in GLSL manual: what other functions would help?)
    '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
    // The Blinn-Phong lighting model computes the specular term faster 
    // because it replaces the (V*R)^shiny weighting with (H*N)^shiny,
    // where 'halfway' vector H has a direction half-way between L and V"
    // H = norm(norm(V) + norm(L)) 
    // (see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
    '  vec3 eyeDirection = normalize(u_eyePosWorld.xyz - v_Position.xyz); \n' +
    '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '  float nDotH = max(dot(H, normal), 0.0); \n' +
    // (use max() to discard any negatives from lights below the surface)
    // Apply the 'shininess' exponent K_e:
    '  float e02 = nDotH*nDotH; \n' +
    '  float e04 = e02*e02; \n' +
    '  float e08 = e04*e04; \n' +
    '	 float e16 = e08*e08; \n' +
    '	 float e32 = e16*e16; \n' +
    '	 float e64 = e32*e32;	\n' +
    // Can you find a better way to do this? SEE GLSL 'pow()'.
    // Calculate the final color from diffuse reflection and ambient reflection
    '	 vec3 emissive = u_Ke;' +
    '  vec3 ambient = u_Lamp0Amb * u_Ka;\n' +
    '  vec3 diffuse = u_Lamp0Diff * v_Kd * nDotL;\n' +
    '	 vec3 speculr = u_Lamp0Spec * u_Ks * e64;\n' +
    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
    '}\n';

  // Get the storage locations of uniform variables: the scene
  this.u_eyePosWorld;
  this.u_ModelMatrix;
  this.u_MvpMatrix;
  this.u_NormalMatrix;

  //  ... for Phong light source:
  this.u_Lamp0Pos;
  this.u_Lamp0Amb;
  this.u_Lamp0Diff;
  this.u_Lamp0Spec;

  // ... for Phong material/reflectance:
  this.u_Ke;
  this.u_Ka;
  this.u_Kd;
  this.u_Ks;
  //this.u_Kshiny;

  this.vboPostions;
  this.vboIndices;
  this.vboVerts;

  this.a_Position
  this.a_Normal;
  this.indexBuffer;
  this.vboLoc;

  //---------------------- Uniform locations &values in our shaders
  this.modelMatrix = new Matrix4();  // Model matrix
  this.mvpMatrix = new Matrix4();    // Model view projection matrix
  this.normalMatrix = new Matrix4(); // Transformation matrix for normals
};


VBObox2.prototype.init = function () {
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(this.constructor.name +
      '.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }

  gl.program = this.shaderLoc;

  // Get the storage locations of uniform variables: the scene
  this.u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
  this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  this.u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  this.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!this.u_ModelMatrix || !this.u_MvpMatrix || !this.u_NormalMatrix) {
    console.log('Failed to get matrix storage locations');
    return;
  }
  //  ... for Phong light source:
  this.u_Lamp0Pos = gl.getUniformLocation(gl.program, 'u_Lamp0Pos');
  this.u_Lamp0Ambi = gl.getUniformLocation(gl.program, 'u_Lamp0Amb');
  this.u_Lamp0Diff = gl.getUniformLocation(gl.program, 'u_Lamp0Diff');
  this.u_Lamp0Spec = gl.getUniformLocation(gl.program, 'u_Lamp0Spec');
  if (!this.u_Lamp0Pos || !this.u_Lamp0Ambi || !this.u_Lamp0Diff || !this.u_Lamp0Spec) {
    console.log('Failed to get the Lamp0 storage locations');
    return;
  }
  // ... for Phong material/reflectance:
  this.u_Ke = gl.getUniformLocation(gl.program, 'u_Ke');
  this.u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
  this.u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
  this.u_Ks = gl.getUniformLocation(gl.program, 'u_Ks');
  //this.u_Kshiny = gl.getUniformLocation(gl.program, 'u_Kshiny');
  if (!this.u_Ke || !this.u_Ka || !this.u_Kd || !this.u_Ks) { // || !this.u_Kshiny) {
    console.log('Failed to get the Phong Reflectance storage locations');
    return;
  }

  // 
  this.vboVerts = this.initVertexBuffers(gl);
  if (this.n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

}

VBObox2.prototype.initVertexBuffers = function (gl) { // Create a sphere
  var SPHERE_DIV = 13;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  this.vboContents = [];
  this.vboIndices = [];

  this.vboPosition_Start = 0;

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      // Vertices
      this.vboContents.push(si * sj);  // X
      this.vboContents.push(cj);       // Y
      this.vboContents.push(ci * sj);  // Z
      this.vboContents.push(1.0);  // Z
      // Normal
      this.vboContents.push(si * sj);
      this.vboContents.push(cj);
      this.vboContents.push(ci * sj);
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV + 1) + i;
      p2 = p1 + (SPHERE_DIV + 1);

      this.vboIndices.push(p1);
      this.vboIndices.push(p2);
      this.vboIndices.push(p1 + 1);

      this.vboIndices.push(p1 + 1);
      this.vboIndices.push(p2);
      this.vboIndices.push(p2 + 1);
    }
  }


  this.bear_Start = this.vboContents.length / 7;
  this.bear_Length = teddyBearVerts.length / 7;
  for (i = 0; i < teddyBearVerts.length; i++) {
    this.vboContents.push(teddyBearVerts[i]);
  }

  this.FSIZE = 4;

  // Write the vertex property to buffers (coordinates and normals)
  // Use the same data for each vertex and its normal because the sphere is
  // centered at the origin, and has radius of 1.0.
  // We create two separate buffers so that you can modify normals if you wish.
  // Create a buffer object
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vboContents), gl.STATIC_DRAW);

  // Setup a_Position
  this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (this.a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return false;
  }

  // Setup a_Normal
  this.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (this.a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return false;
  }

  // Write the indices to the buffer object
  this.indexBuffer = gl.createBuffer();
  if (!this.indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vboIndices), gl.STATIC_DRAW);

  return this.vboIndices.length;
}

VBObox2.prototype.switchToMe = function () {
  gl.useProgram(
    this.shaderLoc
  );

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    this.vboLoc
  );

  gl.vertexAttribPointer(
    this.a_Position,
    4,
    gl.FLOAT,
    false,
    this.FSIZE * 7,
    0
  );

  gl.vertexAttribPointer(
    this.a_Normal,
    3,
    gl.FLOAT,
    false,
    this.FSIZE * 7,
    this.FSIZE * 4
  );

  // --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_Position);
  gl.enableVertexAttribArray(this.a_Normal);

  gl.bindBuffer(
    gl.ELEMENT_ARRAY_BUFFER,
    this.indexBuffer
  );

  // Position the first light source in World coords: 
  gl.uniform4f(this.u_Lamp0Pos, g_lamp0.I_pos[0], g_lamp0.I_pos[1], g_lamp0.I_pos[2], g_lamp0.I_pos[3]);
  gl.uniform3f(this.u_Lamp0Ambi, g_lamp0.I_ambi[0], g_lamp0.I_ambi[1], g_lamp0.I_ambi[2]);
  gl.uniform3f(this.u_Lamp0Diff, g_lamp0.I_diff[0], g_lamp0.I_diff[1], g_lamp0.I_diff[2]);
  gl.uniform3f(this.u_Lamp0Spec, g_lamp0.I_spec[0], g_lamp0.I_spec[1], g_lamp0.I_spec[2]);

  // Set up mvp matrix
  this.mvpMatrix.set(mvpMatrix);

  // Pass the eye position to u_eyePosWorld
  gl.uniform4f(this.u_eyePosWorld, eyePosWorld[0], eyePosWorld[1], eyePosWorld[2], 1);
}

VBObox2.prototype.isReady = function () {
  var isOK = true;
  if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
    console.log(this.constructor.name +
      '.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
    console.log(this.constructor.name +
      '.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  if (gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING) != this.indexBuffer) {
    console.log(this.constructor.name +
      '.isReady() false: vbo at this.indexBuffer not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox2.prototype.adjust = function () {
  if (this.isReady() == false) {
    console.log(
      'ERROR! before' + this.constructor.name +
      '.adjust() call you needed to call this.switchToMe()!!'
    );
  }

  // Transfer new VBOcontents to GPU-------------------------------------------- 
  // this.reload();
}

VBObox2.prototype.draw = function () {
  if (this.isReady() == false) {
    console.log('ERROR! before' + this.constructor.name +
      '.draw() call you needed to call this.switchToMe()!!');
  }

  // Draw the cube
  this.modelMatrix.setIdentity();
  pushMatrix(this.modelMatrix);
  {
    this.modelMatrix.setRotate(g_angleNow, 0, 0, 1);
    this.drawSphere(g_matl0);
  }
  this.modelMatrix = popMatrix();
  pushMatrix(this.modelMatrix);
  {
    this.modelMatrix.translate(-2.0, 2.0, 0.8);
    this.modelMatrix.rotate(90.0, 1, 0, 0);
    this.modelMatrix.rotate(g_bearAngle1, 0, 1, 0);

    this.drawBear(g_matl1);

    pushMatrix(this.modelMatrix);
    {
      this.modelMatrix.scale(0.3, 0.3, 0.3);
      this.modelMatrix.translate(-2.5, 1.5, 0.4);
      this.modelMatrix.rotate(g_bearAngle2, 0, 1, 0);
      this.drawBear(g_matl1);
      pushMatrix(this.modelMatrix);
      {
        this.modelMatrix.scale(0.3, 0.3, 0.3);
        this.modelMatrix.translate(-2.5, 1.5, 0.4);
        this.modelMatrix.rotate(g_bearAngle3, 0, 1, 0);
        this.drawBear(g_matl1);
      }
      this.modelMatrix = popMatrix();
    }
    this.modelMatrix = popMatrix();
  }
  this.modelMatrix = popMatrix();
}

VBObox2.prototype.drawSphere = function (matl) {
  // Update the mvp matrix
  this.mvpMatrix.set(mvpMatrix);
  this.mvpMatrix.multiply(this.modelMatrix);

  // Set up normal matrix
  this.normalMatrix.setInverseOf(this.modelMatrix);
  this.normalMatrix.transpose();

  gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

  // Set the Phong materials' reflectance:
  var Ke = matl.K_emit;
  var Ka = matl.K_ambi;
  var Kd = matl.K_diff;
  var Ks = matl.K_spec;
  var Kshiny = matl.K_shiny;
  gl.uniform3f(this.u_Ke, Ke[0], Ke[1], Ke[2]);       // Ke emissive
  gl.uniform3f(this.u_Ka, Ka[0], Ka[1], Ka[2]);       // Ka ambient
  gl.uniform3f(this.u_Kd, Kd[0], Kd[1], Kd[2]);       // Kd	diffuse
  gl.uniform3f(this.u_Ks, Ks[0], Ks[1], Ks[2]);       // Ks specular
  gl.uniform1i(this.u_Kshiny, Kshiny);               // Kshiny shinyness exponent

  gl.drawElements(gl.TRIANGLES, this.vboVerts, gl.UNSIGNED_SHORT, 0);
}

VBObox2.prototype.drawBear = function (matl) {
  // Update the mvp matrix
  this.mvpMatrix.set(mvpMatrix);
  this.mvpMatrix.multiply(this.modelMatrix);

  // Set up normal matrix
  this.normalMatrix.setInverseOf(this.modelMatrix);
  this.normalMatrix.transpose();

  gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

  // Set the Phong materials' reflectance:
  var Ke = matl.K_emit;
  var Ka = matl.K_ambi;
  var Kd = matl.K_diff;
  var Ks = matl.K_spec;
  var Kshiny = matl.K_shiny;
  gl.uniform3f(this.u_Ke, Ke[0], Ke[1], Ke[2]);       // Ke emissive
  gl.uniform3f(this.u_Ka, Ka[0], Ka[1], Ka[2]);       // Ka ambient
  gl.uniform3f(this.u_Kd, Kd[0], Kd[1], Kd[2]);       // Kd	diffuse
  gl.uniform3f(this.u_Ks, Ks[0], Ks[1], Ks[2]);       // Ks specular
  gl.uniform1i(this.u_Kshiny, Kshiny);               // Kshiny shinyness exponent

  gl.drawArrays(gl.TRIANGLE_STRIP, this.bear_Start, this.bear_Length);
}

VBObox2.prototype.reload = function () {
  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    0,
    this.vboContents
  );

  gl.bufferSubData(
    gl.ELEMENT_ARRAY_BUFFER,
    0,
    this.vboIndices
  );
}

VBObox2.prototype.empty = function () {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  However, make sure this step is reversible by a call to 
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for 
  // uniforms, all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
}

VBObox2.prototype.restore = function () {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
  // all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
}

function VBObox3() {
  // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.

  // Constructor goal: 
  // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
  // written into code) in all other VBObox functions. Keeping all these (initial)
  // values here, in this one coonstrutor function, ensures we can change them 
  // easily WITHOUT disrupting any other code, ever!

  this.VERT_SRC =	//--------------------- VERTEX SHADER source code
    //-------------Set precision.
    // GLSL-ES 2.0 defaults (from spec; '4.5.3 Default Precision Qualifiers'):
    // DEFAULT for Vertex Shaders: 	precision highp float; precision highp int;
    //									precision lowp sampler2D; precision lowp samplerCube;
    // DEFAULT for Fragment Shaders:  UNDEFINED for float; precision mediump int;
    //									precision lowp sampler2D;	precision lowp samplerCube;
    //--------------- GLSL Struct Definitions:
    'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
    '		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
    '		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +
    //																
    //-------------ATTRIBUTES of each vertex, read from our Vertex Buffer Object
    'attribute vec4 a_Position; \n' +		// vertex position (model coord sys)
    'attribute vec3 a_Normal; \n' +			// vertex normal vector (model coord sys)
    //
    //-------------UNIFORMS: values set from JavaScript before a drawing command.
    // 	'uniform vec3 u_Kd; \n' +						// Phong diffuse reflectance for the 
    // entire shape. Later: as vertex attrib.
    'uniform MatlT u_MatlSet[1];\n' +		// Array of all materials.
    'uniform mat4 u_MvpMatrix; \n' +
    'uniform mat4 u_ModelMatrix; \n' + 		// Model matrix
    'uniform mat4 u_NormalMatrix; \n' +  	// Inverse Transpose of ModelMatrix;
    // (won't distort normal vec directions
    // but it usually WILL change its length)

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
    'varying vec3 v_Kd; \n' +							// Phong Lighting: diffuse reflectance
    // (I didn't make per-pixel Ke,Ka,Ks;
    // we use 'uniform' values instead)
    'varying vec4 v_Position; \n' +
    'varying vec3 v_Normal; \n' +					// Why Vec3? its not a point, hence w==0
    //-----------------------------------------------------------------------------
    'void main() { \n' +
    // Compute CVV coordinate values from our given vertex. This 'built-in'
    // 'varying' value gets interpolated to set screen position for each pixel.
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // Calculate the vertex position & normal vec in the WORLD coordinate system
    // for use as a 'varying' variable: fragment shaders get per-pixel values
    // (interpolated between vertices for our drawing primitive (TRIANGLE)).
    '  v_Position = u_ModelMatrix * a_Position; \n' +
    // 3D surface normal of our vertex, in world coords.  ('varying'--its value
    // gets interpolated (in world coords) for each pixel's fragment shader.
    '  v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));\n' +
    '	 v_Kd = u_MatlSet[0].diff; \n' +		// find per-pixel diffuse reflectance from per-vertex
    // (no per-pixel Ke,Ka, or Ks, but you can do it...)
    //	'  v_Kd = vec3(1.0, 1.0, 0.0); \n'	+ // TEST; color fixed at green
    '}\n';

  // SHADED, sphere-like dots:
  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    //-------------Set precision.
    // GLSL-ES 2.0 defaults (from spec; '4.5.3 Default Precision Qualifiers'):
    // DEFAULT for Vertex Shaders: 	precision highp float; precision highp int;
    //									precision lowp sampler2D; precision lowp samplerCube;
    // DEFAULT for Fragment Shaders:  UNDEFINED for float; precision mediump int;
    //									precision lowp sampler2D;	precision lowp samplerCube;
    // MATCH the Vertex shader precision for float and int:
    'precision highp float;\n' +
    'precision highp int;\n' +
    //
    //--------------- GLSL Struct Definitions:
    'struct LampT {\n' +		// Describes one point-like Phong light source
    '		vec4 pos;\n' +			// (x,y,z,w);
    ' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
    ' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
    '		vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
    '}; \n' +
    //
    'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
    '		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
    '		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +
    //
    //-------------UNIFORMS: values set from JavaScript before a drawing command.
    // first light source: (YOU write a second one...)
    'uniform LampT u_LampSet[1];\n' +		// Array of all light sources.
    'uniform MatlT u_MatlSet[1];\n' +		// Array of all materials.
    //
    'uniform vec4 u_eyePosWorld; \n' + 	// Camera/eye location in world coords.

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader: 
    'varying vec3 v_Normal;\n' +				// Find 3D surface normal at each pix
    'varying vec4 v_Position;\n' +			// pixel's 3D pos too -- in 'world' coords
    'varying vec3 v_Kd;	\n' +						// Find diffuse reflectance K_d per pix
    // Ambient? Emissive? Specular? almost
    // NEVER change per-vertex: I use 'uniform' values

    'void main() { \n' +
    // Normalize! !!IMPORTANT!! TROUBLE if you don't! 
    // normals interpolated for each pixel aren't 1.0 in length any more!
    '  vec4 normal = normalize(vec4(v_Normal, 1.0)); \n' +
    //	'  vec3 normal = v_Normal; \n' +
    // Find the unit-length light dir vector 'L' (surface pt --> light):
    '  vec4 lightDirection = normalize(u_LampSet[0].pos - v_Position);\n' +
    // Find the unit-length eye-direction vector 'V' (surface pt --> camera)
    '  vec4 eyeDirection = normalize(u_eyePosWorld - v_Position); \n' +
    // Find the unit-length reflection vector 'R'
    '  float nDotL = (dot(lightDirection, normal)); \n' +
    '  vec4 R = normalize(((2.0 * nDotL) * normal) - lightDirection);' +
    '  float vDotR = max(dot(eyeDirection, R), 0.0); \n' +
    // The Phong reflectance model: (V*R)^shiny
    '  float e64 = pow(vDotR, float(u_MatlSet[0].shiny));\n' +
    // Calculate the final color from diffuse reflection and ambient reflection
    //  '	 vec3 emissive = u_Ke;' +
    '	 vec3 emissive = 										u_MatlSet[0].emit;' +
    '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
    '  vec3 diffuse = u_LampSet[0].diff * v_Kd * nDotL;\n' +
    '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +
    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
    '}\n';

  this.lamp0 = new LightsT();
  this.matl0 = new Material();

  this.modelMatrix = new Matrix4();  // Model matrix
  this.mvpMatrix = new Matrix4();    // Model view projection matrix
  this.normalMatrix = new Matrix4(); // Transformation matrix for normals
};


VBObox3.prototype.init = function () {
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(this.constructor.name +
      '.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }

  gl.program = this.shaderLoc;

  // Get the storage locations of uniform variables: the scene
  this.u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
  this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  this.u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  this.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!this.u_ModelMatrix || !this.u_MvpMatrix || !this.u_NormalMatrix) {
    console.log('Failed to get matrix storage locations');
    return;
  }

  //  ... for Phong light source:
  this.u_Lamp0Pos = gl.getUniformLocation(gl.program, 'u_LampSet[0].pos');
  this.u_Lamp0Ambi = gl.getUniformLocation(gl.program, 'u_LampSet[0].ambi');
  this.u_Lamp0Diff = gl.getUniformLocation(gl.program, 'u_LampSet[0].diff');
  this.u_Lamp0Spec = gl.getUniformLocation(gl.program, 'u_LampSet[0].spec');
  if (!this.u_Lamp0Pos || !this.u_Lamp0Ambi || !this.u_Lamp0Diff || !this.u_Lamp0Spec) {
    console.log('Failed to get the Lamp0 storage locations');
    return;
  }

  // ... for Phong material/reflectance:
  this.u_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet[0].emit');
  this.u_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet[0].ambi');
  this.u_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet[0].diff');
  this.u_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet[0].spec');
  this.u_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet[0].shiny');
  if (!this.u_Ke || !this.u_Ka || !this.u_Kd || !this.u_Ks || !this.u_Kshiny) {
    console.log('Failed to get the Phong Reflectance storage locations');
    return;
  }

  // 
  this.vboVerts = this.initVertexBuffers(gl);
  if (this.n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

}

VBObox3.prototype.initVertexBuffers = function (gl) { // Create a sphere
  var SPHERE_DIV = 13;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  this.vboContents = [];
  this.vboIndices = [];

  this.vboPosition_Start = 0;

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      // Vertices
      this.vboContents.push(si * sj);  // X
      this.vboContents.push(cj);       // Y
      this.vboContents.push(ci * sj);  // Z
      this.vboContents.push(1.0);  // Z
      // Normal
      this.vboContents.push(si * sj);
      this.vboContents.push(cj);
      this.vboContents.push(ci * sj);
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV + 1) + i;
      p2 = p1 + (SPHERE_DIV + 1);

      this.vboIndices.push(p1);
      this.vboIndices.push(p2);
      this.vboIndices.push(p1 + 1);

      this.vboIndices.push(p1 + 1);
      this.vboIndices.push(p2);
      this.vboIndices.push(p2 + 1);
    }
  }


  this.bear_Start = this.vboContents.length / 7;
  this.bear_Length = teddyBearVerts.length / 7;
  for (i = 0; i < teddyBearVerts.length; i++) {
    this.vboContents.push(teddyBearVerts[i]);
  }

  this.FSIZE = 4;

  // Write the vertex property to buffers (coordinates and normals)
  // Use the same data for each vertex and its normal because the sphere is
  // centered at the origin, and has radius of 1.0.
  // We create two separate buffers so that you can modify normals if you wish.
  // Create a buffer object
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vboContents), gl.STATIC_DRAW);

  // Setup a_Position
  this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (this.a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return false;
  }

  // Setup a_Normal
  this.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (this.a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return false;
  }

  // Write the indices to the buffer object
  this.indexBuffer = gl.createBuffer();
  if (!this.indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vboIndices), gl.STATIC_DRAW);

  return this.vboIndices.length;
}

VBObox3.prototype.switchToMe = function () {
  gl.useProgram(
    this.shaderLoc
  );

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    this.vboLoc
  );

  gl.vertexAttribPointer(
    this.a_Position,
    4,
    gl.FLOAT,
    false,
    this.FSIZE * 7,
    0
  );

  gl.vertexAttribPointer(
    this.a_Normal,
    3,
    gl.FLOAT,
    false,
    this.FSIZE * 7,
    this.FSIZE * 4
  );

  // --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_Position);
  gl.enableVertexAttribArray(this.a_Normal);

  gl.bindBuffer(
    gl.ELEMENT_ARRAY_BUFFER,
    this.indexBuffer
  );

  // Position the first light source in World coords: 
  gl.uniform4f(this.u_Lamp0Pos, g_lamp0.I_pos[0], g_lamp0.I_pos[1], g_lamp0.I_pos[2], g_lamp0.I_pos[3]);
  gl.uniform3f(this.u_Lamp0Ambi, g_lamp0.I_ambi[0], g_lamp0.I_ambi[1], g_lamp0.I_ambi[2]);
  gl.uniform3f(this.u_Lamp0Diff, g_lamp0.I_diff[0], g_lamp0.I_diff[1], g_lamp0.I_diff[2]);
  gl.uniform3f(this.u_Lamp0Spec, g_lamp0.I_spec[0], g_lamp0.I_spec[1], g_lamp0.I_spec[2]);

  // Set up mvp matrix
  this.mvpMatrix.set(mvpMatrix);

  // Pass the eye position to u_eyePosWorld
  gl.uniform4f(this.u_eyePosWorld, eyePosWorld[0], eyePosWorld[1], eyePosWorld[2], 1);
}

VBObox3.prototype.isReady = function () {
  var isOK = true;
  if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
    console.log(this.constructor.name +
      '.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
    console.log(this.constructor.name +
      '.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  if (gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING) != this.indexBuffer) {
    console.log(this.constructor.name +
      '.isReady() false: vbo at this.indexBuffer not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox3.prototype.adjust = function () {
  if (this.isReady() == false) {
    console.log(
      'ERROR! before' + this.constructor.name +
      '.adjust() call you needed to call this.switchToMe()!!'
    );
  }

  // Transfer new VBOcontents to GPU-------------------------------------------- 
  // this.reload();
}

VBObox3.prototype.draw = function () {
  if (this.isReady() == false) {
    console.log('ERROR! before' + this.constructor.name +
      '.draw() call you needed to call this.switchToMe()!!');
  }

  // Draw the cube
  this.modelMatrix.setIdentity();
  pushMatrix(this.modelMatrix);
  {
    this.modelMatrix.setRotate(g_angleNow, 0, 0, 1);
    this.drawSphere(g_matl0);
  }
  this.modelMatrix = popMatrix();
  pushMatrix(this.modelMatrix);
  {
    this.modelMatrix.translate(-2.0, 2.0, 0.8);
    this.modelMatrix.rotate(90.0, 1, 0, 0);
    this.modelMatrix.rotate(g_bearAngle1, 0, 1, 0);

    this.drawBear(g_matl1);

    pushMatrix(this.modelMatrix);
    {
      this.modelMatrix.scale(0.3, 0.3, 0.3);
      this.modelMatrix.translate(-2.5, 1.5, 0.4);
      this.modelMatrix.rotate(g_bearAngle2, 0, 1, 0);
      this.drawBear(g_matl1);
      pushMatrix(this.modelMatrix);
      {
        this.modelMatrix.scale(0.3, 0.3, 0.3);
        this.modelMatrix.translate(-2.5, 1.5, 0.4);
        this.modelMatrix.rotate(g_bearAngle3, 0, 1, 0);
        this.drawBear(g_matl1);
      }
      this.modelMatrix = popMatrix();
    }
    this.modelMatrix = popMatrix();
  }
  this.modelMatrix = popMatrix();
}

VBObox3.prototype.drawSphere = function (matl) {
  // Update the mvp matrix
  this.mvpMatrix.set(mvpMatrix);
  this.mvpMatrix.multiply(this.modelMatrix);

  // Set up normal matrix
  this.normalMatrix.setInverseOf(this.modelMatrix);
  this.normalMatrix.transpose();

  gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

  // Set the Phong materials' reflectance:
  var Ke = matl.K_emit;
  var Ka = matl.K_ambi;
  var Kd = matl.K_diff;
  var Ks = matl.K_spec;
  var Kshiny = matl.K_shiny;
  gl.uniform3f(this.u_Ke, Ke[0], Ke[1], Ke[2]);       // Ke emissive
  gl.uniform3f(this.u_Ka, Ka[0], Ka[1], Ka[2]);       // Ka ambient
  gl.uniform3f(this.u_Kd, Kd[0], Kd[1], Kd[2]);       // Kd	diffuse
  gl.uniform3f(this.u_Ks, Ks[0], Ks[1], Ks[2]);       // Ks specular
  gl.uniform1i(this.u_Kshiny, Kshiny);               // Kshiny shinyness exponent

  gl.drawElements(gl.TRIANGLES, this.vboVerts, gl.UNSIGNED_SHORT, 0);
}

VBObox3.prototype.drawBear = function (matl) {
  // Update the mvp matrix
  this.mvpMatrix.set(mvpMatrix);
  this.mvpMatrix.multiply(this.modelMatrix);

  // Set up normal matrix
  this.normalMatrix.setInverseOf(this.modelMatrix);
  this.normalMatrix.transpose();

  gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

  // Set the Phong materials' reflectance:
  var Ke = matl.K_emit;
  var Ka = matl.K_ambi;
  var Kd = matl.K_diff;
  var Ks = matl.K_spec;
  var Kshiny = matl.K_shiny;
  gl.uniform3f(this.u_Ke, Ke[0], Ke[1], Ke[2]);       // Ke emissive
  gl.uniform3f(this.u_Ka, Ka[0], Ka[1], Ka[2]);       // Ka ambient
  gl.uniform3f(this.u_Kd, Kd[0], Kd[1], Kd[2]);       // Kd	diffuse
  gl.uniform3f(this.u_Ks, Ks[0], Ks[1], Ks[2]);       // Ks specular
  gl.uniform1i(this.u_Kshiny, Kshiny);               // Kshiny shinyness exponent

  gl.drawArrays(gl.TRIANGLE_STRIP, this.bear_Start, this.bear_Length);
}

VBObox3.prototype.empty = function () {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  However, make sure this step is reversible by a call to 
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for 
  // uniforms, all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
}

VBObox3.prototype.restore = function () {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
  // all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
}
//=============================================================================
//=============================================================================
function VBObox4() {
  // Gouraud Shading Box

  this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
    //-------------ATTRIBUTES: of each vertex, read from our Vertex Buffer Object
    'attribute vec4 a_Position; \n' +		// vertex position (model coord sys)
    'attribute vec3 a_Normal; \n' +			// vertex normal vector (model coord sys)
    //  'attribute vec4 a_color;\n' + 		// What would 'per-vertex colors' mean in
    //	in Phong lighting implementation?  disable!
    // (LATER: replace with attrib. for diffuse reflectance?)
    //-------------UNIFORMS: values set from JavaScript before a drawing command.
    'uniform vec3 u_Kd; \n' +						//	Instead, we'll use this 'uniform' 
    // Phong diffuse reflectance for the entire shape
    'uniform mat4 u_MvpMatrix; \n' +
    'uniform mat4 u_ModelMatrix; \n' + 		// Model matrix
    'uniform mat4 u_NormalMatrix; \n' +  	// Inverse Transpose of ModelMatrix;
    // (doesn't distort normal directions)

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
    'varying vec3 v_Kd; \n' +							// Phong Lighting: diffuse reflectance
    // (I didn't make per-pixel Ke,Ka,Ks;
    // we use 'uniform' values instead)
    'varying vec4 v_Position; \n' +
    'varying vec3 v_Normal; \n' +					// Why Vec3? its not a point, hence w==0
    //---------------
    'void main() { \n' +
    // Compute CVV coordinate values from our given vertex. This 'built-in'
    // per-vertex value gets interpolated to set screen position for each pixel.
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // Calculate the vertex position & normal vec in the WORLD coordinate system
    // for use as a 'varying' variable: fragment shaders get per-pixel values
    // (interpolated between vertices for our drawing primitive (TRIANGLE)).
    '  v_Position = u_ModelMatrix * a_Position; \n' +
    // 3D surface normal of our vertex, in world coords.  ('varying'--its value
    // gets interpolated (in world coords) for each pixel's fragment shader.
    '  v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));\n' +
    '	 v_Kd = u_Kd; \n' +		// find per-pixel diffuse reflectance from per-vertex
    '}\n';

  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    '#ifdef GL_ES\n' +
    'precision highp float;\n' +
    'precision highp int;\n' +
    '#endif\n' +

    // first light source: (YOU write a second one...)
    'uniform vec4 u_Lamp0Pos;\n' + 			// Phong Illum: position
    'uniform vec3 u_Lamp0Amb;\n' +   		// Phong Illum: ambient
    'uniform vec3 u_Lamp0Diff;\n' +     // Phong Illum: diffuse
    'uniform vec3 u_Lamp0Spec;\n' +			// Phong Illum: specular

    // first material definition: you write 2nd, 3rd, etc.
    'uniform vec3 u_Ke;\n' +						// Phong Reflectance: emissive
    'uniform vec3 u_Ka;\n' +						// Phong Reflectance: ambient
    // Phong Reflectance: diffuse? -- use v_Kd instead for per-pixel value
    'uniform vec3 u_Ks;\n' +						// Phong Reflectance: specular
    'uniform int u_Kshiny;\n' +				// Phong Reflectance: 1 < shiny < 200
    //	
    'uniform vec4 u_eyePosWorld; \n' + 	// Camera/eye location in world coords.

    'varying vec3 v_Normal;\n' +				// Find 3D surface normal at each pix
    'varying vec4 v_Position;\n' +			// pixel's 3D pos too -- in 'world' coords
    'varying vec3 v_Kd;	\n' +						// Find diffuse reflectance K_d per pix
    // Ambient? Emissive? Specular? almost
    // NEVER change per-vertex: I use'uniform'

    'void main() { \n' +
    // Normalize! !!IMPORTANT!! TROUBLE if you don't! 
    // normals interpolated for each pixel aren't 1.0 in length any more!
    '  vec3 normal = normalize(v_Normal); \n' +
    //	'  vec3 normal = v_Normal; \n' +
    // Calculate the light direction vector, make it unit-length (1.0).
    '  vec3 lightDirection = normalize(u_Lamp0Pos.xyz - v_Position.xyz);\n' +
    // The dot product of the light direction and the normal
    // (use max() to discard any negatives from lights below the surface)
    // (look in GLSL manual: what other functions would help?)
    '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
    // The Blinn-Phong lighting model computes the specular term faster 
    // because it replaces the (V*R)^shiny weighting with (H*N)^shiny,
    // where 'halfway' vector H has a direction half-way between L and V"
    // H = norm(norm(V) + norm(L)) 
    // (see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
    '  vec3 eyeDirection = normalize(u_eyePosWorld.xyz - v_Position.xyz); \n' +
    '  vec3 R = normalize(((2.0 * nDotL) * normal) - lightDirection);' +
    '  float vDotR = max(dot(eyeDirection, R), 0.0); \n' +
    // The Phong reflectance model: (V*R)^shiny
    '  float e64 = pow(vDotR, float(u_Kshiny));\n' +
    // Can you find a better way to do this? SEE GLSL 'pow()'.
    // Calculate the final color from diffuse reflection and ambient reflection
    '	 vec3 emissive = u_Ke;' +
    '  vec3 ambient = u_Lamp0Amb * u_Ka;\n' +
    '  vec3 diffuse = u_Lamp0Diff * v_Kd * nDotL;\n' +
    '	 vec3 speculr = u_Lamp0Spec * u_Ks * e64;\n' +
    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
    '}\n';

  // Get the storage locations of uniform variables: the scene
  this.u_eyePosWorld;
  this.u_ModelMatrix;
  this.u_MvpMatrix;
  this.u_NormalMatrix;

  //  ... for Phong light source:
  this.u_Lamp0Pos;
  this.u_Lamp0Amb;
  this.u_Lamp0Diff;
  this.u_Lamp0Spec;

  // ... for Phong material/reflectance:
  this.u_Ke;
  this.u_Ka;
  this.u_Kd;
  this.u_Ks;
  this.u_Kshiny;

  this.vboPostions;
  this.vboIndices;
  this.vboVerts;

  this.a_Position
  this.a_Normal;
  this.indexBuffer;
  this.vboLoc;

  this.modelMatrix = new Matrix4();  // Model matrix
  this.mvpMatrix = new Matrix4();    // Model view projection matrix
  this.normalMatrix = new Matrix4(); // Transformation matrix for normals
};


VBObox4.prototype.init = function () {
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(this.constructor.name +
      '.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }

  gl.program = this.shaderLoc;

  // Get the storage locations of uniform variables: the scene
  this.u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
  this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  this.u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  this.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!this.u_ModelMatrix || !this.u_MvpMatrix || !this.u_NormalMatrix) {
    console.log('Failed to get matrix storage locations');
    return;
  }
  //  ... for Phong light source:
  this.u_Lamp0Pos = gl.getUniformLocation(gl.program, 'u_Lamp0Pos');
  this.u_Lamp0Ambi = gl.getUniformLocation(gl.program, 'u_Lamp0Amb');
  this.u_Lamp0Diff = gl.getUniformLocation(gl.program, 'u_Lamp0Diff');
  this.u_Lamp0Spec = gl.getUniformLocation(gl.program, 'u_Lamp0Spec');
  if (!this.u_Lamp0Pos || !this.u_Lamp0Ambi || !this.u_Lamp0Diff || !this.u_Lamp0Spec) {
    console.log('Failed to get the Lamp0 storage locations');
    return;
  }
  // ... for Phong material/reflectance:
  this.u_Ke = gl.getUniformLocation(gl.program, 'u_Ke');
  this.u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
  this.u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
  this.u_Ks = gl.getUniformLocation(gl.program, 'u_Ks');
  this.u_Kshiny = gl.getUniformLocation(gl.program, 'u_Kshiny');

  if (!this.u_Ke || !this.u_Ka || !this.u_Kd || !this.u_Ks || !this.u_Kshiny) {
    console.log('Failed to get the Phong Reflectance storage locations');
    return;
  }

  // 
  this.vboVerts = this.initVertexBuffers(gl);
  if (this.n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

}

VBObox4.prototype.initVertexBuffers = function (gl) { // Create a sphere
  var SPHERE_DIV = 13;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  this.vboContents = [];
  this.vboIndices = [];

  this.vboPosition_Start = 0;

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      // Vertices
      this.vboContents.push(si * sj);  // X
      this.vboContents.push(cj);       // Y
      this.vboContents.push(ci * sj);  // Z
      this.vboContents.push(1.0);  // Z
      // Normal
      this.vboContents.push(si * sj);
      this.vboContents.push(cj);
      this.vboContents.push(ci * sj);
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV + 1) + i;
      p2 = p1 + (SPHERE_DIV + 1);

      this.vboIndices.push(p1);
      this.vboIndices.push(p2);
      this.vboIndices.push(p1 + 1);

      this.vboIndices.push(p1 + 1);
      this.vboIndices.push(p2);
      this.vboIndices.push(p2 + 1);
    }
  }


  this.bear_Start = this.vboContents.length / 7;
  this.bear_Length = teddyBearVerts.length / 7;
  for (i = 0; i < teddyBearVerts.length; i++) {
    this.vboContents.push(teddyBearVerts[i]);
  }

  this.FSIZE = 4;

  // Write the vertex property to buffers (coordinates and normals)
  // Use the same data for each vertex and its normal because the sphere is
  // centered at the origin, and has radius of 1.0.
  // We create two separate buffers so that you can modify normals if you wish.
  // Create a buffer object
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vboContents), gl.STATIC_DRAW);

  // Setup a_Position
  this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (this.a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return false;
  }

  // Setup a_Normal
  this.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (this.a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return false;
  }

  // Write the indices to the buffer object
  this.indexBuffer = gl.createBuffer();
  if (!this.indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vboIndices), gl.STATIC_DRAW);

  return this.vboIndices.length;
}

VBObox4.prototype.switchToMe = function () {
  gl.useProgram(
    this.shaderLoc
  );

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    this.vboLoc
  );

  gl.vertexAttribPointer(
    this.a_Position,
    4,
    gl.FLOAT,
    false,
    this.FSIZE * 7,
    0
  );

  gl.vertexAttribPointer(
    this.a_Normal,
    3,
    gl.FLOAT,
    false,
    this.FSIZE * 7,
    this.FSIZE * 4
  );

  // --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_Position);
  gl.enableVertexAttribArray(this.a_Normal);

  gl.bindBuffer(
    gl.ELEMENT_ARRAY_BUFFER,
    this.indexBuffer
  );

  // Position the first light source in World coords: 
  gl.uniform4f(this.u_Lamp0Pos, g_lamp0.I_pos[0], g_lamp0.I_pos[1], g_lamp0.I_pos[2], g_lamp0.I_pos[3]);
  gl.uniform3f(this.u_Lamp0Ambi, g_lamp0.I_ambi[0], g_lamp0.I_ambi[1], g_lamp0.I_ambi[2]);
  gl.uniform3f(this.u_Lamp0Diff, g_lamp0.I_diff[0], g_lamp0.I_diff[1], g_lamp0.I_diff[2]);
  gl.uniform3f(this.u_Lamp0Spec, g_lamp0.I_spec[0], g_lamp0.I_spec[1], g_lamp0.I_spec[2]);

  // Set up mvp matrix
  this.mvpMatrix.set(mvpMatrix);

  // Pass the eye position to u_eyePosWorld
  gl.uniform4f(this.u_eyePosWorld, eyePosWorld[0], eyePosWorld[1], eyePosWorld[2], 1);
}

VBObox4.prototype.isReady = function () {
  var isOK = true;
  if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
    console.log(this.constructor.name +
      '.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
    console.log(this.constructor.name +
      '.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  if (gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING) != this.indexBuffer) {
    console.log(this.constructor.name +
      '.isReady() false: vbo at this.indexBuffer not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox4.prototype.adjust = function () {
  if (this.isReady() == false) {
    console.log(
      'ERROR! before' + this.constructor.name +
      '.adjust() call you needed to call this.switchToMe()!!'
    );
  }

  // Transfer new VBOcontents to GPU-------------------------------------------- 
  // this.reload();
}

VBObox4.prototype.draw = function () {
  if (this.isReady() == false) {
    console.log('ERROR! before' + this.constructor.name +
      '.draw() call you needed to call this.switchToMe()!!');
  }

  // Draw the cube
  this.modelMatrix.setIdentity();
  pushMatrix(this.modelMatrix);
  {
    this.modelMatrix.setRotate(g_angleNow, 0, 0, 1);
    this.drawSphere(g_matl0);
  }
  this.modelMatrix = popMatrix();
  pushMatrix(this.modelMatrix);
  {
    this.modelMatrix.translate(-2.0, 2.0, 0.8);
    this.modelMatrix.rotate(90.0, 1, 0, 0);
    this.modelMatrix.rotate(g_bearAngle1, 0, 1, 0);

    this.drawBear(g_matl1);

    pushMatrix(this.modelMatrix);
    {
      this.modelMatrix.scale(0.3, 0.3, 0.3);
      this.modelMatrix.translate(-2.5, 1.5, 0.4);
      this.modelMatrix.rotate(g_bearAngle2, 0, 1, 0);
      this.drawBear(g_matl1);
      pushMatrix(this.modelMatrix);
      {
        this.modelMatrix.scale(0.3, 0.3, 0.3);
        this.modelMatrix.translate(-2.5, 1.5, 0.4);
        this.modelMatrix.rotate(g_bearAngle3, 0, 1, 0);
        this.drawBear(g_matl1);
      }
      this.modelMatrix = popMatrix();
    }
    this.modelMatrix = popMatrix();
  }
  this.modelMatrix = popMatrix();
}

VBObox4.prototype.drawSphere = function (matl) {
  // Update the mvp matrix
  this.mvpMatrix.set(mvpMatrix);
  this.mvpMatrix.multiply(this.modelMatrix);

  // Set up normal matrix
  this.normalMatrix.setInverseOf(this.modelMatrix);
  this.normalMatrix.transpose();

  gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

  // Set the Phong materials' reflectance:
  var Ke = matl.K_emit;
  var Ka = matl.K_ambi;
  var Kd = matl.K_diff;
  var Ks = matl.K_spec;
  var Kshiny = matl.K_shiny;
  gl.uniform3f(this.u_Ke, Ke[0], Ke[1], Ke[2]);       // Ke emissive
  gl.uniform3f(this.u_Ka, Ka[0], Ka[1], Ka[2]);       // Ka ambient
  gl.uniform3f(this.u_Kd, Kd[0], Kd[1], Kd[2]);       // Kd	diffuse
  gl.uniform3f(this.u_Ks, Ks[0], Ks[1], Ks[2]);       // Ks specular
  gl.uniform1i(this.u_Kshiny, Kshiny);               // Kshiny shinyness exponent

  gl.drawElements(gl.TRIANGLES, this.vboVerts, gl.UNSIGNED_SHORT, 0);
}

VBObox4.prototype.drawBear = function (matl) {
  // Update the mvp matrix
  this.mvpMatrix.set(mvpMatrix);
  this.mvpMatrix.multiply(this.modelMatrix);

  // Set up normal matrix
  this.normalMatrix.setInverseOf(this.modelMatrix);
  this.normalMatrix.transpose();

  gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
  gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

  // Set the Phong materials' reflectance:
  var Ke = matl.K_emit;
  var Ka = matl.K_ambi;
  var Kd = matl.K_diff;
  var Ks = matl.K_spec;
  var Kshiny = matl.K_shiny;
  gl.uniform3f(this.u_Ke, Ke[0], Ke[1], Ke[2]);       // Ke emissive
  gl.uniform3f(this.u_Ka, Ka[0], Ka[1], Ka[2]);       // Ka ambient
  gl.uniform3f(this.u_Kd, Kd[0], Kd[1], Kd[2]);       // Kd	diffuse
  gl.uniform3f(this.u_Ks, Ks[0], Ks[1], Ks[2]);       // Ks specular
  gl.uniform1i(this.u_Kshiny, Kshiny);               // Kshiny shinyness exponent

  gl.drawArrays(gl.TRIANGLE_STRIP, this.bear_Start, this.bear_Length);
}

VBObox4.prototype.reload = function () {
  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    0,
    this.vboContents
  );

  gl.bufferSubData(
    gl.ELEMENT_ARRAY_BUFFER,
    0,
    this.vboIndices
  );
}

VBObox4.prototype.empty = function () {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  However, make sure this step is reversible by a call to 
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for 
  // uniforms, all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
}

VBObox4.prototype.restore = function () {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
  // all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
}
