import { useEffect, useRef } from "react";
import * as THREE from "three";
import URDFLoader from "urdf-loader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function RobotViewer() {

  const mountRef = useRef(null);

  useEffect(() => {

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );

    camera.position.set(2,2,2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );

    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5,5,5);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const loader = new URDFLoader();

    const grid = new THREE.GridHelper(10,10);
    scene.add(grid);

    loader.packages = {
      "my_robot_description": "/robot/"
    };

    loader.load(
      "/robot/my_robot.urdf",
      robot => {

        robot.rotation.x = -Math.PI / 2;

        scene.add(robot);

        console.log("Robot loaded", robot);

      }
    );

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}