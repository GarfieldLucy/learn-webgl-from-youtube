var vertextShaderText = `
  precision mediump float;
  attribute vec2 vertPosition;
  attribute vec3 vertColor;
  varying vec3 fragColor;
  void main() {
    fragColor = vertColor;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
  }
`

var fragmentShaderText = `
  precision mediump float;
  varying vec3 fragColor;
  void main () {
    gl_FragColor = vec4(fragColor, 1.0);
  }
`

var initDemo = function () {
  console.log('working!')
  // 初始化 webgl
  var canvas = document.getElementById('game-surface')
  var gl = canvas.getContext('webgl')

  if (!gl) {
    gl = canvas.getContext('experimental-webgl')
  }

  if (!gl) {
    throw new Error('not support webgl!')
  }

  // 背景色
  gl.clearColor(0.75, 0.85, 0.8, 1.0) // set color, not proformed in scren
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  /**
   * create shaders
   */
  var vertexShader = gl.createShader(gl.VERTEX_SHADER)
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

  gl.shaderSource(vertexShader, vertextShaderText)
  gl.shaderSource(fragmentShader, fragmentShaderText)

  gl.compileShader(vertexShader)
  gl.compileShader(fragmentShader)


  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  gl.linkProgram(program)
  gl.validateProgram(program)

  /***
   * create buffer
   */
  var triangleVertices = [
    // X, Y      R, G, B
    0.0, 0.5,    1.0, 1.0, 0.0,
    -0.5, -0.5,  0.7, 0.0, 1.0,
    0.5, -0.5,   0.1, 1.0, 0.6
  ]

  var triangleVertextBufferObject = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertextBufferObject)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)

  var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
  var colorAttribLocation = gl.getAttribLocation(program, 'vertColor')

  gl.vertexAttribPointer(
    positionAttribLocation,
    2,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
  )

  gl.vertexAttribPointer(
    colorAttribLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    2 * Float32Array.BYTES_PER_ELEMENT
  )

  gl.enableVertexAttribArray(positionAttribLocation)
  gl.enableVertexAttribArray(colorAttribLocation)


  gl.useProgram(program)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}