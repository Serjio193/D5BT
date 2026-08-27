import * as THREE from 'https://esm.sh/three@0.169.0';
import {OrbitControls} from 'https://esm.sh/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://esm.sh/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';

const host=document.getElementById('viewer3d');
const status=document.getElementById('viewer3dStatus');
const color=document.getElementById('viewer3dColor');
if(!host) throw new Error('viewer3d host missing');

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x090f19);
const camera=new THREE.PerspectiveCamera(34,1,.01,100);
camera.position.set(0,1.1,3.2);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff,0x243044,2.2));
const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(3,4,5);scene.add(key);
const fill=new THREE.DirectionalLight(0x9db7ff,1.2);fill.position.set(-4,1,2);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,1.4);rim.position.set(0,2,-5);scene.add(rim);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.06;controls.enablePan=false;controls.minDistance=1.7;controls.maxDistance=6;
let root=null;
const bodyMeshes=[];
const loader=new GLTFLoader();
loader.load('assets/ps5_controller_no_logo.glb',gltf=>{
  root=gltf.scene;
  root.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=false;o.receiveShadow=false;
    if((o.name||'').toLowerCase().startsWith('main controler')) bodyMeshes.push(o);
  });
  const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  const max=Math.max(size.x,size.y,size.z),scale=2.35/max;
  root.scale.setScalar(scale);
  root.rotation.x=-Math.PI/2;
  scene.add(root);
  controls.target.set(0,0,0);
  camera.position.set(0,.15,3.25);
  controls.update();
  if(status) status.textContent=`Загружено · корпус: ${bodyMeshes.length} meshes`;
  applyBodyColor(color?.value||'#f1f3f6');
},e=>{
  if(status&&e.total)status.textContent=`Загрузка ${Math.round(e.loaded/e.total*100)}%`;
},err=>{console.error(err);if(status)status.textContent='Ошибка загрузки GLB';});

function applyBodyColor(hex){
  const c=new THREE.Color(hex);
  bodyMeshes.forEach(mesh=>{
    const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    mesh.material=mats.map(m=>{const n=m.clone();if(n.color)n.color.copy(c);n.needsUpdate=true;return n;});
    if(!Array.isArray(mesh.material)) mesh.material=mesh.material[0];
  });
}
if(color)color.addEventListener('input',()=>applyBodyColor(color.value));
window.D5BT_3D={setBodyColor:applyBodyColor,get model(){return root}};

function resize(){const w=host.clientWidth,h=Math.max(320,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(host);resize();
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera)});
