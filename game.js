let mixer = null;
let walkAction = null;
let redSphere = null;

let isWalking = false; // Tracks whether Stevey is currently walking  

let score = 0; // Default score

const updateScore = (newScore) => {
    score = newScore;
    document.getElementById('score').textContent = score;
};

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('threejs-scene');
    const scene = new THREE.Scene();

    // Add the sky sphere
    const skyTexture = new THREE.TextureLoader().load('https://treyshilts.github.io/3d-vibes/skybox.jpg');
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32); // Increased size
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide, // Render inside the sphere
    });
    const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skySphere);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.5, 500);
    camera.position.set(0, 2, -3.5);
    camera.lookAt(0, 0.5, 0);

   // Renderer setup
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setSize(140, 140); // Render at a small resolution
renderer.setPixelRatio(1); // Avoid high DPI scaling

// Scale up with CSS
canvas.style.width = '420px'; // Display size
canvas.style.height = '420px'; // Display size

// Disable image smoothing for a pixelated look
canvas.style.imageRendering = 'pixelated';
canvas.style.imageRendering = '-moz-crisp-edges'; // Firefox
canvas.style.imageRendering = 'crisp-edges'; // Other browsers



    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(5, 10, 5);
    scene.add(light);
// Light2
    const light2 = new THREE.DirectionalLight(0xffffff, 0.7);
    light2.position.set(-5, 10, -5);
    scene.add(light2);
// Add ambient light to the scene
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
// Color and intensity
// scene.add(ambientLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/grass.png');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20);

    const groundMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

// Tree positions
// Tree Positions
const treePositions = [{ x: -2, z: -4 }, { x: 3, z: 4 }];
const biggerTreePositions = [{ x: 5, z: 6 }, { x: -4, z: -7 }];
const smallerTreePositions = [
  { x: 4, z: 3 },
  { x: -6, z: 7 },
  { x: 2, z: -5 },
  { x: -8, z: 2 },
  { x: 6, z: -3 },
  { x: -3, z: -6 },
];
const largestTreePositions = [
  { x: -10, z: 8 },
  { x: 7, z: -9 },
  { x: 0, z: 10 },
];

const trunks = []; // Array to store tree trunks for collision detection

// Function to create a tree
const createTree = (x, z, scale = 1) => {
  const barkTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/bark.png');
  const trunkMaterial = new THREE.MeshLambertMaterial({ map: barkTexture });
  const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 2 * scale, 8);
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(x, 1 * scale, z); // Adjust based on scale
  trunks.push(trunk); // Add trunk to array
  scene.add(trunk);

  const bushTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/bush.png');
  const leavesMaterial = new THREE.MeshLambertMaterial({ map: bushTexture });
  const leavesGeometry = new THREE.ConeGeometry(1 * scale, 2 * scale, 5);
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leaves.position.set(x, 2 * scale, z); // Adjust based on scale
  scene.add(leaves);
};

// Add Normal Trees
treePositions.forEach(({ x, z }) => createTree(x, z));

// Add Bigger Trees (10% larger)
biggerTreePositions.forEach(({ x, z }) => createTree(x, z, 1.1)); // Scale = 1.1

// Add Smaller Trees (10% smaller)
smallerTreePositions.forEach(({ x, z }) => createTree(x, z, 0.9)); // Scale = 0.9

// Add Largest Trees (30% larger)
largestTreePositions.forEach(({ x, z }) => createTree(x, z, 1.3)); // Scale = 1.3




    // Walls
    const walls = [];

    const createWall = (x, y, z, size) => {
      const wallGeometry = new THREE.BoxGeometry(size, size, size);
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(x, y, z);
      walls.push(wall);
      scene.add(wall);
    };

// Wall positions
const wallPositions = [];



    wallPositions.forEach(({ x, y, z, size }) => createWall(x, y, z, size));
const createTexturedCube = (x, y, z) => {
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const materials = [
    new THREE.MeshLambertMaterial({ map: textureLoader.load('https://treyshilts.github.io/3d-vibes/467E67FD_c.bmp') }), // Front
    new THREE.MeshLambertMaterial({ map: textureLoader.load('https://treyshilts.github.io/3d-vibes/467E67FD_c.bmp') }), // Back
    new THREE.MeshLambertMaterial({ map: textureLoader.load('https://treyshilts.github.io/3d-vibes/grass.png') }),      // Top
    new THREE.MeshLambertMaterial({ map: textureLoader.load('https://treyshilts.github.io/3d-vibes/grass.png') }),      // Bottom
    new THREE.MeshLambertMaterial({ map: textureLoader.load('https://treyshilts.github.io/3d-vibes/467E67FD_c.bmp') }), // Left
    new THREE.MeshLambertMaterial({ map: textureLoader.load('https://treyshilts.github.io/3d-vibes/467E67FD_c.bmp') })  // Right
  ];
  const cube = new THREE.Mesh(boxGeometry, materials);
  cube.position.set(x, y, z);
  scene.add(cube);
};

// Coordinates for the 6x8 grid
const coordinates = [];

// Add cubes to the scene
coordinates.forEach(([x, y, z]) => createTexturedCube(x, y, z));

const createDiagonalRamp = (x, y, z) => {
  const rampGeometry = new THREE.Geometry();

  // Define vertices
  rampGeometry.vertices.push(
    new THREE.Vector3(0, 0, 0),    // Bottom front-left
    new THREE.Vector3(1, 0, 0),    // Bottom front-right
    new THREE.Vector3(1, 0, -1),   // Bottom back-right
    new THREE.Vector3(0, 0, -1),   // Bottom back-left
    new THREE.Vector3(0, 1, -1),   // Top back-left
    new THREE.Vector3(1, 1, -1)    // Top back-right
  );

  // Define faces
  rampGeometry.faces.push(
    new THREE.Face3(0, 1, 4), // Left side triangle
    new THREE.Face3(1, 5, 4), // Right side triangle
    new THREE.Face3(0, 4, 3), // Back triangle
    new THREE.Face3(1, 2, 5), // Front triangle
    new THREE.Face3(4, 5, 3), // Slanted face (grass texture)
    new THREE.Face3(5, 2, 3)  // Slanted face (grass texture)
  );

  // UV mapping
  rampGeometry.faceVertexUvs[0] = [
    // Left side
    [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)],
    [new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)],
    // Back
    [new THREE.Vector2(0, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1)],
    // Front
    [new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(1, 0)],
    // Slanted face 1 (Grass)
    [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)],
    // Slanted face 2 (Grass)
    [new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)],
  ];

  // Load textures
  const sideTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/467E67FD_c.bmp');
  const grassTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/grass.png');

  // Create materials
  const materials = [
    new THREE.MeshLambertMaterial({ map: sideTexture }), // Sides
    new THREE.MeshLambertMaterial({ map: grassTexture }) // Grass
  ];

  // Apply materials to specific faces
  for (let i = 0; i < rampGeometry.faces.length; i++) {
    if (i === 4 || i === 5) {
      rampGeometry.faces[i].materialIndex = 1; // Slanted face (grass texture)
    } else {
      rampGeometry.faces[i].materialIndex = 0; // Other faces (side texture)
    }
  }

  // Create the ramp
  const rampMaterial = new THREE.MeshFaceMaterial(materials);
  const ramp = new THREE.Mesh(rampGeometry, rampMaterial);

  // Position and rotate the ramp
  ramp.position.set(x, y, z);
  ramp.rotation.y = Math.PI; // Rotate 180 degrees around the Y-axis
  scene.add(ramp);
};

// Add the ramp in front of Stevey, rotated 180 degrees
// createDiagonalRamp(0, 0, 2.5);






// Load Stevey
const gltfLoader = new THREE.GLTFLoader();
let stevey = null;

function initializeSkeleton(root) {
    root.traverse((node) => {
        if (node.isSkinnedMesh) {
            node.skeleton.calculateInverses(); // Calculate skeleton inverse matrices
            node.skeleton.pose(); // Reset to the rest pose
            node.frustumCulled = false; // Ensure all SkinnedMeshes are always rendered
        }
    });
}


gltfLoader.load(
  'https://treyshilts.github.io/3d-vibes/boris.obj.glb',
  (gltf) => {
    stevey = gltf.scene;

    // Set initial position and rotation
    stevey.position.set(0, 0, 0);
    stevey.rotation.set(0, 0, 0);

    // Calculate bounding box and normalize size
    const boundingBox = new THREE.Box3().setFromObject(stevey);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    const maxDimension = Math.max(size.x, size.y, size.z);
    const desiredSize = 2; 
    const scaleFactor = desiredSize / maxDimension;

    stevey.scale.set(scaleFactor, scaleFactor, scaleFactor);
    scene.add(stevey);

    // Initialize skeleton to prevent animation issues
    initializeSkeleton(stevey);

    // Animation setup
    mixer = new THREE.AnimationMixer(stevey);
    if (gltf.animations.length > 0) {
        walkAction = mixer.clipAction(gltf.animations[0]);
        walkAction.loop = THREE.LoopRepeat;
        walkAction.clampWhenFinished = true;
        mixer.timeScale = 2; // Set the animation speed to 2x
    }

    console.log('Model loaded and scaled:', stevey);
    console.log('Animations:', gltf.animations);
console.log('Animations:', gltf.animations);
gltf.animations.forEach((clip, index) => {
    console.log(`Animation ${index}:`, clip);
});


  },
  undefined,
  (error) => {
    console.error('An error occurred loading the model:', error);
  }
);












// Load Cadillac
const loadCadillac = () => {
  const cadillacLoader = new THREE.OBJLoader();
  const cadillacMtlLoader = new THREE.MTLLoader();

  cadillacMtlLoader.load('https://treyshilts.github.io/3d-vibes/cadillac.mtl', (materials) => {
    materials.preload();
    cadillacLoader.setMaterials(materials);
    cadillacLoader.load(
      'https://treyshilts.github.io/3d-vibes/cadillac.obj',
      (object) => {
        object.position.set(12, 0.5, 9); // Set Cadillac position
        object.scale.set(0.0025, 0.0025, 0.0025);
        object.rotation.y = Math.PI / 1.5; // Optional: Rotate for better alignment
        scene.add(object);
      }
    );
  });
};

// Call the function to load the Cadillac
loadCadillac();

// Create the red sphere
const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red color
redSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
redSphere.position.set(5, 0.3, 5); // Set the sphere's position
scene.add(redSphere);

    // Movement
    let movingForward = false;
    let movingBackward = false;
    let turningLeft = false;
    let turningRight = false;
    const moveSpeed = 0.05;
    const rotationSpeed = 0.025;

    const detectCollision = (x, z) => {
      return trunks.some(trunk => {
        const dx = x - trunk.position.x;
        const dz = z - trunk.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < 0.5; // Collision radius
      });
    };

    const detectWallCollision = (x, z) => {
      return walls.some(wall => {
        const dx = x - wall.position.x;
        const dz = z - wall.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < 0.9; // Collision radius for walls
      });
    };

    const moveForward = () => {
      if (!stevey) return;
      const nextX = stevey.position.x + Math.sin(stevey.rotation.y) * moveSpeed;
      const nextZ = stevey.position.z + Math.cos(stevey.rotation.y) * moveSpeed;
      if (!detectCollision(nextX, nextZ) && !detectWallCollision(nextX, nextZ)) {
        stevey.position.x = nextX;
        stevey.position.z = nextZ;
      }
    };

    const moveBackward = () => {
      if (!stevey) return;
      const nextX = stevey.position.x - Math.sin(stevey.rotation.y) * moveSpeed;
      const nextZ = stevey.position.z - Math.cos(stevey.rotation.y) * moveSpeed;
      if (!detectCollision(nextX, nextZ) && !detectWallCollision(nextX, nextZ)) {
        stevey.position.x = nextX;
        stevey.position.z = nextZ;
      }
    };

    const turnLeft = () => {
      if (stevey) stevey.rotation.y += rotationSpeed;
    };

    const turnRight = () => {
      if (stevey) stevey.rotation.y -= rotationSpeed;
    };

    // Animation loop
const animate = () => {
    if (movingForward) moveForward();
    if (movingBackward) moveBackward();
    if (turningLeft) turnLeft();
    if (turningRight) turnRight();

    if (stevey) {
        // Reset skeleton pose during each frame
        stevey.traverse((node) => {
            if (node.isSkinnedMesh) {
                node.skeleton.pose();
            }
        });

        const offset = new THREE.Vector3(0, 2, -3);
        const rotationMatrix = new THREE.Matrix4().makeRotationY(stevey.rotation.y);
        offset.applyMatrix4(rotationMatrix);
        camera.position.copy(stevey.position.clone().add(offset));
        camera.lookAt(stevey.position.x, stevey.position.y + 1.7, stevey.position.z);
    }
// Collision detection between Stevey and the red sphere
if (stevey && redSphere) {
    const dx = stevey.position.x - redSphere.position.x;
    const dz = stevey.position.z - redSphere.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const collisionDistance = 0.5; // Adjust based on size of Stevey and the sphere
    if (distance < collisionDistance) {
        // Collision detected
        scene.remove(redSphere); // Remove sphere from scene
        redSphere = null; // Prevent further collision detection
        updateScore(score + 1000); // Increase score by 1000
    }
}
    if (mixer) mixer.update(0.016); // Ensure animations are updated
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};






// Controls
const setMovement = (type, value) => {
    if (type === 'forward') movingForward = value;
    if (type === 'backward') movingBackward = value;
    if (type === 'left') turningLeft = value;
    if (type === 'right') turningRight = value;

    // Only check up/down movement (forward/backward) for animation
    const isMoving = movingForward || movingBackward;

    if (isMoving) {
        if (!isWalking && walkAction) {
            walkAction.reset(); // Reset to the start
            walkAction.play();  // Play the animation
            mixer.update(0.001); // Pre-warm the animation by advancing it slightly
            isWalking = true;
        }
    } else {
        if (isWalking && walkAction) {
            walkAction.stop();  // Stop the animation
            isWalking = false;
        }
    }
};



const setupButtonEvents = (button, type) => {
    button.addEventListener('mousedown', () => setMovement(type, true));
    button.addEventListener('mouseup', () => setMovement(type, false));
    button.addEventListener('mouseleave', () => setMovement(type, false));
    button.addEventListener('touchstart', () => setMovement(type, true));
    button.addEventListener('touchend', () => setMovement(type, false));
};

// Reverse the button controls
setupButtonEvents(document.getElementById('move-forward'), 'backward'); // Up button now moves backward
setupButtonEvents(document.getElementById('move-backward'), 'forward'); // Down button now moves forward

//keep the others the same
setupButtonEvents(document.getElementById('turn-left'), 'left');   // Left button turns left
setupButtonEvents(document.getElementById('turn-right'), 'right'); // Right button turns right

// Keyboard controls
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp': setMovement('forward', true); break; // Up arrow now moves forward
        case 'ArrowDown': setMovement('backward', true); break; // Down arrow now moves backward
        case 'ArrowLeft': setMovement('left', true); break;   // Turn left
        case 'ArrowRight': setMovement('right', true); break; // Turn right
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp': setMovement('forward', false); break;
        case 'ArrowDown': setMovement('backward', false); break;
        case 'ArrowLeft': setMovement('left', false); break;
        case 'ArrowRight': setMovement('right', false); break;
    }
});






    animate();
  });
