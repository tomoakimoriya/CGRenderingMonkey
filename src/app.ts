import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

class ThreeJSContainer {
    private scene: THREE.Scene;
    private material: THREE.Material;
    private light: THREE.Light;
    private cloader: ColladaLoader;
    private monkeyheadlambert: THREE.Mesh;
    private monkeyheadhalflambert: THREE.Mesh;

    constructor() {

    }

    // 画面部分の作成(表示する枠ごとに)
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x495ed));

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();

        // 毎フレームのupdateを呼んで，render
        // reqest... により次フレームを呼ぶ
        const render = () => {
            orbitControls.update();

            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        }
        render();

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = () => {
        this.scene = new THREE.Scene();

        // requireにより，サーバーサイド読み込み
        const vert = require("./vertex.vs").default;
        const frag = require("./fragment.fs").default;

        let uniforms = {
            modelcolor: new THREE.Uniform(new THREE.Vector3(0, 1, 0)),
        }

        uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib["lights"],
            uniforms
        ]);

        this.material = new THREE.ShaderMaterial({
            lights: true,
            uniforms: uniforms,
            vertexShader: vert,
            fragmentShader: frag
        });

        this.cloader = new ColladaLoader();
        this.cloader.load('monkey.dae', (result) => {
            console.log(result);
            this.monkeyheadlambert = <THREE.Mesh>result.scene.children[2].clone();
            this.monkeyheadhalflambert = <THREE.Mesh>result.scene.children[2].clone();
            this.scene.add(this.monkeyheadlambert);
            this.scene.add(this.monkeyheadhalflambert);
            this.monkeyheadlambert.rotateX(-90);
            this.monkeyheadhalflambert.rotateX(-90);
            this.monkeyheadlambert.position.set(0, 1.0, 0);
            this.monkeyheadhalflambert.position.set(0, -1.0, 0);

            this.monkeyheadlambert.material = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
            this.monkeyheadhalflambert.material = this.material;
        });


        this.light = new THREE.DirectionalLight(0xffffff);
        var lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        // reqest... により次フレームを呼ぶ
        const update = () => {
            const rotXMat = new THREE.Matrix4();
            rotXMat.makeRotationX(0.01);
            this.light.position.copy(this.light.position.applyMatrix4(rotXMat));

            requestAnimationFrame(update);
        }
        update();
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    let container = new ThreeJSContainer();

    let viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 0, 5));
    document.body.appendChild(viewport);
}
