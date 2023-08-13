import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	AxesHelper,
	PlaneHelper,
	Vector3,
	Object3D,
} from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';

import { computeSpherePlaneMTD } from 'nimble/computations/mtd/sphere-plane-mtd.js';
import { PhysicsSphere } from 'nimble/shapes/sphere.js';
import { PhysicsPlane } from 'nimble/shapes/plane.js';
import { SphereHelper } from 'nimble/shapes/helpers/sphere.js';
import { getVirtualPoint } from './helpers/get-virtual-point.js';

Object3D.DEFAULT_UP = new Vector3(0, 0, 1);

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -5, 10);
camera.lookAt(scene.position);
const renderer = new WebGLRenderer({
	antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new MapControls(camera, renderer.domElement);
scene.add(new AxesHelper(10)); // The X axis is red. The Y axis is green. The Z axis is blue.

globalThis.physicsSphere = new PhysicsSphere(1);
const sphere = new SphereHelper(physicsSphere);
//physicsSphere.center.z = 1;
scene.add(sphere);
const colliderA = {
	shape: physicsSphere,
	pose: {
		position: sphere.position,
		rotation: sphere.quaternion,
	},
};

globalThis.physicsPlane = new PhysicsPlane([0, 0, 1]);
const plane = new PlaneHelper(physicsPlane);
scene.add(plane);
const colliderB = {
	shape: physicsPlane,
	pose: {
		position: plane.position,
		rotation: plane.quaternion,
	},
};

document.addEventListener('click', function (event) {
	const virtualPoint = getVirtualPoint(camera, event.clientX, event.clientY);
	console.log('>>>virtualPoint', virtualPoint);
	moveTo(
		virtualPoint.x,
		virtualPoint.y,
		0, // this needs to be 1, but now 0 for penetration
	);
	console.log('>>>movingTo', movingTo);
});

globalThis.movingTo = null;
function moveTo(x, y, z) {
	movingTo = {
		x,
		y,
		z,
		lastMove: Date.now(),
	};
}

function animate() {
	renderer.render(scene, camera);

	if (movingTo !== null) {
		const now = Date.now();
		const advance = 0.0005 * (now - movingTo.lastMove);
		const target = movingTo;
		const unit = physicsSphere.center;
		console.log('init', target, unit);

		const deltaX = target.x - unit.x;
		const deltaY = target.y - unit.y;
		const deltaZ = target.z - unit.z;
		const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
		const directionX = deltaX / distance;
		const directionY = deltaY / distance;
		const directionZ = deltaZ / distance;
		const remainingDistance = distance - advance;
		console.debug('>>>remaining', remainingDistance);
		if (remainingDistance <= 0) {
			movingTo = null;
		} else {
			unit.x += advance * directionX;
			unit.y += advance * directionY;
			unit.z += advance * directionZ;
			movingTo.lastMove = now;
		}

		const mtd = computeSpherePlaneMTD(
			colliderA.shape,
			colliderA.pose,
			colliderB.shape,
			colliderB.pose,
		);
		if (mtd) {
			//colliderA.pose.position.add(mtd.direction.multiplyScalar(mtd.distance));
			console.debug('CORRECTING', mtd);
			physicsSphere.center.add(mtd.direction.multiplyScalar(mtd.distance));
			console.debug(physicsSphere.center);
		}
	}

	requestAnimationFrame(animate);
}
animate();
