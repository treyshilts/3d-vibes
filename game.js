let mixer = null;
let walkAction = null;
let redSphere = null;
let isWalking = false; // Tracks whether Stevey is currently walking  

let score = 0; // Default score

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

const updateScore = (newScore) => {
    score = newScore;
    document.getElementById('score').textContent = score;
};

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('threejs-scene');
    const scene = new THREE.Scene();

    // scene.fog = new THREE.Fog(0xaaaaaa, 0.5, 30);

    // Add the sky sphere
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

    const collidables = [];

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

    // Initial two sprites at predefined positions
    //createSprite(materials[0], 0, 4);
    //createSprite(materials[3], 1, 4);

    console.log("Placed initial two sprites.");

    // Randomly distribute 3,000 sprites within the bounding box
    const minX = -45.67, maxX = 49.05;
    const minZ = -40.36, maxZ = 57.06;
    const numSprites = 3000;

    for (let i = 0; i < numSprites; i++) {
        const x = Math.random() * (maxX - minX) + minX;
        const z = Math.random() * (maxZ - minZ) + minZ;

        const material = materials[Math.floor(Math.random() * materials.length)];
        createSprite(material, x, z);
    }

    console.log("Randomly placed 3,000 grass and flower sprites.");
}

//firefly function#2
// Create firefly group
const fireflies = new THREE.Group();
scene.add(fireflies);

// Firefly settings
const numFireflies = 2000; // Increase number for full-map effect
const fireflySize = 0.05; // Slightly bigger for visibility
const spawnRange = 100; // Fireflies will spawn within a 50-unit cube

// Firefly material (WHITE instead of orange)
const fireflyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });

// Function to spawn a firefly anywhere in the map
function spawnFirefly() {
    const geometry = new THREE.SphereGeometry(fireflySize, 8, 8);
    const firefly = new THREE.Mesh(geometry, fireflyMaterial);

    // Position anywhere in the map
    const position = getRandomPosition();
    firefly.position.set(position.x, position.y, position.z);

    // Unique flicker timing for each firefly
    firefly.userData = { 
    timeOffset: Math.random() * Math.PI * 2 // 🔥 Ensures every firefly starts at a different point
    };

    fireflies.add(firefly);
}

// Get a random position anywhere in the map
function getRandomPosition() {
    return new THREE.Vector3(
        (Math.random() - 0.5) * spawnRange, // Random X
        Math.random() * spawnRange * 0.25,  // Random Y (keep them higher)
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
function updateFireflies() {
    const time = performance.now() * 0.001;

const maxDistance = 20; // Fireflies disappear beyond this distance

const flickerSpeed = Math.PI / 1;

fireflies.children.forEach(firefly => {
    const t = (time + firefly.userData.timeOffset) * flickerSpeed;
    firefly.material.opacity = 0.2 + 0.8 * Math.sin(t); // 🔥 Smooth slow flickering
    firefly.position.y += 0.005 * Math.sin(t * 0.5); // Floating motion
    
    // Check if firefly is too far from the camera
    if (firefly.position.distanceTo(camera.position) > maxDistance) {
        const newPos = camera.position.clone().add(getRandomPositionInSphere(maxDistance));
        firefly.position.set(newPos.x, newPos.y, newPos.z);
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
// Tree Positions
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
    }
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
treePositions.forEach(({ x, z }) => createTree(x, z, 3.0));

// Add Bigger Trees (10% larger)
biggerTreePositions.forEach(({ x, z }) => createTree(x, z, 3.25)); // Scale = 3.2

// Add Smaller Trees (10% smaller)
smallerTreePositions.forEach(({ x, z }) => createTree(x, z, 2.8)); // Scale = 1.34

// Add Largest Trees (30% larger)
largestTreePositions.forEach(({ x, z }) => createTree(x, z, 3.5)); // Scale = .0

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

        const bridgeTexture = textureLoader.load('https://treyshilts.github.io/3d-vibes/bridge.', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 1);
    });


    mapLoader.load(
        'https://treyshilts.github.io/3d-vibes/finalmap_summer3d_0125.glb',
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
                    } else if (child.name.includes('shroomtop')) {
                        child.material = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
                    } else if (child.name.includes('door')) {
                        child.material = new THREE.MeshLambertMaterial({ map: doorTexture });
                    } else if (child.name.includes('trunk')) {
                        child.material = new THREE.MeshLambertMaterial({ map: barkTexture });
                    } else if (child.name.includes('house.roof')) {
                        child.material = new THREE.MeshLambertMaterial({ map: roofTexture });
                    } else if (child.name.includes('tinyroof')) {
                        child.material = new THREE.MeshLambertMaterial({ map: roofTexture });
                    } else if (child.name.includes('house.front')) {
                        child.material = new THREE.MeshLambertMaterial({ map: brickTexture });
                    } else if (child.name.includes('house.sides')) {
                        child.material = new THREE.MeshLambertMaterial({ map: brickTexture });
                    } else if (child.name.includes('tinyhouse')) {
                        child.material = new THREE.MeshLambertMaterial({ map: brickTexture });
                    } else if (child.name.includes('dirt')) {
                        child.material = new THREE.MeshLambertMaterial({ map: dirtTexture });
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
    
function createRedSphere(x, y, z) {
    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red color
    const redSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    redSphere.position.set(x, y, z); // Set the sphere's position
    scene.add(redSphere);
}

    // Movement
    let movingForward = false;
    let movingBackward = false;
    let turningLeft = false;
    let turningRight = false;
    const moveSpeed = 0.05;
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
      return collidesWithObjects || collidesWithTrunks;
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

        const x = stevey.position.x.toFixed(2);
        const z = stevey.position.z.toFixed(2);
        document.getElementById("position").textContent = `(${x}, ${z})`;
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
    updateFireflies();
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
