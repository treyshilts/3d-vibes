document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menu-container');
  const playButton = document.getElementById('play-button');
  const controls = document.getElementById('controls');
  const buttons = document.querySelectorAll('#controls button');

  let gameStarted = false;

  const enableControls = () => {
    buttons.forEach((btn) => btn.removeAttribute('disabled'));
    controls.classList.add('visible'); // Show controls
    gameStarted = true;
  };

  playButton.addEventListener('click', () => {
    menuContainer.classList.add('hidden'); // Hide menu
    enableControls(); // Show and enable controls
  });

  // Game setup
  const canvas = document.getElementById('threejs-scene');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.set(0, 2, 3.5);
  camera.lookAt(0, 0.5, 0);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(330, 330);
  scene.background = new THREE.Color(0x87ceeb);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x7cfc00 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const humanoid = (() => {
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    body.position.y = 0.75;

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      body.material
    );
    head.position.y = 1.5;

    const group = new THREE.Group();
    group.add(body, head);
    return group;
  })();

  scene.add(humanoid);

  let movingForward = false,
    movingBackward = false,
    turningLeft = false,
    turningRight = false;
  const moveSpeed = 0.05,
    rotationSpeed = 0.025;

  const animate = () => {
    if (gameStarted) {
      if (movingForward) humanoid.position.z -= moveSpeed;
      if (movingBackward) humanoid.position.z += moveSpeed;
      if (turningLeft) humanoid.rotation.y += rotationSpeed;
      if (turningRight) humanoid.rotation.y -= rotationSpeed;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  const setMovement = (type, value) => {
    if (type === 'forward') movingForward = value;
    if (type === 'backward') movingBackward = value;
    if (type === 'left') turningLeft = value;
    if (type === 'right') turningRight = value;
  };

  ['move-forward', 'move-backward', 'turn-left', 'turn-right'].forEach((id) => {
    const [type] = id.split('-').slice(1);
    const button = document.getElementById(id);
    button.addEventListener('mousedown', () => setMovement(type, true));
    button.addEventListener('mouseup', () => setMovement(type, false));
    button.addEventListener('mouseleave', () => setMovement(type, false));
  });
});
