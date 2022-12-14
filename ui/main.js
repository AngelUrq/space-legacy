import "./style.css";
import * as THREE from "three";
import config from "./db.json";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import planetPoint from "./planetVector3.json";

import {
  createPlanet,
  eucDistance,
  getNodePositionById,
  getRandom,
} from "./helpers";
import starsTexture from "./img/sky.jpg";
import mercuryTexture from "./img/mercury.jpg";
import venusTexture from ".//img/venus.jpg";
import marsTexture from "./img/mars.jpg";
import jupiterTexture from "./img/jupiter.jpg";
import saturnTexture from "./img/saturn.jpg";
import uranusTexture from "./img/uranus.jpg";
import neptuneTexture from "./img/neptune.jpg";
import plutoTexture from "./img/pluto.jpg";
import ceresTexture from "./img/ceres.jpg";
import erisTexture from "./img/eris.jpg";
import haumeaTexture from "./img/haumea.jpg";
import makemakeTexture from "./img/makemake.jpg";
import neptureTexture from "./img/nepture.jpg";
import venus2Texture from "./img/venus2.jpg";
import moonTexture from "./img/moon.jpg";
import sunTexture from "./img/sun.jpg";

const textures = [
  mercuryTexture,
  venusTexture,
  marsTexture,
  jupiterTexture,
  saturnTexture,
  uranusTexture,
  neptuneTexture,
  plutoTexture,
  ceresTexture,
  erisTexture,
  haumeaTexture,
  makemakeTexture,
  neptureTexture,
  venus2Texture,
  moonTexture
];
const planets = [];

const renderer = new THREE.WebGLRenderer({ antialias: true });

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  10000
);

const controls = new OrbitControls(camera, renderer.domElement);
let normax;
let normay;
let normaz;
let IsNewTarget = false;
let targetPlanet;
controls.target.set(0, 0, 0);
camera.position.set(861, 671, 1442);

controls.update();

const ambientLight = new THREE.AmbientLight(0x333333, 0.8);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0x333333, 4);
mainLight.position.set(100, -100, 500);
scene.add(mainLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

const textureLoader = new THREE.TextureLoader();

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
const documents = config.documents;
const planetPoints = planetPoint.points;
let points = [];

for (let index = 0; index < documents.length; index++) {
  const planet = createPlanet(textures, textureLoader, planetPoints[index]);
  planet.mesh.userData.scores = documents[index].scores;
  planet.mesh.userData.documentId = documents[index].id;
  planet.mesh.userData.title = documents[index].title;
  planet.mesh.userData.keywords = documents[index].keywords;
  planet.mesh.userData.summary = documents[index].summary;
  planet.mesh.userData.authorAffiliations = documents[index].authorAffiliations;
  planet.mesh.userData.downloads = documents[index].downloads;

  planets.push(planet);
  scene.add(planet.obj);
}

const sun = createPlanet([sunTexture], textureLoader, [745 / 1500, 549 / 1500, 1249 / 1500]);
sun.mesh.userData.scores = documents[0].scores;
sun.mesh.userData.documentId = documents[0].id;
sun.mesh.userData.title = documents[0].title;
sun.mesh.userData.keywords = documents[0].keywords;
sun.mesh.userData.summary = documents[0].summary;
sun.mesh.userData.authorAffiliations = documents[0].authorAffiliations;
sun.mesh.userData.downloads = documents[0].downloads;
planets.push(sun);
scene.add(sun.obj);

for (let j = 0; j < planets.length; j++) {
  const scores = planets[j].mesh.userData.scores;
  points.push(planets[j].mesh.position);

  for (let k = 0; k < scores.length; k++) {
    if (scores[k].score < 0.6) {
      const point = getNodePositionById(scores[k].id, planets);
      points.push(point);
    }
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);
  points = [];
}

const pointLight = new THREE.PointLight(0xffffff, 2, 500);
pointLight.position.set(300, 0, 0);
scene.add(pointLight);

function animate() {
  planets.forEach((planet) => {
    planet.mesh.rotateY(getRandom(1, 10) / 1000);
  });

  if (IsNewTarget) {
    camera.lookAt(targetPlanet);
    camera.position.set(
      camera.position.x + normax * 10,
      camera.position.y + normay * 10,
      camera.position.z + normaz * 10
    );
    const distance = Math.sqrt(
      Math.pow(targetPlanet.x - camera.position.x, 2) +
        Math.pow(targetPlanet.y - camera.position.y, 2) +
        Math.pow(targetPlanet.z - camera.position.z, 2)
    );

    if (distance < 200) {
      IsNewTarget = false;
      controls.target.set(
        targetPlanet.x,
        targetPlanet.y,
        targetPlanet.z + 0.01
      );
      camera.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
      );
      camera.lookAt(targetPlanet);
      targetPlanet = null;
    }
  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();

/* Modal */
var modal = document.getElementById("info-modal");
var span = document.getElementsByClassName("close")[0];

span.onclick = function () {
  modal.style.display = "none";
};

const DOWNLOAD_URL = "https://ntrs.nasa.gov";

window.addEventListener("click", (event) => {
  event.preventDefault();

  if (event.target == modal) modal.style.display = "none";

  var canvasBounds = renderer.domElement.getBoundingClientRect();

  clickMouse.x =
    ((event - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) *
      2 -
    1;
  clickMouse.y =
    -(
      (event.clientY - canvasBounds.top) /
      (canvasBounds.bottom - canvasBounds.top)
    ) *
      2 +
    1;

  raycaster.setFromCamera(
    {
      x: (2 * event.offsetX) / event.target.clientWidth - 1,
      y: (-2 * event.offsetY) / event.target.clientHeight + 1,
    },
    camera
  );
  const found = raycaster.intersectObjects(scene.children);

  if (found.length > 0) {
    found.forEach((element) => {
      if (element.object.userData.documentId) {
        normax =
          (element.object.position.x - camera.position.x) / element.distance;
        normay =
          (element.object.position.y - camera.position.y) / element.distance;
        normaz =
          (element.object.position.z - camera.position.z) / element.distance;
        targetPlanet = element.object.position;
        IsNewTarget = true;
      }
    });

    setTimeout(() => {
      const paperData = found[0].object.userData;
      modal.style.display = "block";

      let paperContent = document.getElementById("paper-content");
      let authors = "";
      let url = "";

      paperData.authorAffiliations.forEach(
        (authorAffiliation) =>
          (authors += `${authorAffiliation.meta.author.name},`)
      );
      authors = authors.substring(0, authors.length - 1);

      if (paperData.downloads.length > 0)
        url = DOWNLOAD_URL + paperData.downloads[0].links.original;

      paperContent.innerHTML = `
        <h2>${paperData.title}</h2>
        <p><strong>Authors:</strong>&nbsp;${authors}</p>
        <p><strong>Keywords:</strong>&nbsp;${paperData.keywords}</p>
        <p><strong>Summary:</strong>&nbsp;${paperData.summary}...</p>
        <div class="download-container">
          <button class="btn-download" onclick="window.open('${url}', '_blank');">See</button>
        </div>
      `;
    }, 1000 * 1);
  }
});

window.addEventListener("resize", function () {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

/* Query */
const API_URL = "http://192.168.23.78:5000";

const searchButton = document.getElementById("search-button");
searchButton.onclick = function () {
  const newSearchPosition = getNodePositionById(19900004638, planets);

  targetPlanet = newSearchPosition;

  const distance = Math.sqrt(
    Math.pow(targetPlanet.x - camera.position.x, 2) +
      Math.pow(targetPlanet.y - camera.position.y, 2) +
      Math.pow(targetPlanet.z - camera.position.z, 2)
  );
  normax = (newSearchPosition.x - camera.position.x) / distance;
  normay = (newSearchPosition.y - camera.position.y) / distance;
  normaz = (newSearchPosition.z - camera.position.z) / distance;
  IsNewTarget = true;

  /* const query = document.getElementById("searcher").value;
  let data = { query };
  let distances = [];

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => {
    res.json().then((embedding) => {
      documents.forEach((document) => {
        let distance = eucDistance(embedding, document.embedding);
        distances.push({
          documentId: document.id,
          value: distance,
        });
      });

      let minDistanceDoc = distances[0];

      for (let i = 1; i < distances.length; i++) {
        if (minDistanceDoc.value > distances[i].value)
          minDistanceDoc = distances[i];
      }
      const newSearchPosition = getNodePositionById(
        minDistanceDoc.documentId,
        planets
      );
      // Move camera to node with id (minDistanceDoc.documentId)
      targetPlanet = newSearchPosition;

      const distance = Math.sqrt(
        Math.pow(targetPlanet.x - camera.position.x, 2) +
          Math.pow(targetPlanet.y - camera.position.y, 2) +
          Math.pow(targetPlanet.z - camera.position.z, 2)
      );
      normax = (newSearchPosition.x - camera.position.x) / distance;
      normay = (newSearchPosition.y - camera.position.y) / distance;
      normaz = (newSearchPosition.z - camera.position.z) / distance;
      IsNewTarget = true;
    });
  });*/
};
