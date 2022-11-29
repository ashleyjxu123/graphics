// Chapter 5: ColoredTriangle.js (c) 2012 matsuda  AND
// Chapter 4: RotatingTriangle_withButtons.js (c) 2012 matsuda
// BasicShapes.js  MODIFIED for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin


//=============================================================================
// GLOBAL VARIABLES
//=============================================================================
// Global vars for mouse click-and-drag for rotation.
var isDrag = false;		// mouse-drag: true when user holds down mouse button
var xMclik = 0.0;			// last mouse button-down position (in CVV coords)
var yMclik = 0.0;
var xMdragTot = 0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot = 0.0;

// Global vars for 3D scene variables (previously used as arguments to draw() function)
var canvas = false;
var gl = false;

// Global vars that hold GPU locations for 'uniform' variables.
// For 3D camera and transforms:
var uLoc_eyePosWorld = false;
var uLoc_ModelMatrix = false;
var uLoc_MvpMatrix = false;
var uLoc_NormalMatrix = false;

// Camera
var eyePosWorld = new Float32Array(3);	// x,y,z in world coords

// Transforms
var modelMatrix = new Matrix4();  // Model matrix
var mvpMatrix = new Matrix4();	// Model-view-projection matrix
var normalMatrix = new Matrix4();	// Transformation matrix for normals

var SHADING_PHONG = 0;
var SHADING_GOURAUD = 1;
var LIGHTING_BLINNPHONG = 0;
var LIGHTING_PHONG = 1;
var shadingSel = SHADING_PHONG;
var lightingSel = LIGHTING_BLINNPHONG;

var worldBox;
var phong_blinnBox;
var phong_phongBox;
var gouraud_blinnBox;
var gouraud_phongBox;

var light0X;
var light0Y;
var light0Z;
var light0Ambi;
var light0Diff;
var light0Spec;

var matlSel0 = MATL_RED_PLASTIC;
var matlSel1 = MATL_RED_PLASTIC;
var g_matl0 = new Material(matlSel0);
var g_matl1 = new Material(matlSel1);

var g_lamp0 = new LightsT();

// ---------------END of global vars----------------------------

//=============================================================================
function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context \'gl\' for WebGL');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.4, 0.4, 0.4, 1.0);
  gl.enable(gl.DEPTH_TEST);

  /*
   * Register the Mouse & Keyboard Event-handlers
   */
  // KEYBOARD
  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);

  // MOUSE
  window.addEventListener("mousedown", myMouseDown);
  window.addEventListener("mousemove", myMouseMove);
  window.addEventListener("mouseup", myMouseUp);
  window.addEventListener("click", myMouseClick);
  window.addEventListener("dblclick", myMouseDblClick);

  // Sliders
  light0X = document.getElementById('light0_x');
  light0Y = document.getElementById('light0_y');
  light0Z = document.getElementById('light0_z');
  light0Ambi = document.getElementById('light0_ambi');
  light0Diff = document.getElementById('light0_diff');
  light0Spec = document.getElementById('light0_spec');

  /*
   * Position the camera in world coordinates
   */
  eyePosWorld.set([4.0, 3.38, 4.05]);

  // Initialize each of our 'vboBox' objects: 
  worldBox = new VBObox0();
  phong_blinnBox = new VBObox1();
  gouraud_blinnBox = new VBObox2();
  phong_phongBox = new VBObox3();
  gouraud_phongBox = new VBObox4();
  worldBox.init(gl);
  phong_blinnBox.init(gl);
  gouraud_blinnBox.init(gl);
  phong_phongBox.init(gl);
  gouraud_phongBox.init(gl);

  resizeCanvas();

  // Start drawing: create 'tick' variable whose value is this function:
  var tick = function () {

    animate()

    // Clear <canvas>  colors AND the depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(
      0,
      0,
      gl.canvas.width,
      gl.canvas.height
    );

    draw();

    requestAnimationFrame(tick, canvas);
  };

  tick();
}

function draw() {
  // Create the perspective matrix
  var aspect = gl.canvas.width / gl.canvas.height;
  mvpMatrix.setPerspective(
    35,
    aspect,
    1.0,
    1000.0
  );

  // Create the view matrix
  mvpMatrix.lookAt(
    eyePosWorld[0], eyePosWorld[1], eyePosWorld[2],
    g_atX, g_atY, g_atZ,
    g_upX, g_upY, g_upZ
  );

  modelMatrix.set(mvpMatrix);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();

  worldBox.switchToMe();
  worldBox.adjust();
  worldBox.draw();

  if (shadingSel == SHADING_PHONG) {
    if (lightingSel == LIGHTING_BLINNPHONG) {
      phong_blinnBox.switchToMe();
      phong_blinnBox.adjust();
      phong_blinnBox.draw();
    } else if (lightingSel == LIGHTING_PHONG) {
      phong_phongBox.switchToMe();
      phong_phongBox.adjust();
      phong_phongBox.draw();
    }
  }
  if (shadingSel == SHADING_GOURAUD) {
    if (lightingSel == LIGHTING_BLINNPHONG) {
      gouraud_blinnBox.switchToMe();
      gouraud_blinnBox.adjust();
      gouraud_blinnBox.draw();
    } else if (lightingSel == LIGHTING_PHONG) {
      gouraud_phongBox.switchToMe();
      gouraud_phongBox.adjust();
      gouraud_phongBox.draw();
    }
  }
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();
var g_rate = 0.05;

var g_camPhi = 0.2173 * Math.PI;
var g_camTheta = 1.3 * Math.PI;
var g_atX = 0.0;
var g_atY = 0.0;
var g_atZ = 0.0;
var g_upX = 0.0;
var g_upY = 0.0;
var g_upZ = 1.0;

var g_cameraRate = 0.01;
var g_cameraMatrix;
var g_lookingMatrix;

var g_lookingVert = 0.0;
var g_lookingHoriz = 0.0;
var g_movingStraight = 0.0;
var g_movingSide = 0.0;
var g_movingVert = 0.0;

var g_bearAngle1 = 0.0;
var g_bearAngle2 = 0.0;
var g_bearAngle3 = 0.0;

var g_angleNow = 0.0;

var ANGLE_STEP = 25.0
function animate() {
  /*
   * Calculate the elapsed time
   */
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  /*
   * Camera Updates
   */
  g_camPhi += g_lookingHoriz * g_cameraRate;
  g_camTheta += g_lookingVert * g_cameraRate;

  var moveStraight = g_movingStraight * g_rate;
  var moveSide = g_movingSide * g_rate;
  var moveVert = g_movingVert * g_rate;

  // Update the camera position
  var camXDiff =
    (moveStraight * Math.cos(g_camPhi))
    - (moveSide * Math.sin(g_camPhi));
  var camYDiff =
    (moveStraight * Math.sin(g_camPhi))
    + (moveSide * Math.cos(g_camPhi));
  var camZDiff =
    (moveStraight * Math.cos(Math.PI - g_camTheta))
    + (moveVert);

  eyePosWorld[0] += camXDiff;
  eyePosWorld[1] += camYDiff;
  eyePosWorld[2] += camZDiff;

  // Update the lookat position
  var atXDiff = Math.cos(g_camPhi) * Math.sin(g_camTheta);
  var atYDiff = Math.sin(g_camPhi) * Math.sin(g_camTheta);
  var atZDiff = Math.cos(g_camTheta);

  g_atX = eyePosWorld[0] + atXDiff;
  g_atY = eyePosWorld[1] + atYDiff;
  g_atZ = eyePosWorld[2] + atZDiff;

  g_angleNow += (ANGLE_STEP * elapsed) / 1000.0;
  g_angleNow = g_angleNow % 360;

  /*
   * Shape Updates
   */
  // Calculate the toruses? tori?
  g_bearAngle1 += (ANGLE_STEP * elapsed) / 1000.0;
  g_bearAngle1 = g_bearAngle1 % 360;

  g_bearAngle2 += (ANGLE_STEP * elapsed) / 1000.0;
  g_bearAngle2 = g_bearAngle2 % 360;

  g_bearAngle3 += (ANGLE_STEP * elapsed) / 1000.0;
  g_bearAngle3 = g_bearAngle3 % 360;
  /*
   * Lamp Updates
   */
  g_lamp0.I_pos[0] = light0X.value;
  g_lamp0.I_pos[1] = light0Y.value;
  g_lamp0.I_pos[2] = light0Z.value;
  g_lamp0.I_pos[3] = 1.0;
  if (g_lamp0.isLit) {
    g_lamp0.I_ambi[0] = light0Ambi.value;
    g_lamp0.I_ambi[1] = light0Ambi.value;
    g_lamp0.I_ambi[2] = light0Ambi.value;
    g_lamp0.I_diff[0] = light0Diff.value;
    g_lamp0.I_diff[1] = light0Diff.value;
    g_lamp0.I_diff[2] = light0Diff.value;
    g_lamp0.I_spec[0] = light0Spec.value;
    g_lamp0.I_spec[1] = light0Spec.value;
    g_lamp0.I_spec[2] = light0Spec.value;
  } else {
    g_lamp0.I_ambi[0] = 0.0;
    g_lamp0.I_ambi[1] = 0.0;
    g_lamp0.I_ambi[2] = 0.0;
    g_lamp0.I_diff[0] = 0.0;
    g_lamp0.I_diff[1] = 0.0;
    g_lamp0.I_diff[2] = 0.0;
    g_lamp0.I_spec[0] = 0.0;
    g_lamp0.I_spec[1] = 0.0;
    g_lamp0.I_spec[2] = 0.0;
  }
}

//==================HTML Button Callbacks
function nextShape() {
  shapeNum += 1;
  if (shapeNum >= shapeMax) shapeNum = 0;
}

function spinDown() {
  ANGLE_STEP -= 25;
}

function spinUp() {
  ANGLE_STEP += 25;
}

function runStop() {
  if (ANGLE_STEP * ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
    ANGLE_STEP = myTmp;
  }
}

function myKeyDown(kev) {
  switch (kev.code) {
    //------------------Look-at keys---------------------
    case "KeyD":
      g_movingSide = 1.0;
      break;
    case "KeyA":
      g_movingSide = -1.0;
      break;
    case "KeyW":
      g_movingStraight = -1.0;
      break;
    case "KeyS":
      g_movingStraight = 1.0;
      break;
    case "KeyQ":
      g_movingVert = 1.0;
      break;
    case "KeyE":
      g_movingVert = -1.0;
      break;
    case "KeyM":
      matlSel0 = (matlSel0 + 1) % MATL_DEFAULT;
      g_matl0.setMatl(matlSel0);
      break;
    case "KeyN":
      matlSel1 = (matlSel1 + 1) % MATL_DEFAULT;
      g_matl1.setMatl(matlSel1);
      break;
    //----------------Look-at keys------------------------
    case "ArrowLeft":
      g_lookingHoriz = 1.0;
      break;
    case "ArrowRight":
      g_lookingHoriz = -1.0;
      break;
    case "ArrowUp":
      g_lookingVert = 1.0;
      break;
    case "ArrowDown":
      g_lookingVert = -1.0;
      break;
    default:
      break;
  }
}

function myKeyUp(kev) {
  switch (kev.code) {
    //------------------Look-at keys---------------------
    case "KeyD":
      g_movingSide = 0.0;
      break;
    case "KeyA":
      g_movingSide = 0.0;
      break;
    case "KeyW":
      g_movingStraight = 0.0;
      break;
    case "KeyS":
      g_movingStraight = 0.0;
      break;
    case "KeyQ":
      g_movingVert = 0.0;
      break;
    case "KeyE":
      g_movingVert = 0.0;
      break;
    //----------------Look-at keys------------------------
    case "ArrowLeft":
      g_lookingHoriz = 0.0;
      break;
    case "ArrowRight":
      g_lookingHoriz = 0.0;
      break;
    case "ArrowUp":
      g_lookingVert = 0.0;
      break;
    case "ArrowDown":
      g_lookingVert = 0.0;
      break;
    default:
      break;
  }
}

var g_xMclik = 0.0;
var g_yMclik = 0.0;
var g_isDrag = false;
var g_sphereMult = 100.0;

function myMouseDown(ev) {
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = gl.canvas.height - (ev.clientY - rect.top);

  // Convert to Canonical View Volume (CVV) coordinates
  var x = (xp - gl.canvas.width / 2) / (gl.canvas.width / 2);
  var y = (yp - gl.canvas.height / 2) / (gl.canvas.height / 2);

  g_isDrag = true;
  g_xMclik = x;
  g_yMclik = y;
};


function myMouseMove(ev) {
  if (g_isDrag == false) {
    return;
  }

  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = gl.canvas.height - (ev.clientY - rect.top);

  // Convert to Canonical View Volume (CVV) coordinates
  var x = (xp - gl.canvas.width / 2) / (gl.canvas.width / 2);
  var y = (yp - gl.canvas.height / 2) / (gl.canvas.height / 2);


  var sphereAngleVert = g_sphereMult * (y - g_yMclik);
  var sphereAngleX = sphereAngleVert * Math.cos(90 - g_camPhi);
  var sphereAngleY = sphereAngleVert * Math.sin(90 - g_camPhi);
  var sphereAngleZ = g_sphereMult * (x - g_xMclik);

  // accumulate any final bit of mouse-dragging we did:
  var tempMatrix = new Matrix4();
  tempMatrix.setIdentity();
  tempMatrix.rotate(sphereAngleX, 1, 0, 0);
  tempMatrix.rotate(sphereAngleY, 0, 1, 0);
  tempMatrix.rotate(sphereAngleZ, 0, 0, 1);

  g_xMclik = x;
  g_yMclik = y;
};

function myMouseUp(ev) {
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = gl.canvas.height - (ev.clientY - rect.top);

  // Convert to Canonical View Volume (CVV) coordinates
  var x = (xp - gl.canvas.width / 2) / (gl.canvas.width / 2);
  var y = (yp - gl.canvas.height / 2) / (gl.canvas.height / 2);

  g_isDrag = false;

  var sphereAngleVert = g_sphereMult * (y - g_yMclik);
  var sphereAngleX = sphereAngleVert * Math.cos(90 - g_camPhi);
  var sphereAngleY = sphereAngleVert * Math.sin(90 - g_camPhi);
  var sphereAngleZ = g_sphereMult * (x - g_xMclik);

  // accumulate any final bit of mouse-dragging we did:
  var tempMatrix = new Matrix4();
  tempMatrix.setIdentity();
  tempMatrix.rotate(sphereAngleX, 1, 0, 0);
  tempMatrix.rotate(sphereAngleY, 0, 1, 0);
  tempMatrix.rotate(sphereAngleZ, 0, 0, 1);

}

function myMouseClick(ev) {
  // Do nothing.
}

function myMouseDblClick(ev) {
  // Do nothing.
}

function resizeCanvas() {
  //Make canvas fill the top 2/3 of our browser window:
  var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
  gl.canvas.width = (innerWidth - xtraMargin);
  gl.canvas.height = (innerHeight * (2 / 3)) - xtraMargin;
}

function PhongShadingToggle() {
  shadingSel = SHADING_PHONG;
}

function GouraudShadingToggle() {
  shadingSel = SHADING_GOURAUD;
}

function BlinnLightingToggle() {
  lightingSel = LIGHTING_BLINNPHONG;
}

function PhongLightingToggle() {
  lightingSel = LIGHTING_PHONG;
}

function light0_toggle() {
  if (g_lamp0.isLit) {
    g_lamp0.isLit = false;
  } else {
    g_lamp0.isLit = true;
  }
}