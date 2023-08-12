import { Vector3 } from 'three';

const pointerVec = new Vector3();

export function getVirtualPoint(camera, screenX, screenY) {
	const x = (screenX / window.innerWidth) * 2 - 1;
	const y = -(screenY / window.innerHeight) * 2 + 1;
	const pointer = new Vector3();
	pointerVec.set(x, y, 0.5);
	pointerVec.unproject(camera);
	pointerVec.sub(camera.position).normalize();
	const distance = (0 - camera.position.z) / pointerVec.z;
	pointer.copy(camera.position).add(pointerVec.multiplyScalar(distance));
	return pointer;
}
