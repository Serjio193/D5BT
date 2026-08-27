import * as THREE from 'https://esm.sh/three@0.169.0';
import {OrbitControls} from 'https://esm.sh/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://esm.sh/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';

const host=document.getElementById('viewer3d');
const status=document.getElementById('viewer3dStatus');
const color=document.getElementById('viewer3dColor');
if(!host)throw new Error('viewer3d host missing');

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,1,.01,100);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,premultipliedAlpha:false,powerPreference:'high-performance'});
renderer.setClearColor(0x000000,0);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff,0x283244,2.35));
const key=new THREE.DirectionalLight(0xffffff,3.4);key.position.set(3,4,5);scene.add(key);
const fill=new THREE.DirectionalLight(0xb8c9ff,1.15);fill.position.set(-4,1,3);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,1.25);rim.position.set(0,3,-5);scene.add(rim);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.06;
controls.enablePan=false;
controls.target.set(0,0,0);

let root=null;
const bodyMeshes=[];
const loader=new GLTFLoader();
loader.load('assets/ps5_controller_no_logo.glb?v=20260827-3',gltf=>{
  root=gltf.scene;

  const remove=[];
  root.traverse(o=>{
    const n=(o.name||'').toLowerCase();
    if(n==='plane'||n.startsWith('plane_')){remove.push(o);return;}
    if(!o.isMesh)return;
    o.castShadow=false;
    o.receiveShadow=false;
    if(/main[ _-]*control/.test(n))bodyMeshes.push(o);
  });
  remove.forEach(o=>o.parent?.remove(o));

  // Original model uses modelling coordinates. Rotate to a normal front view.
  // No Z=PI here: that was turning the controller upside down on screen.
  root.rotation.set(-Math.PI/2,0,0);
  scene.add(root);
  root.updateMatrixWorld(true);

  let box=new THREE.Box3().setFromObject(root);
  const center=box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.updateMatrixWorld(true);

  box.setFromObject(root);
  const size=box.getSize(new THREE.Vector3());
  const max=Math.max(size.x,size.y,size.z);
  root.scale.setScalar(2.8/max);
  root.updateMatrixWorld(true);

  box.setFromObject(root);
  const fitted=box.getSize(new THREE.Vector3());
  const vfov=THREE.MathUtils.degToRad(camera.fov);
  const hfov=2*Math.atan(Math.tan(vfov/2)*camera.aspect);
  const distX=fitted.x/(2*Math.tan(hfov/2));
  const distY=fitted.y/(2*Math.tan(vfov/2));
  const distance=Math.max(distX,distY)*1.04;
  camera.position.set(0,0,distance);
  camera.lookAt(0,0,0);
  controls.target.set(0,0,0);
  controls.minDistance=distance*.6;
  controls.maxDistance=distance*3;
  controls.update();

  if(status)status.textContent=`3D v3 · Plane удалён · корпус: ${bodyMeshes.length} meshes`;
},e=>{
  if(status&&e.total)status.textContent=`Загрузка ${Math.round(e.loaded/e.total*100)}%`;
},err=>{console.error(err);if(status)status.textContent='Ошибка загрузки GLB';});

function applyBodyColor(hex){
  const c=new THREE.Color(hex);
  bodyMeshes.forEach(mesh=>{
    const source=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    const changed=source.map(m=>{const n=m.clone();if(n.color)n.color.copy(c);n.needsUpdate=true;return n});
    mesh.material=Array.isArray(mesh.material)?changed:changed[0];
  });
}
if(color)color.addEventListener('input',()=>applyBodyColor(color.value));
window.D5BT_3D={setBodyColor:applyBodyColor,get model(){return root}};

function fitCameraAfterResize(){
  if(!root)return;
  const box=new THREE.Box3().setFromObject(root);
  const size=box.getSize(new THREE.Vector3());
  const vfov=THREE.MathUtils.degToRad(camera.fov);
  const hfov=2*Math.atan(Math.tan(vfov/2)*camera.aspect);
  const distance=Math.max(size.x/(2*Math.tan(hfov/2)),size.y/(2*Math.tan(vfov/2)))*1.04;
  camera.position.set(0,0,distance);
  controls.minDistance=distance*.6;
  controls.maxDistance=distance*3;
  controls.update();
}
function resize(){
  const w=host.clientWidth,h=Math.max(320,host.clientHeight);
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
  fitCameraAfterResize();
}
new ResizeObserver(resize).observe(host);
resize();
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera)});
