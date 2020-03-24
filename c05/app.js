var InitDemo = function () {
  loadTextResource('./shader.vs.glsl', function (vsErr, vsTest) {
    if (vsErr) {
      alert (vsErr)
      console.error (vsErr)
    } else {
      loadTextResource ('./shader.fs.glsl', function (fsErr, fsTest) {
        if (fsErr) {
          alert (fsErr)
          console.error (fsErr)
        } else {
          loadJSONResource('./Susan.json', function(modelErr, modelObj) {
            if (modelErr) {
              console.error(modelErr)
            } else {
              loadImage('./SusanTexture.png', function(imgErr, img) {
                if (imgErr) {
                  console.error(imgErr)
                } else {
                  RunDemo(vsTest, fsTest,img, modelObj)
                }
              })
            }
          })
        }
      })
    }
  })
}

var RunDemo = function (vertextShaderText, fragmentShaderText,SusanImage, SunsanModel) {
  // 初始化 webgl
  var canvas = document.getElementById('game-surface')
  var gl = canvas.getContext('webgl')

  if (!gl) {
    gl = canvas.getContext('experimental-webgl')
  }

  if (!gl) {
    throw new Error('not support webgl!')
  }

  gl.clearColor(0.75, 0.85, 0.8, 1.0) // set color, not proformed in scren
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.frontFace(gl.CCW)
  gl.cullFace(gl.BACK)

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

  var boxVertices = SunsanModel.meshes[0].vertices
  var boxIndices = [].concat.apply([], SunsanModel.meshes[0].faces)
  var boxTexCoords = SunsanModel.meshes[0].texturecoords[0]

  var boxVertextBufferObject = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertextBufferObject)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW)

  var texCoordVertexBufferObject = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordVertexBufferObject)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxTexCoords), gl.STATIC_DRAW)

  var boxIndexBufferObject = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW)

  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertextBufferObject)
  var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
  gl.vertexAttribPointer(
    positionAttribLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    3 * Float32Array.BYTES_PER_ELEMENT,
    0
  )
  gl.enableVertexAttribArray(positionAttribLocation)

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordVertexBufferObject)
  var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord')
  gl.vertexAttribPointer(
    texCoordAttribLocation,
    2,
    gl.FLOAT,
    gl.FALSE,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0
  )
  gl.enableVertexAttribArray(texCoordAttribLocation)

  /***
   * create texture
   */
  var boxTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, boxTexture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  gl.texImage2D(
    gl.TEXTURE_2D, 0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    SusanImage)
  gl.bindTexture(gl.TEXTURE_2D, null)

  gl.useProgram(program)

  var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
  var matViewUniformLocation = gl.getUniformLocation(program, 'mView')
  var matProjUniformLocation = gl.getUniformLocation(program, 'mProj')

  var worldMatrix = new Float32Array(16)
  var viewMatrix = new Float32Array(16)
  var projMatrix = new Float32Array(16)
  mat4.identity(worldMatrix)
  mat4.lookAt(viewMatrix, [0, 0, -7], [0, 0, 0], [0, 1, 0])
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.clientHeight, 0.1, 1000.0)

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix)
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix)

  var xRotationMatrix = new Float32Array(16)
  var yRotationMatrix = new Float32Array(16)
  /**
   * main render loop
   */
  var identityMatrix = new Float32Array(16)
  mat4.identity(identityMatrix)
  var angle = 0
  var loop = function () {
    angle = performance.now() / 1000 / 6 * 2 * Math.PI
    mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0])
    mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0])
    mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix) // 矩阵相乘
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)

    gl.clearColor(0.75, 0.85, 0.8, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    gl.bindTexture(gl.TEXTURE_2D, boxTexture)
    gl.activeTexture(gl.TEXTURE0)
    gl.drawElements(gl.TRIANGLES, boxIndices.length,gl.UNSIGNED_SHORT, 0)

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)

}