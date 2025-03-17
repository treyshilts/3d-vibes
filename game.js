let mixer = null;
let walkAction = null;
let redSphere = null;
let isWalking = false; // Tracks whether Stevey is currently walking  
let deltaTime = 0;
let score = 0; // Default score
let lastTime = performance.now();
let invisibleCube; // Add this at the top of your script file

window.onload = function() {
    let overlay = document.getElementById("black-overlay");
    let fp_logo = document.getElementById("full-screen-image");
    let playButton = document.getElementById("play-button");
    let splashScreen = document.getElementById("intro-background");

    // Ensure smooth transitions
    overlay.style.transition = "opacity 3s ease-out";
    fp_logo.style.transition = "opacity 3s ease-out";
    playButton.style.transition = "opacity 3s ease-out";

    // Initial fade-out after 1 second
    setTimeout(() => {
        overlay.style.opacity = "0";
    }, 1000); 

    // Fade back to black after 3.5 seconds
    setTimeout(() => {
        overlay.style.opacity = "1";
    }, 4500);

    // Final fade-out after 8 seconds
    setTimeout(() => {
        fp_logo.style.opacity = "0";
        
        // Delay zIndex update to ensure fade-out is visible
        setTimeout(() => {
            fp_logo.style.zIndex = "-4000";
            overlay.style.opacity = "0";
        }, 3000); // Wait for fade-out to finish before hiding

        // Hide overlay properly after fade-out
        setTimeout(() => {
            overlay.style.zIndex = "-4000";
        }, 6000);
    }, 6100);

// Play button click event
playButton.addEventListener("click", function() {
    playButton.disabled = true;
    overlay.style.opacity = "1"; // Fade back in over 3 seconds
    overlay.style.zIndex = "9999"; // Ensure it's on top

    setTimeout(() => {
        // Wait for the fade-in to fully complete before hiding the elements
        fp_logo.style.opacity = "0"; // Hide splash screen
        playButton.style.opacity = "0"; // Hide play button
    }, 3000); // Delay until fade-in completes

    setTimeout(() => {
        splashScreen.style.opacity = "0";
        overlay.style.opacity = "0"; // Fade back out
    }, 6000); // 3s after elements disappear

    setTimeout(() => {
        splashScreen.style.zIndex = "-4000";
        overlay.style.zIndex = "-4000"; // Move behind everything
    }, 9000); // After fade-out is done
});
}

const audio = new Audio('https://treyshilts.github.io/3d-vibes/FP_game_score.mp3');
audio.loop = true;  // loops indefinitely
audio.volume = 0.4; // set desired volume (0-1)

function initAudio() {
  audio.play().catch(() => {
    console.log("User interaction required to play audio");
  });

  // Remove listeners after first interaction
  document.removeEventListener('click', initAudio);
  document.removeEventListener('touchstart', initAudio);
}

// Listen for first interaction (click or touch)
document.addEventListener('click', initAudio);
document.addEventListener('touchstart', initAudio);

const updateScore = (newScore) => {
    score = newScore;
    document.getElementById('score').textContent = score;
};

function showDialog() {
  document.getElementById('collisionDialog').style.display = 'block';
  document.getElementById('dialogBackdrop').style.display = 'block';
}

function closeDialog() {
  document.getElementById('collisionDialog').style.display = 'none';
  document.getElementById('dialogBackdrop').style.display = 'none';
}

function downloadAction() {
  const link = document.createElement('a');
  link.href = 'https://drive.google.com/drive/folders/1_f_kZ8U1TuclxaN9i3MkUuFH50_Qun13?usp=sharing';  // Replace with your file's URL
  link.download = 'Asking.wav';  // Replace with desired filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

}

function closeDialog() {
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('threejs-scene');
    const scene = new THREE.Scene();

    // scene.fog = new THREE.Fog(0xaaaaaa, 0.5, 30);

    // Add the sky 
    const skyTexture = new THREE.TextureLoader().load('https://treyshilts.github.io/3d-vibes/night.png');
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

const wallMeshes = []; // Store all wall segment meshes here

// for WALLDEBUGGING (moving to end)
/*
wallPolygons.forEach(polygon => {
    const wallMesh = createWallMesh(polygon);
    scene.add(wallMesh);
});
*/

// collision w/ objects in glb
const collidableNames = [
  'house.front',
  'house.sides',
  'tinyhouse2',
  'tinyhouse3',
  'tinyhouse4',
  'tinyhouse1',
  'trunk2',
  'trunk2.front',
  'trunk2.back',
  'trunk1.back',
  'trunk1.front',
  'trunk1',
];

    const collisionData = []; // Manual collision data
    
    const collisionMeshes = []; // Accurate hitboxes

    const wallMaterial = new THREE.MeshBasicMaterial({
        visible: false
        /*
        color: 0xff0000,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
        */
    });

    const collisionMaterial = new THREE.MeshBasicMaterial({
        visible: false
    });
    
    function createWallMesh(polygon) {
    const wallHeight = 3;
    const wallThickness = 0.1;
    const segmentLength = 0.125;

    for (let i = 0; i < polygon.length; i++) {
        const start = polygon[i];
        const end = polygon[(i + 1) % polygon.length];

        const dx = end.x - start.x;
        const dz = end.z - start.z;
        const fullLength = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx);

        const redGeometry = new THREE.BoxGeometry(fullLength, wallHeight, wallThickness);
        const redMesh = new THREE.Mesh(redGeometry, wallMaterial);
        const midX = (start.x + end.x) / 2;
        const midZ = (start.z + end.z) / 2;
        redMesh.position.set(midX, wallHeight / 2, midZ);
        redMesh.rotation.y = -angle;
        scene.add(redMesh);

        const numSegments = Math.ceil(fullLength / segmentLength);
            for (let j = 0; j < numSegments; j++) {
                const ratio = j / numSegments;
                const segX = start.x + dx * ratio;
                const segZ = start.z + dz * ratio;
    
                const collGeom = new THREE.BoxGeometry(segmentLength, wallHeight, wallThickness);
                const collMesh = new THREE.Mesh(collGeom, collisionMaterial);
                collMesh.position.set(segX, wallHeight / 2, segZ);
                collMesh.rotation.y = -angle;
    
                scene.add(collMesh);
                collisionMeshes.push(collMesh);
            }
        }
    }
    
    const detectWallCollision = (x, z) => {
        const point = new THREE.Vector3(x, 1.5, z);
    
        return collisionMeshes.some(mesh => {
            mesh.geometry.computeBoundingBox();
            const box = mesh.geometry.boundingBox.clone();
            mesh.updateMatrixWorld(true);
            box.applyMatrix4(mesh.matrixWorld);
            return box.containsPoint(point);
        });
    };
    
    const collidables = [];

    // Create an invisible cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ visible: false });
    invisibleCube = new THREE.Mesh(geometry, material);
    
    // Position at (48.84, 0, -26.56)
    invisibleCube.position.set(48.84, 0, -26.56);
    
    // Add to scene
    scene.add(invisibleCube);
    
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
     const groundGeometry = new THREE.PlaneGeometry(0, 0);
     const textureLoader = new THREE.TextureLoader();
     const grassTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/grass.jpg');
     grassTexture.wrapS = THREE.RepeatWrapping;
     grassTexture.wrapT = THREE.RepeatWrapping;
     grassTexture.repeat.set(4, 4);

     const groundMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
     const ground = new THREE.Mesh(groundGeometry, groundMaterial);
     ground.rotation.x = -Math.PI / 2;
     scene.add(ground);

function placeGrassPlane(scene) {
    const textureLoader = new THREE.TextureLoader();

    // Load textures for sprites
    const textures = [
        textureLoader.load('https://treyshilts.github.io/3d-vibes/flowers_1.png'),
        textureLoader.load('https://treyshilts.github.io/3d-vibes/flowers_2.png'),
        textureLoader.load('https://treyshilts.github.io/3d-vibes/flowers_3.png'),
        textureLoader.load('https://treyshilts.github.io/3d-vibes/grass_bit.png')
    ];

    // Create sprite materials
    const materials = textures.map(texture => new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.5,
        depthWrite: false
    }));

    // Function to create and place a sprite
    function createSprite(material, x, z) {
        const sprite = new THREE.Sprite(material);
        sprite.position.set(x, 0.25, z);
        sprite.scale.set(1, 1, 1); // Adjust size if needed
        scene.add(sprite);
    }

    const restrictedPolygons = [
        // lake waterfall
        [
            { x: -17.23, z: -24.01 },
            { x: -12.73, z: -16.74 },
            { x: -7.19, z: -16.20 },
            { x: -4.10, z: -20.67 },
            { x: 4.37, z: -18.66 },
            { x: 4.97, z: -31.17 },
            { x: -0.64, z: -32.78 },
            { x: -4.89, z: -42.31 },
            { x: -15.76, z: -42.83 },
            { x: -17.80, z: -32.99 }
        ],

        // bridge lake
        [
            { x: -46.29, z: 19.53 },
            { x: -46.19, z: 33.01 },
            { x: -17, z: 37.53 },
            { x: -9.72, z: 32.49 },
            { x: -9.67, z: 19.24 },
            { x: -16.84, z: 15.50 }
        ]
    ];

    function isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, zi = polygon[i].z;
            const xj = polygon[j].x, zj = polygon[j].z;

            const intersect = ((zi > point.z) !== (zj > point.z)) &&
                              (point.x < (xj - xi) * (point.z - zi) / (zj - zi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function isPointRestricted(x, z) {
        return restrictedPolygons.some(polygon => isPointInPolygon({ x, z }, polygon));
    }
    
    // Initial two sprites at predefined positions
    //createSprite(materials[0], 0, 4);
    //createSprite(materials[3], 1, 4);

    console.log("Placed initial two sprites.");

    // Randomly distribute 3,000 sprites within the bounding box
    const minX = -45.67, maxX = 49.05;
    const minZ = -40.36, maxZ = 57.06;
    const numSprites = 3000;

        let placedCount = 0;
    while (placedCount < numSprites) {
        const x = Math.random() * (maxX - minX) + minX;
        const z = Math.random() * (maxZ - minZ) + minZ;

        // Only place sprite if it's NOT in a restricted area
        if (!isPointRestricted(x, z)) {
            const material = materials[Math.floor(Math.random() * materials.length)];
            createSprite(material, x, z);
            placedCount++;
        }
    }

    console.log(`Randomly placed ${placedCount} grass and flower sprites.`);
}
/*
    for (let i = 0; i < numSprites; i++) {
        const x = Math.random() * (maxX - minX) + minX;
        const z = Math.random() * (maxZ - minZ) + minZ;

        const material = materials[Math.floor(Math.random() * materials.length)];
        createSprite(material, x, z);
    }

    console.log("Randomly placed 3,000 grass and flower sprites.");
}
*/
//firefly function#2
// Create firefly group
const fireflies = new THREE.Group();
scene.add(fireflies);

const flickerSpeeds = [
  0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 
  1.1, 1.2, 1.3, 1.4, 1.5, 
  0.55, 0.75, 1.25, 1.35
];

// Firefly settings
const numFireflies = 1000; // Increase number for full-map effect
const fireflySize = 0.05; // Slightly bigger for visibility
const spawnRange = 150; // Fireflies will spawn within a 50-unit cube

// Firefly material (WHITE instead of orange)
const fireflyMaterial = new THREE.MeshBasicMaterial({ color: 0xfeffbd, transparent: true, opacity: 1 });

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x); // Returns a number between 0 and 1
}

/*
// Function to spawn a firefly anywhere in the map
function spawnFirefly() {
    const geometry = new THREE.SphereGeometry(fireflySize, 8, 8);
    const firefly = new THREE.Mesh(geometry, fireflyMaterial);

    // Position anywhere in the map
    const position = getRandomPosition();
    firefly.position.set(position.x, position.y, position.z);

    // Unique flicker timing for each firefly
    firefly.userData = { 
    id: fireflies.children.length, // 🔥 Unique ID based on order of creation
    phaseOffset: seededRandom(fireflies.children.length) * Math.PI * 2 // 🔥 Unique fade cycle start
    };

    fireflies.add(firefly);
}*/

function spawnFirefly() {
    const firefly = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfcf295, transparent: true, opacity: 1 })
    );

    // Randomly assign one of the predefined fade speeds
    const randomIndex = Math.floor(Math.random() * flickerSpeeds.length);
    firefly.userData = {
        flickerSpeed: flickerSpeeds[randomIndex], // 🔥 Each firefly gets a unique fade speed
        localTime: Math.random() * flickerSpeeds[randomIndex] // 🔥 Starts at a random phase
    };

    // Random position
    firefly.position.set(
        (Math.random() - 0.5) * 100, 
        Math.random() * 25 - 20,  
        (Math.random() - 0.5) * 100
    );

    fireflies.add(firefly);
}

// Get a random position anywhere in the map
function getRandomPosition() {
    return new THREE.Vector3(
        (Math.random() - 0.5) * spawnRange, // Random X
        Math.random() * spawnRange * 0.25 - 20,  // Lower Y range
        (Math.random() - 0.5) * spawnRange  // Random Z
    );
}

// Initialize fireflies
for (let i = 0; i < numFireflies; i++) {
    spawnFirefly();
}

function getRandomPositionInSphere(radius) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.cbrt(Math.random()) * radius; // Uniformly distribute points

    return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
    );
}

// Firefly update logic (Flickering independently + Floating Effect)
/*function updateFireflies() {
    const time = performance.now() * 0.001;

const flickerSpeed = Math.PI / 1;*/
    
const maxDistance = 20; // Fireflies disappear beyond this distance
function updateFireflies(deltaTime) {
    fireflies.children.forEach(firefly => {
        // Update each firefly's local time independently
        firefly.userData.localTime += deltaTime;

        if (firefly.userData.localTime > firefly.userData.flickerSpeed) {
            firefly.userData.localTime = 0; // Reset cycle when full fade-in/out is completed
        }

        // Calculate fade using sine wave (0 → 1 → 0)
        const phase = firefly.userData.localTime / firefly.userData.flickerSpeed;
        firefly.material.opacity = 0.2 + 0.8 * Math.sin(phase * Math.PI);

        // Slight floating motion
        firefly.position.y += 0.005 * Math.sin(phase * Math.PI);
        
        /*
        firefly.position.x += firefly.userData.direction.x * deltaTime;
        firefly.position.z += firefly.userData.direction.z * deltaTime;
        */
        
        if (firefly.position.y > 12) {
            firefly.position.y = 0; // Reset to ground level
        }
    });
}

/*
// Create firefly group
const fireflies = new THREE.Group();
scene.add(fireflies);

// Firefly settings
const numFireflies = 20;
const fireflySize = 0.02;
const spawnDistance = 10; // Max distance in front of the camera

// Firefly material
const fireflyMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 1 });

// Function to spawn a firefly within camera view
function spawnFirefly() {
    const geometry = new THREE.SphereGeometry(fireflySize, 8, 8);
    const firefly = new THREE.Mesh(geometry, fireflyMaterial);

    // Place within camera frustum
    const position = getRandomPositionInView();
    firefly.position.set(position.x, position.y, position.z);
    
    // Add animation properties
    firefly.userData = { timeOffset: Math.random() * Math.PI * 2 };

    fireflies.add(firefly);
}

// Get a random position inside camera view
function getRandomPositionInView() {
    const frustumSize = 2; // Adjust for spread
    const x = (Math.random() - 0.5) * frustumSize;
    const y = (Math.random() - 0.5) * frustumSize;
    const z = -Math.random() * spawnDistance; // Always in front of the camera

    const position = new THREE.Vector3(x, y, z);
    position.applyMatrix4(camera.matrixWorld);
    
    return position;
}

// Initialize fireflies
for (let i = 0; i < numFireflies; i++) {
    spawnFirefly();
}

function updateFireflies() {
    const time = performance.now() * 0.001;

    fireflies.children.forEach(firefly => {
        const t = time + firefly.userData.timeOffset;
        firefly.material.opacity = 0.5 + 0.5 * Math.sin(t * 2); // Flickering effect
        firefly.position.y += 0.01 * Math.sin(t); // Slight floating movement
        
        // If firefly moves too far from camera, respawn it
        if (firefly.position.distanceTo(camera.position) > spawnDistance) {
            const newPos = getRandomPositionInView();
            firefly.position.set(newPos.x, newPos.y, newPos.z);
        }
    });
}
*/    
// below is most recent functioning function    
/*    function placeGrassPlane(scene) {
    const textureLoader = new THREE.TextureLoader();

    // Load textures
    const grassTexture1 = textureLoader.load('https://treyshilts.github.io/3d-vibes/flowers_1.png', () => {
        console.log("Grass texture 1 loaded successfully");
    }, undefined, (error) => {
        console.error("Error loading grass texture 1:", error);
    });

    const grassTexture2 = textureLoader.load('https://treyshilts.github.io/3d-vibes/grass_bit.png', () => {
        console.log("Grass texture 2 loaded successfully");
    }, undefined, (error) => {
        console.error("Error loading grass texture 2:", error);
    });

    const flowersTexture2 = textureLoader.load('https://treyshilts.github.io/3d-vibes/flowers_2.png', () => {
        console.log("Flowers texture 2 loaded successfully");
    }, undefined, (error) => {
        console.error("Error loading flowers texture 2:", error);
    });

    const flowersTexture3 = textureLoader.load('https://treyshilts.github.io/3d-vibes/flowers_3.png', () => {
        console.log("Flowers texture 3 loaded successfully");
    }, undefined, (error) => {
        console.error("Error loading flowers texture 3:", error);
    });

    // Create materials
    const material1 = new THREE.MeshBasicMaterial({
        map: grassTexture1,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        depthWrite: false,
    });

    const material2 = new THREE.MeshBasicMaterial({
        map: grassTexture2,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        depthWrite: false,
    });

    const material3 = new THREE.MeshBasicMaterial({
        map: flowersTexture2,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        depthWrite: false,
    });

    const material4 = new THREE.MeshBasicMaterial({
        map: flowersTexture3,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        depthWrite: false,
    });

    const materials = [material1, material2, material3, material4];

    // Create geometry
    const geometry = new THREE.PlaneGeometry(1, 1);

    /* // Create the first plane
    const plane1 = new THREE.Mesh(geometry, material1);
    plane1.position.set(0, 0.25, 4);
    plane1.scale.set(0.5, 0.5, 0.5);
    scene.add(plane1);
    console.log("Grass plane 1 added at:", plane1.position);

    // Create the second plane
    const plane2 = new THREE.Mesh(geometry, material2);
    plane2.position.set(1, 0.25, 4);
    plane2.scale.set(0.5, 0.5, 0.5);
    scene.add(plane2);
    console.log("Grass plane 2 added at:", plane2.position); */ /*

    // Randomly distribute 3,000 planes within the bounding box
    const minX = -45.67, maxX = 49.05;
    const minZ = -40.36, maxZ = 57.06;
    const numPlanes = 3000;

    for (let i = 0; i < numPlanes; i++) {
        const x = Math.random() * (maxX - minX) + minX;
        const z = Math.random() * (maxZ - minZ) + minZ;

        const material = materials[Math.floor(Math.random() * materials.length)];

        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(x, 0.25, z);
        plane.scale.set(0.5, 0.5, 0.5);
        scene.add(plane);
    }

    console.log("Randomly placed 3,000 grass and flower planes.");
} */
/* 
function placeGrassPlane(scene) {
    const textureLoader = new THREE.TextureLoader();

    // Load the first texture
    const grassTexture1 = textureLoader.load('https://treyshilts.github.io/3d-vibes/flowers_1.png', () => {
        console.log("Grass texture 1 loaded successfully");
    }, undefined, (error) => {
        console.error("Error loading grass texture 1:", error);
    });

    // Load the second texture
    const grassTexture2 = textureLoader.load('https://treyshilts.github.io/3d-vibes/grass_bit.png', () => {
        console.log("Grass texture 2 loaded successfully");
    }, undefined, (error) => {
        console.error("Error loading grass texture 2:", error);
    });

    // Create the material for the first plane
    const material1 = new THREE.MeshBasicMaterial({
        map: grassTexture1,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        depthWrite: false,
    });

    // Create the material for the second plane
    const material2 = new THREE.MeshBasicMaterial({
        map: grassTexture2,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        depthWrite: false,
    });

    // Create the geometry
    const geometry = new THREE.PlaneGeometry(1, 1);

    // Create the first plane
    const plane1 = new THREE.Mesh(geometry, material1);
    plane1.position.set(0, 0.25, 4);
    plane1.scale.set(.5, .5, .5);
    scene.add(plane1);
    console.log("Grass plane 1 added at:", plane1.position);

    // Create the second plane
    const plane2 = new THREE.Mesh(geometry, material2);
    plane2.position.set(1, 0.25, 4);
    plane2.scale.set(.5, .5, .5);
    scene.add(plane2);
    console.log("Grass plane 2 added at:", plane2.position);
}
*/
//  Positions
const treePositions = [
    {
        "x": -21.22,
        "z": 3.51
    },
    {
        "x": -27.03,
        "z": 6.54
    },
    {
        "x": 4.87,
        "z": 18.79
    },
    {
        "x": -8.58,
        "z": 32.13
    },
    {
        "x": 5.57,
        "z": 27.77
    },
    {
        "x": -6.93,
        "z": 17.37
    },
    {
        "x": -1.33,
        "z": 18.85
    },
    {
        "x": 16.75,
        "z": 6.95
    },
    {
        "x": 6.32,
        "z": 11.0
    },
    {
        "x": 15.92,
        "z": 9.69
    },
    {
        "x": -8.72,
        "z": 8.36
    },
    {
        "x": 10.04,
        "z": 3.51
    },
    {
        "x": -5.15,
        "z": 19.45
    },
    {
        "x": -27.01,
        "z": 7.59
    },
    {
        "x": 8.25,
        "z": 4.9
    },
    {
        "x": -6.04,
        "z": 14.6
    },
    {
        "x": 12.71,
        "z": 10.44
    },
    {
        "x": -1.57,
        "z": 23.61
    },
    {
        "x": -2.26,
        "z": 32.21
    },
    {
        "x": 14.5,
        "z": 11.83
    },
    {
        "x": 13.47,
        "z": -0.05
    },
    {
        "x": -25.94,
        "z": 2.76
    },
    {
        "x": -8.72,
        "z": 26.38
    },
    {
        "x": -0.88,
        "z": 32.77
    },
    {
        "x": 10.04,
        "z": 13.91
    },
    {
        "x": -17.65,
        "z": 2.82
    },
    {
        "x": -11.92,
        "z": 14.32
    },
    {
        "x": 5.11,
        "z": 32.53
    },
    {
        "x": 2.89,
        "z": 28.46
    },
    {
        "x": 5.53,
        "z": 23.56
    },
    {
        "x": 4.68,
        "z": 28.46
    },
    {
        "x": -6.93,
        "z": 27.77
    },
    {
        "x": -23.9,
        "z": 5.59
    },
    {
        "x": -22.79,
        "z": 11.69
    },
    {
        "x": -18.54,
        "z": 6.98
    },
    {
        "x": 10.37,
        "z": 27.1
    },
    {
        "x": -22.11,
        "z": 6.98
    },
    {
        "x": -8.64,
        "z": 24.59
    },
    {
        "x": -23.68,
        "z": 11.08
    },
    {
        "x": 10.93,
        "z": 20.14
    },
    {
        "x": -12.29,
        "z": 1.43
    },
    {
        "x": -3.36,
        "z": 19.45
    },
    {
        "x": -20.33,
        "z": 11.14
    },
    {
        "x": 7.36,
        "z": 8.36
    },
    {
        "x": -23.9,
        "z": 9.06
    },
    {
        "x": -1.57,
        "z": 27.08
    },
    {
    "x": 22.81, "z": -6.04
},
{
    "x": 25.73, "z": -3.92
},
{
    "x": 22.39, "z": 1.14
},
{
    "x": 24.67, "z": -11.32
},
{
    "x": 24.81, "z": -8.89
},
{
    "x": 22.88, "z": -0.79
},
{
    "x": 20.47, "z": -3.45
},
{
    "x": 22.35, "z": -1.71
},
{
    "x": 21.85, "z": -13.83
},
{
    "x": 20.14, "z": 4.35
},
{
    "x": 27.14, "z": -4.91
},
{
    "x": 24.16, "z": -6.64
},
{
    "x": 22.78, "z": 2.48
},
{
    "x": 20.65, "z": 7.67
},
{
    "x": 21.34, "z": -8.17
},
{
    "x": 25.37, "z": -8.12
},
{
    "x": 22.2, "z": 5.94
},
    {
    "x": 33.36, "z": -15.08
},
{
    "x": 37.10, "z": -6.96
},
{
    "x": 29.62, "z": 20.96
},
{
    "x": 12.87, "z": 44.93
},
{
    "x": -8.00, "z": 46.00
},
{
    "x": -22.00, "z": 36.21
},
{
    "x": 25.68, "z": 33.94
},
{
    "x": 42.34, "z": 6.70
},
{
    "x": 33.36, "z": -15.08
},
{
    "x": 37.10, "z": -6.96
},
{
    "x": 29.62, "z": 20.96
},
{
    "x": 12.87, "z": 44.93
},
{
    "x": -8.00, "z": 46.00
},
{
    "x": -22.00, "z": 36.21
},
{
    "x": 25.68, "z": 33.94
},
{
    "x": 42.34, "z": 6.70
},
{
    "x": 19.81, "z": -13.41
},
{
    "x": 19.77, "z": 6.36
},
{
    "x": 20.61, "z": -12.74
}
];
const biggerTreePositions = [
    {
        "x": 4.59,
        "z": 16.93
    },
    {
        "x": 9.14,
        "z": 14.6
    },
    {
        "x": -18.57,
        "z": 12.1
    },
    {
        "x": 15.27,
        "z": 2.02
    },
    {
        "x": -15.86,
        "z": 3.51
    },
    {
        "x": 10.93,
        "z": 9.06
    },
    {
        "x": -10.5,
        "z": 12.52
    },
    {
        "x": -25.69,
        "z": 6.28
    },
    {
        "x": 2.89,
        "z": 25.0
    },
    {
        "x": -11.4,
        "z": 4.2
    },
    {
        "x": -20.11,
        "z": 0.97
    },
    {
        "x": 15.25,
        "z": 10.8
    },
    {
        "x": -13.18,
        "z": 7.67
    },
    {
        "x": -0.65,
        "z": 18.98
    },
    {
        "x": 12.71,
        "z": 2.82
    },
    {
        "x": 8.76,
        "z": 1.68
    },
    {
        "x": 11.82,
        "z": 11.14
    },
    {
        "x": -2.87,
        "z": 15.93
    },
    {
        "x": 9.14,
        "z": 10.44
    },
    {
        "x": 3.78,
        "z": 29.85
    },
    {
        "x": -5.34,
        "z": 32.76
    },
    {
        "x": -17.65,
        "z": 6.98
    },
    {
        "x": -15.19,
        "z": -0.23
    },
    {
        "x": -10.3,
        "z": 6.14
    },
    {
        "x": -8.62,
        "z": 30.43
    },
    {
        "x": -25.19,
        "z": 11.66
    },
    {
        "x": -16.76,
        "z": 1.43
    },
    {
        "x": -18.54,
        "z": 10.44
    },
    {
        "x": 4.53,
        "z": 19.49
    },
    {
        "x": -0.68,
        "z": 30.54
    },
    {
        "x": -9.95,
        "z": 4.52
    },
    {
        "x": 12.71,
        "z": 17.37
    },
    {
        "x": -4.25,
        "z": 15.29
    },
    {
        "x": 4.7,
        "z": 31.95
    },
    {
        "x": -20.52,
        "z": 11.27
    },
    {
        "x": -13.18,
        "z": 4.2
    },
    {
        "x": 10.93,
        "z": 16.68
    },
    {
        "x": -7.83,
        "z": 18.07
    },
    {
        "x": 7.36,
        "z": 22.92
    },
    {
        "x": 2.65,
        "z": 22.52
    },
    {
        "x": 11.82,
        "z": 3.51
    },
    {
        "x": -10.5,
        "z": 5.59
    },
    {
        "x": 12.25,
        "z": 21.88
    },
    {
        "x": -13.18,
        "z": 0.74
    },
    {
        "x": -1.57,
        "z": 20.14
    },
    {
        "x": 13.61,
        "z": 9.06
    },
    {
    "x": 24.41, "z": -1.97
},
{
    "x": 27.33, "z": -10.26
},
{
    "x": 25.82, "z": -5.01
},
{
    "x": 24.89, "z": -14.15
},
{
    "x": 26.05, "z": -12.09
},
{
    "x": 22.17, "z": 0.83
},
{
    "x": 20.81, "z": 2.96
},
{
    "x": 23.56, "z": -9.48
},
{
    "x": 22.34, "z": -4.74
},
{
    "x": 24.03, "z": 0.57
},
{
    "x": 25.97, "z": -9.21
},
{
    "x": 23.21, "z": 3.87
},
{
    "x": 21.99, "z": -11.57
},
{
    "x": 20.62, "z": 1.94
},
{
    "x": 22.76, "z": -6.92
},
{
    "x": 24.36, "z": -3.35
},
{
    "x": 23.74, "z": -7.71
},
{
    "x": 37.01, "z": -4.38
},
{
    "x": 35.55, "z": 20.04
},
{
    "x": 21.25, "z": 46.42
},
{
    "x": 10.48, "z": 42.11
},
{
    "x": -1.00, "z": 46.86
},
{
    "x": -17.00, "z": 48.00
},
{
    "x": -37.22, "z": 47.96
},
{
    "x": 18.75, "z": 5.79
},
{
    "x": 18.22, "z": 4.76
},
{
    "x": 19.04, "z": -10.63
}
];
const smallerTreePositions = [
    {
        "x": 5.86,
        "z": 10.47
    },
    {
        "x": 14.28,
        "z": 16.21
    },
    {
        "x": 2.0,
        "z": 29.85
    },
    {
        "x": -1.05,
        "z": 21.55
    },
    {
        "x": -15.65,
        "z": 12.26
    },
    {
        "x": 8.58,
        "z": 29.6
    },
    {
        "x": 13.61,
        "z": 15.99
    },
    {
        "x": -2.47,
        "z": 31.93
    },
    {
        "x": 6.46,
        "z": 23.61
    },
    {
        "x": -2.54,
        "z": 14.9
    },
    {
        "x": -4.25,
        "z": 18.76
    },
    {
        "x": -24.79,
        "z": 7.67
    },
    {
        "x": 6.46,
        "z": 15.99
    },
    {
        "x": 13.74,
        "z": 14.83
    },
    {
        "x": -26.3,
        "z": 10.87
    },
    {
        "x": -17.23,
        "z": -0.22
    },
    {
        "x": 5.57,
        "z": 20.14
    },
    {
        "x": -7.83,
        "z": 28.46
    },
    {
        "x": 8.06,
        "z": 2.77
    },
    {
        "x": 1.1,
        "z": 29.15
    },
    {
        "x": -5.35,
        "z": 12.99
    },
    {
        "x": 6.46,
        "z": 12.52
    },
    {
        "x": 7.36,
        "z": 15.99
    },
    {
        "x": 16.44,
        "z": 5.14
    },
    {
        "x": -0.04,
        "z": 21.99
    },
    {
        "x": 3.79,
        "z": 23.61
    },
    {
        "x": -10.71,
        "z": 3.08
    },
    {
        "x": -12.29,
        "z": 5.59
    },
    {
        "x": -9.61,
        "z": 11.14
    },
    {
        "x": -7.74,
        "z": 33.07
    },
    {
        "x": -26.84,
        "z": 8.03
    },
    {
        "x": -8.78,
        "z": 19.53
    },
    {
        "x": 5.57,
        "z": 31.23
    },
    {
        "x": -27.06,
        "z": 5.39
    },
    {
        "x": 7.58,
        "z": 31.61
    },
    {
        "x": 0.21,
        "z": 27.77
    },
    {
        "x": 11.73,
        "z": -0.02
    },
    {
        "x": -4.81,
        "z": 31.95
    },
    {
        "x": -21.22,
        "z": 6.98
    },
    {
        "x": 2.89,
        "z": 31.93
    },
    {
        "x": 6.46,
        "z": 19.45
    },
    {
        "x": 13.88,
        "z": 17.22
    },
    {
        "x": -2.12,
        "z": 16.88
    },
    {
        "x": -9.21,
        "z": 27.33
    },
    {
        "x": -23.01,
        "z": 6.28
    },
    {
        "x": -5.72,
        "z": 11.1
    },
    {
    "x": 22.65, "z": 6.81
},
{
    "x": 21.18, "z": -5.61
},
{
    "x": 23.99, "z": -5.02
},
{
    "x": 24.91, "z": -10.93
},
{
    "x": 25.73, "z": -6.74
},
{
    "x": 22.24, "z": 3.01
},
{
    "x": 23.14, "z": -4.16
},
{
    "x": 24.59, "z": -12.88
},
{
    "x": 22.06, "z": -2.64
},
{
    "x": 21.12, "z": 5.47
},
{
    "x": 20.75, "z": -10.36
},
{
    "x": 25.19, "z": -2.86
},
{
    "x": 21.36, "z": 3.73
},
{
    "x": 23.42, "z": -7.12
},
{
    "x": 22.59, "z": -9.03
},
{
    "x": 20.95, "z": 0.45,
},
{
    "x": 24.25, "z": -5.83
},
    {
    "x": 37.01, "z": -4.38
},
{
    "x": 35.55, "z": 20.04
},
{
    "x": 21.25, "z": 46.42
},
{
    "x": 10.48, "z": 42.11
},
{
    "x": -1.00, "z": 46.86
},
{
    "x": -17.00, "z": 48.00
},
{
    "x": -37.22, "z": 47.96
},
    {
    "x": -20.25, "z": -12.62
},
{
    "x": -29.05, "z": -27.78
},
];
const largestTreePositions = [
    {
        "x": -23.01,
        "z": 2.82
    },
    {
        "x": -8.92,
        "z": 7.6
    },
    {
        "x": -9.59,
        "z": 22.59
    },
    {
        "x": -8.72,
        "z": 22.92
    },
    {
        "x": -6.04,
        "z": 25.0
    },
    {
        "x": -7.83,
        "z": 25.0
    },
    {
        "x": -8.69,
        "z": 21.98
    },
    {
        "x": -8.72,
        "z": 11.83
    },
    {
        "x": -15.86,
        "z": 6.98
    },
    {
        "x": 10.93,
        "z": 13.21
    },
    {
        "x": 11.18,
        "z": 23.92
    },
    {
        "x": -26.66,
        "z": 3.93
    },
    {
        "x": -3.36,
        "z": 30.54
    },
    {
        "x": 16.29,
        "z": 9.06
    },
    {
        "x": -25.69,
        "z": 2.82
    },
    {
        "x": -8.72,
        "z": 19.45
    },
    {
        "x": 2.66,
        "z": 31.92
    },
    {
        "x": 8.25,
        "z": 11.83
    },
    {
        "x": -6.26,
        "z": 32.51
    },
    {
        "x": -0.79,
        "z": 19.85
    },
    {
        "x": 12.76,
        "z": 17.6
    },
    {
        "x": -4.25,
        "z": 29.85
    },
    {
        "x": -1.57,
        "z": 30.54
    },
    {
        "x": -15.86,
        "z": 0.05
    },
    {
        "x": -10.16,
        "z": 15.72
    },
    {
        "x": 17.33,
        "z": 6.05
    },
    {
        "x": 4.69,
        "z": 22.61
    },
    {
        "x": 14.5,
        "z": 4.2
    },
    {
        "x": 14.5,
        "z": 8.36
    },
    {
        "x": -8.94,
        "z": 33.08
    },
    {
        "x": 15.33,
        "z": 12.62
    },
    {
        "x": 14.59,
        "z": 12.68
    },
    {
        "x": -25.97,
        "z": 10.6
    },
    {
        "x": -12.41,
        "z": 13.55
    },
    {
        "x": 6.19,
        "z": 12.81
    },
    {
        "x": 8.87,
        "z": 31.33
    },
    {
        "x": -21.43,
        "z": 11.94
    },
    {
        "x": 11.27,
        "z": 22.9
    },
    {
        "x": 0.79,
        "z": 32.45
    },
    {
        "x": 10.93,
        "z": 23.61
    },
    {
        "x": 14.74,
        "z": 3.04
    },
    {
        "x": 14.27,
        "z": 0.68
    },
    {
        "x": -14.97,
        "z": 9.06
    },
    {
        "x": 7.78,
        "z": 6.87
    },
    {
        "x": 16.17,
        "z": 10.67
    },
    {
        "x": -8.72,
        "z": 29.85
    },
    {
        "x": -6.04,
        "z": 18.07
    },
    {
        "x": 9.14,
        "z": 6.98
    }
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
treePositions.forEach(({ x, z }) => createTree(x, z, 1.5));

// Add Bigger Trees (10% larger)
biggerTreePositions.forEach(({ x, z }) => createTree(x, z, 1.75));

// Add Smaller Trees (10% smaller)
smallerTreePositions.forEach(({ x, z }) => createTree(x, z, 1.3));

// Add Largest Trees (30% larger)
largestTreePositions.forEach(({ x, z }) => createTree(x, z, 2.0));

// Create an HTML overlay for the text
const coordinateDisplay = document.createElement('div');
coordinateDisplay.style.position = 'absolute';
coordinateDisplay.style.top = '50%';
coordinateDisplay.style.left = '50%';
coordinateDisplay.style.transform = 'translate(-50%, -50%)';
coordinateDisplay.style.color = 'yellow';
coordinateDisplay.style.fontSize = '24px';
coordinateDisplay.style.fontFamily = 'Arial, sans-serif';
coordinateDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
coordinateDisplay.style.padding = '10px';
coordinateDisplay.style.borderRadius = '5px';
coordinateDisplay.style.display = 'none'; // Initially hidden
document.body.appendChild(coordinateDisplay);

function updatePosition() {
    if (stevey) {
        const x = stevey.position.x.toFixed(2); // Limit to 2 decimal places
        const z = stevey.position.z.toFixed(2); // Limit to 2 decimal places
        document.getElementById("position").textContent = `(${x}, ${z})`;
    }
}
    
// Load the map
const loadMap = () => {
    const mapLoader = new THREE.GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    
    const grassTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/grass.jpg', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(30, 30);
    });

    const waterTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/water.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 10);
    });

        const moonTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/moon.jpg', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
    });

        const doorTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/door.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
    });

        const dirtTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/dirt.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(15, 15);
    });

        const brickTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/brick.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);
        texture.rotation = Math.PI / 2;
        texture.center.set(0.5, 0.5);
    });

        const barkTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/bark.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);
    });

        const roofTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/roof2.jpeg', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);
        texture.rotation = Math.PI / 2;
        texture.center.set(0.5, 0.5);
    });

        const bridgeTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/bridge.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 1);
    });
    
        const keyboardTopTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/keyboardtexture3.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
    });
    
        const compScreenTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/comp_screen2.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
    });

        const compDiscTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/CDtexture3.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
    });


    mapLoader.load(
        'https://treyshilts.github.io/3d-vibes/finalmap_summer3d_6.glb',
        (gltf) => {
            const map = gltf.scene;

            // Traverse through the map to find the ground object and apply the texture
            map.traverse((child) => {
                if (child.isMesh) {
                    if (child.name.includes('mainground')) {
                        child.material = new THREE.MeshLambertMaterial({ map: grassTexture });
                    } else if (child.name.includes('lake')) {
                        child.material = new THREE.MeshLambertMaterial({ map: waterTexture });
                    } else if (child.name.includes('moon')) {
                        child.material = new THREE.MeshStandardMaterial({
                            map: moonTexture,
                            emissive: new THREE.Color(0xEAEAEA),
                            emissiveIntensity: 1,
                            emissiveMap: moonTexture,
                        });
                    } else if (child.name.includes('littlebridge')) {
                        child.material = new THREE.MeshLambertMaterial({ map: bridgeTexture });
                    } else if (child.name.includes('shroomstem')) {
                        child.material = new THREE.MeshLambertMaterial({ color: 0xFBEEAC });
                    } else if (child.name.includes('giant')) {
                        child.material = new THREE.MeshLambertMaterial({ color: 0x000000 });
                    } else if (child.name.includes('shroomtop')) {
                        child.material = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
                    } else if (child.name.includes('door')) {
                        child.material = new THREE.MeshLambertMaterial({ map: doorTexture });
                    } else if (child.name.includes('trunk')) {
                        child.material = new THREE.MeshLambertMaterial({ map: barkTexture });
                    } else if (child.name.includes('houseroof')) {
                        child.material = new THREE.MeshLambertMaterial({ map: roofTexture });
                    } else if (child.name.includes('tinyroof')) {
                        child.material = new THREE.MeshLambertMaterial({ map: roofTexture });
                    } else if (child.name.includes('housefront')) {
                        child.material = new THREE.MeshLambertMaterial({ map: brickTexture });
                    } else if (child.name.includes('housesides')) {
                        child.material = new THREE.MeshLambertMaterial({ map: brickTexture });
                    } else if (child.name.includes('tinyhouse')) {
                        child.material = new THREE.MeshLambertMaterial({ map: brickTexture });
                    } else if (child.name.includes('dirt')) {
                        child.material = new THREE.MeshLambertMaterial({ map: dirtTexture });
                    } else if (child.name.includes('compkeytop')) {
                        child.material = new THREE.MeshLambertMaterial({ map: keyboardTopTexture });
                    } else if (child.name.includes('compscreen')) {
                        child.material = new THREE.MeshStandardMaterial({
                            map: compScreenTexture,
                            emissive: new THREE.Color(0xFFFFFF),
                            emissiveIntensity: 1,
                            emissiveMap: compScreenTexture,
                        });
                    } else if (child.name.includes('compdisc')) {
                        child.material = new THREE.MeshLambertMaterial({ map: compDiscTexture });
                }}
            });
    
            map.traverse((child) => {
                if (collidableNames.includes(child.name)) {
                    collidables.push(child);
                }
            });
            
            // Position and scale the map
            map.position.set(0, 0, 0); 
            map.scale.set(7, 7, 7); 

            // Add the map to the scene
            scene.add(map);

            console.log('Map loaded successfully with ground textured:', map);
        },
        undefined,
        (error) => {
            console.error('An error occurred while loading the map:', error);
        }
    );
};

// Call the function to load the map
loadMap();

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
    new THREE.MeshLambertMaterial({ map: textureLoader.load('https://treyshilts.github.io/3d-vibes/grass.jpg') }),      // Top
    new THREE.MeshLambertMaterial({ map: textureLoader.load('https://treyshilts.github.io/3d-vibes/grass.jpg') }),      // Bottom
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
  const grassTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/grass.jpg');

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
    stevey.position.set(2.22, 0, 14.85)
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
//const loadCadillac = () => {
//  const cadillacLoader = new THREE.OBJLoader();
//  const cadillacMtlLoader = new THREE.MTLLoader();

//  cadillacMtlLoader.load('https://treyshilts.github.io/3d-vibes/cadillac.mtl', (materials) => {
//    materials.preload();
//    cadillacLoader.setMaterials(materials);
//    cadillacLoader.load(
//      'https://treyshilts.github.io/3d-vibes/cadillac.obj',
//      (object) => {
//        object.position.set(12, 0.5, 9); // Set Cadillac position
//        object.scale.set(0.0025, 0.0025, 0.0025);
//        object.rotation.y = Math.PI / 1.5; // Optional: Rotate for better alignment
//        scene.add(object);
//      }
//    );
//  });
//};

// Call the function to load the Cadillac
//loadCadillac();
    
const redSpheres = [];
/*
function createRedSphere(x, y, z) {
    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    
    // Light-emitting material (emissive light yellow)
    const sphereMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffcc,          // Light yellow color
        emissive: 0xffffcc,       // Emit light
        emissiveIntensity: 1.5,   // Brightness of emission
        roughness: 0.3,
        metalness: 0.1
    });

    const redSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    redSphere.position.set(x, y, z);
    scene.add(redSphere);
    redSpheres.push(redSphere);
}

*/
function createRedSphere(x, y, z) {
    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // Red color
    const redSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    redSphere.position.set(x, y, z); // Set the sphere's position
    scene.add(redSphere);
    redSpheres.push(redSphere);
}

const sphereCoordinates = [
    { x: -2.73, y: 0.25, z: 7.97 },
    { x: 3.15, y: 0.25, z: 5.94 },
    { x: 8.29, y: 0.25, z: -31.01 },
    { x: 11.34, y: 0.25, z: -32.52 },
    { x: 7.28, y: 0.25, z: -34.36 },
    { x: 15.53, y: 0.25, z: -34.71 },
    { x: 7.13, y: 0.25, z: -26.94 },
    { x: 8.37, y: 0.25, z: -28.16 },
    { x: 10.81, y: 0.25, z: -26.24 },
    { x: 16.3, y: 0.25, z: -29.98 },
    { x: 9.99, y: 0.25, z: -28.83 },
    { x: 14.43, y: 0.25, z: -29.95 },
    { x: 10.8, y: 0.25, z: -34.19 },
    { x: 9.86, y: 0.25, z: -31.6 },
    { x: 15.21, y: 0.25, z: -27.25 },
    { x: 7.98, y: 0.25, z: -28.66 },
    { x: 7.12, y: 0.25, z: -29.13 },
    { x: 8.54, y: 0.25, z: -24.94 },
    { x: 16.58, y: 0.25, z: -32.19 },
    { x: 14.26, y: 0.25, z: -26.59 },
    { x: 10.67, y: 0.25, z: -24.56 },
    { x: 13.7, y: 0.25, z: -34.16 },
    { x: 9.05, y: 0.25, z: -25.01 },
    { x: 13.5, y: 0.25, z: -31.87 },
    { x: 8.56, y: 0.25, z: -31.49 },
    { x: 8.24, y: 0.25, z: -32.12 },
    { x: 16.08, y: 0.25, z: -32.39 },
    { x: 8.21, y: 0.25, z: -30.38 },
    { x: 13.46, y: 0.25, z: -33.02 },
    { x: 10.97, y: 0.25, z: -25.75 },
    { x: 14.32, y: 0.25, z: -32.75 },
    { x: 14.61, y: 0.25, z: -30.17 },
    { x: 15.6, y: 0.25, z: -28.81 },
    { x: 6.93, y: 0.25, z: -26.56 },
    { x: 10.46, y: 0.25, z: -33.1 },
    { x: 15.0, y: 0.25, z: -29.32 },
    { x: 9.56, y: 0.25, z: -30.08 },
    { x: 11.13, y: 0.25, z: -25.57 },
    { x: 12.71, y: 0.25, z: -27.83 },
    { x: 8.85, y: 0.25, z: -31.11 },
    { x: 9.08, y: 0.25, z: -29.82 },
    { x: 10.11, y: 0.25, z: -33.73 },
    { x: 6.93, y: 0.25, z: -22.46 },
    { x: 8.37, y: 0.25, z: -29.24 },
    { x: 6.49, y: 0.25, z: -33.79 },
    { x: 10.1, y: 0.25, z: -30.87 },
    { x: 8.99, y: 0.25, z: -28.44 },
    { x: 6.77, y: 0.25, z: -26.02 },
    { x: 7.25, y: 0.25, z: -31.16 },
    { x: 6.39, y: 0.25, z: -32.29 },
    { x: 15.83, y: 0.25, z: -32.58 },
    { x: 12.56, y: 0.25, z: -29.16 },
    { x: 14.94, y: 0.25, z: -26.62 },
    { x: 12.08, y: 0.25, z: -25.11 },
    { x: 10.79, y: 0.25, z: -32.09 },
    { x: 10.86, y: 0.25, z: -30.05 },
    { x: 12.65, y: 0.25, z: -31.72 },
    { x: 13.53, y: 0.25, z: -32.92 },
    { x: 16.16, y: 0.25, z: -34.48 },
    { x: 8.91, y: 0.25, z: -28.97 },
    { x: 10.85, y: 0.25, z: -29.07 },
    { x: 11.97, y: 0.25, z: -31.6 },
    { x: 13.0, y: 0.25, z: -29.77 },
    { x: 13.77, y: 0.25, z: -32.29 },
    { x: 7.59, y: 0.25, z: -31.13 },
    { x: 7.78, y: 0.25, z: -24.5 },
{x: -0.05, y: 0.25, z: 37.34},
{x: -33.60, y: 0.25, z: 51.46},
{x: -25.94, y: 0.25, z: 46.66},
{x: -33.60, y: 0.25, z: 51.46},
{x: -25.94, y: 0.25, z: 46.66},
{x: -40.99, y: 0.25, z: 48.22},
{x: -26.19, y: 0.25, z: 37.20},
{x: 14.64, y: 0.25, z: 51.03},
{x: -24.56, y: 0.25, z: 47.54},
{x: -33.60, y: 0.25, z: 46.22},
{x: 23.44, y: 0.25, z: 52.19},
{x: -32.98, y: 0.25, z: 52.24},
{x: 18.26, y: 0.25, z: 1.13},
{x: -11.57, y: 0.25, z: -5.52},
{x: -15.64, y: 0.25, z: -5.85},
{x: -20.59, y: 0.25, z: -4.48},
{x: -25.40, y: 0.25, z: -2.57},
{x: -30.20, y: 0.25, z: 2.66}

];

sphereCoordinates.forEach(coord => {
    createRedSphere(coord.x, coord.y, coord.z);
});
    
    // Movement
    let movingForward = false;
    let movingBackward = false;
    let turningLeft = false;
    let turningRight = false;
    const moveSpeed = 0.065;
    const rotationSpeed = 0.025;

    const detectCollision = (x, z) => {
      // Check collision with collidables
      const collidesWithObjects = collidables.some((obj) => {
        const objPosition = new THREE.Vector3();
        obj.getWorldPosition(objPosition); // Get the object's world position
    
        const dx = x - objPosition.x;
        const dz = z - objPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
    
        return distance < 0.9; // Adjust collision radius as needed
      });
    
      // Check collision with trunks
      const collidesWithTrunks = trunks.some((trunk) => {
        const dx = x - trunk.position.x;
        const dz = z - trunk.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
    
        return distance < 0.5; // Collision radius
      });
    
      // Return true if collision detected with any object or trunk
      return collidesWithTrunks;
    };

// Define wall polygons (each wall is a set of { x, z } points)
const wallPolygons = [
    [ // Wall 1
        { x: 4.26, z: 16.61 },
        { x: 6.72, z: 11.30 },
        { x: 7.45, z: 3.97 },
        { x: 13.77, z: 1.07 },
        { x: 6.75, z: 30.12 },
        { x: -10.08, z: 32.67 },
        { x: -9.69, z: 19.21 },
        { x: -10.35, z: 16.45 },
        { x: -14.93, z: 11.75 },
        { x: -27.81, z: 11.19 },
        { x: -28.48, z: 2.81 },
        { x: -10.56, z: -2.45 },
        { x: -8.34, z: 5.91 },
        { x: -4.79, z: 14.45 },
        { x: 0.32, z: 16.33 }
    ],
    [ // Wall 2
        { x: -0.03, z: 3.01 },
        { x: -3.78, z: 4.89 },
        { x: -6.02, z: -3.73 },
        { x: -4.75, z: -7.58 },
        { x: -14.18, z: -11.33 },
        { x: -18.75, z: -17.83 },
        { x: -17.33, z: -23.75 },
        { x: -12.00, z: -18.67 },
        { x: -7.10, z: -16.59 },
        { x: -4.63, z: -21.81 },
        { x: 4.40, z: -21.56 },
        { x: 4.91, z: -16.57 },
        { x: 9.46, z: -18.18 },
        { x: 16.64, z: -25.18 },
        { x: 18.84, z: -35.50 },
        { x: 8.81, z: -36.01 },
        { x: 5.29, z: -35.11 },
        { x: 4.37, z: -29.70 },
        { x: -4.72, z: -30.22 },
        { x: -5.44, z: -41.73 },
        { x: -33.10, z: -41.87 },
        { x: -32.69, z: 11.70 },
        { x: -34.62, z: 19.27 },
        { x: -18.95, z: 32.73 },
        { x: -46.06, z: 33.06 },
        { x: -45.67, z: 53.11 },
        { x: 12.99, z: 55.15 },
        { x: 21.33, z: 51.47 },
        { x: 35.69, z: 50.85 },
        { x: 38.28, z: 38.99 },
        { x: 49.51, z: 37.67 },
        { x: 49.47, z: 8.14 },
        { x: 44.24, z: 4.17 },
        { x: 45.33, z: -2.06 },
        { x: 47.59, z: -8.92 },
        { x: 49.62, z: -20.71 },
        { x: 49.88, z: -42.00 },
        { x: 36.89, z: -41.92 },
        { x: 26.20, z: -35.18 },
        { x: 26.37, z: -21.48 },
        { x: 17.83, z: -11.50 },
        { x: 9.95, z: -5.73 },
        { x: 5.28, z: -5.16 },
        { x: 4.04, z: -1.33 }
    ],
    [ // Wall 3
        { x: -14.77, z: 18.89 },
        { x: -9.84, z: 19.07 },
        { x: -9.64, z: 32.61 },
        { x: -14.70, z: 32.76 }
    ],
    [ // Wall 4
        { x: -46.29, z: 19.53 },
        { x: -46.19, z: 33.01 },
        { x: -18.99, z: 32.60 },
        { x: -18.82, z: 19.29 }
    ],
    [ // Wall X
        { x: 18.12, z: -11.63 },
        { x: 21.12, z: -9.21 },
        { x: 20.93, z: -1.65 },
        { x: 19.35, z: 4.87 },
        { x: 16.66, z: 5.59 },
        { x: 16.45, z: 9.85 },
        { x: 22.40, z: 7.25 },
        { x: 24.89, z: -1.37 },
        { x: 26.67, z: -5.43 },
        { x: 26.75, z: -10.22 },
        { x: 22.98, z: -17.31 }
    ],
    [ // Wall Computer
        { x: 40.81, z: -28.89 },
        { x: 42.44, z: -33.68 },
        { x: 37.17, z: -35.65 },
        { x: 35.34, z: -30.78 }
    ],
    
    [ // Wall Keyboard
        { x: 33.08, z: -28.25 },
        { x: 32.39, z: -26.09 },
        { x: 37.76, z: -24.46 },
        { x: 38.46, z: -26.26 }
    ],
    
    [ // Wall Mouse
        { x: 41.11, z: -24.25 },
        { x: 42.35, z: -24.29 },
        { x: 42.19, z: -26.23 },
        { x: 40.77, z: -26.19 }
    ]
];
/*
//adding this for WALLDEBUGGING
const wallMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});
*/

wallPolygons.forEach(polygon => {
    createWallMesh(polygon);
});

// Ray-casting algorithm to check if a point is inside a polygon
function isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const { x: xi, z: zi } = polygon[i];
        const { x: xj, z: zj } = polygon[j];

        if ((zi > point.z) !== (zj > point.z) &&
            point.x < ((xj - xi) * (point.z - zi) / (zj - zi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

    /*
const detectWallCollision = (x, z) => {
    const point = new THREE.Vector3(x, 1.5, z);

    return collisionMeshes.some(mesh => {
        mesh.geometry.computeBoundingBox(); // Ensure geometry box exists
        const box = mesh.geometry.boundingBox.clone(); // Local space
        mesh.updateMatrixWorld(true);
        box.applyMatrix4(mesh.matrixWorld); // Transform to world space
        return box.containsPoint(point);
    });
};
*/
    
// Updated detectWallCollision function
/*
const detectWallCollision = (x, z) => {
    const point = new THREE.Vector3(x, 1.5, z); // Assume Stevey’s height ~1.5

    return wallMeshes.some(mesh => {
        const box = new THREE.Box3().setFromObject(mesh);
        return box.containsPoint(point);
    });
};
*/
/*
function createWallMesh(polygon) {
    const group = new THREE.Group(); // To group all wall segments for this polygon

    const wallHeight = 3;
    const wallThickness = 0.1; // Thin wall

    for (let i = 0; i < polygon.length; i++) {
        const start = polygon[i];
        const end = polygon[(i + 1) % polygon.length]; // Wrap to first point

        const dx = end.x - start.x;
        const dz = end.z - start.z;
        const length = Math.sqrt(dx * dx + dz * dz);

        const geometry = new THREE.BoxGeometry(length, wallHeight, wallThickness);
        const mesh = new THREE.Mesh(geometry, wallMaterial);

        // Position at midpoint
        const midX = (start.x + end.x) / 2;
        const midZ = (start.z + end.z) / 2;
        mesh.position.set(midX, wallHeight / 2, midZ); // Y = half height to sit on ground

        // Rotate to align with edge direction
        const angle = Math.atan2(dz, dx);
        mesh.rotation.y = -angle;

        group.add(mesh);
        wallMeshes.push(mesh); // Store for collision

        scene.add(mesh); // Add red wall to scene

        // Create collision wall mesh (yellow for debug)
        const collisionMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        const collisionMesh = new THREE.Mesh(geometry.clone(), collisionMaterial);
        
        collisionMesh.position.copy(mesh.position);
        collisionMesh.rotation.copy(mesh.rotation);
        collisionMesh.scale.copy(mesh.scale); // Just in case
        scene.add(collisionMesh);
        
        collisionMeshes.push(collisionMesh); // Store for collision

        /*
        // Create invisible collision box
        const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
        const collisionMesh = new THREE.Mesh(geometry.clone(), collisionMaterial);
        
        collisionMesh.position.copy(mesh.position);
        collisionMesh.rotation.copy(mesh.rotation);
        collisionMesh.updateMatrixWorld(true);
        
        collisionMeshes.push(collisionMesh);
        scene.add(collisionMesh);
        */
        /*
        mesh.updateMatrixWorld(true); // Force-update transform
        mesh.geometry.computeBoundingBox(); // Ensure bounding box exists
        const box = mesh.geometry.boundingBox.clone();
        box.applyMatrix4(mesh.matrixWorld); // Apply transforms
        const helper = new THREE.Box3Helper(box, 0xffff00);
        scene.add(helper);
        */

        /*
        collisionMesh.updateMatrixWorld(true);
        collisionMesh.geometry.computeBoundingBox();
        const box = collisionMesh.geometry.boundingBox.clone();
        box.applyMatrix4(collisionMesh.matrixWorld);
        const helper = new THREE.Box3Helper(box, 0xffff00);
        scene.add(helper);
        */
    /*
    }

    return group;
}

wallPolygons.forEach(polygon => {
    createWallMesh(polygon); // ✅ Just call it, don’t add returned group
});
*/
/*
    const detectWallCollision = (x, z) => {
      return walls.some(wall => {
        const dx = x - wall.position.x;
        const dz = z - wall.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < 0.9; // Collision radius for walls
      });
    };
*/


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

        const x = stevey.position.x.toFixed(2);
        const z = stevey.position.z.toFixed(2);
        document.getElementById("position").textContent = `(${x}, ${z})`;
    }
//New collision function
function checkCollisions() {
    for (let i = redSpheres.length - 1; i >= 0; i--) { // Iterate backward for safe removal
        const redSphere = redSpheres[i];

        if (stevey && redSphere) { 
            const dx = stevey.position.x - redSphere.position.x;
            const dz = stevey.position.z - redSphere.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const collisionDistance = 0.5; // Adjust as needed

            if (distance < collisionDistance) {
                // Collision detected
                scene.remove(redSphere); // Remove from scene
                redSpheres.splice(i, 1); // Remove from array
                updateScore(score + 1000); // Increase score
            }
        }
    }
    
    if (stevey && invisibleCube) {
        const steveyBox = new THREE.Box3().setFromObject(stevey);
        const cubeBox = new THREE.Box3().setFromObject(invisibleCube);

        if (steveyBox.intersectsBox(cubeBox)) {
            showDialog();
        }
    }
}
    
// Collision detection between Stevey and the red sphere (old function)
/*
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
*/
    if (mixer) mixer.update(0.016); // Ensure animations are updated
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
    let currentTime = performance.now();
    let deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    checkCollisions();
    updateFireflies(deltaTime);
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




placeGrassPlane(scene);


    animate();
  });
