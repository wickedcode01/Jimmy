import * as THREE from "three";
import { useEffect } from 'react'
import './index.less'
export default function IndexPage() {
  const sence = new THREE.Scene();
  let mesh:any=null;
  let material = new THREE.MeshPhongMaterial({
    color: '#ccc',
    specular: '#fff',
    shininess: 6,
    // normalMap: textureNormal, //法线贴图
    normalScale: new THREE.Vector2(3, 3),
  });
  useEffect(() => {
    let geo = new THREE.BoxGeometry(150, 150, 150);
    // var textureLoader = new THREE.TextureLoader();
    // 加载法线贴图
    // var textureNormal = textureLoader.load(require('./dist/base.jpg'));
   
    mesh = new THREE.Mesh(geo, material);
    sence.add(mesh);
    let point = new THREE.PointLight("#d1236a");
    point.position.set(-200, 300, 300);
    sence.add(point);
    let point2 = new THREE.PointLight("#1a8fcf");
    point2.position.set(200, -300, 300);
    sence.add(point2);
    // let amb=new THREE.AmbientLight('red')
    // sence.add(amb)
    let width = window.innerWidth;
    let height = window.innerHeight;
    let k = width / height, s = 300;
    let camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
    camera.position.set(0, 0, 200);
    camera.lookAt(sence.position);
    let render = new THREE.WebGLRenderer({ alpha: true,antialias:true });

    render.setSize(width, height);
    render.setClearColor("#ccc", 0);
    const target = document.getElementById("bg");
    if(target){
      target.innerHTML = '';
      target.appendChild(render.domElement)
    }



    window.onresize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      k = width / height;//窗口宽高比
      camera.left = -s * k;
      camera.right = s * k;
      camera.top = s;
      camera.bottom = -s;
      camera.updateProjectionMatrix();
      render.setSize(width, height);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;
      render.render(sence, camera);
    };

    animate();
  }, []);

  const change = () => {
    const seed=Math.floor(Math.random()*3)
    console.log("changed:",seed)
    
    sence.remove(mesh)
    mesh.geometry.dispose()
    let geo ;
    switch(seed ){
      case 0:geo=new THREE.BoxGeometry(150, 150, 150);break;
      case 1:geo = new THREE.OctahedronGeometry(150,Math.floor(Math.random()*4) );break;
      default:geo=new THREE.SphereGeometry( 150, Math.random() * 64, Math.random() * 32 )
    }

    mesh = new THREE.Mesh(geo, material);
    sence.add(mesh);
  }

  return (
    <div className="mainPage">
      <div id="bg"></div>
      <div className="content">
        <h1>Jimmy Yen</h1>
        <hr />
        <div className="bio">Nomad, Coder, Thinker</div>

        <a href="https://github.com/wickedcode01"><button>Learn More</button></a> 
      </div>



    </div>
  );
}
