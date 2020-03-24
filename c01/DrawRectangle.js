function main () {
  const canvas = document.getElementById('example')
  if (!canvas) {
    throw new Error ('error ocurr')
  }
  var ctx = canvas.getContext('2d')
  ctx.fillRect(25, 25, 100, 100);
  ctx.clearRect(45, 45, 60, 60);
  ctx.strokeRect(50, 50, 50, 50);
}