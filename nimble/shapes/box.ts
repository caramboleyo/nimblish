import * as THREE from 'three';
import { Pose } from '../types';
import { SupportMap } from '../computations/gjk/support-map';
import { ExtendedBox3 } from '../computations/math/extended-box3';

const vec3 = [new THREE.Vector3()];

function getSign(value: number) {
	let sign = Math.sign(value);
	if (sign === 0 && Object.is(value, -0)) sign = -1;
	return sign;
}

class BoxSupportMap extends SupportMap {
	private box: PhysicsBox;

	constructor(box: PhysicsBox) {
		super();
		this.box = box;
	}

	localSupportPoint(dir: THREE.Vector3): THREE.Vector3 {
		return new THREE.Vector3(
			getSign(dir.x) * this.box.halfExtents.x,
			getSign(dir.y) * this.box.halfExtents.y,
			getSign(dir.z) * this.box.halfExtents.z
		);
	}
}

export class PhysicsBox {
	public readonly type = 'box';
	public halfExtents: THREE.Vector3;
	public center: THREE.Vector3;
	public rotation: THREE.Quaternion;

	constructor(halfExtents: THREE.Vector3 | [number, number, number] = [1, 1, 1]) {
		halfExtents = Array.isArray(halfExtents)
			? new THREE.Vector3(...halfExtents)
			: halfExtents ?? new THREE.Vector3();
		this.halfExtents = halfExtents;
		this.center = new THREE.Vector3();
		this.rotation = new THREE.Quaternion();
	}

	copy(box: PhysicsBox) {
		this.halfExtents.copy(box.halfExtents);
		this.center.copy(box.center);
		this.rotation.copy(box.rotation);

		return this;
	}

	applyPose(pose: Pose) {
		this.center.copy(pose.position);
		this.rotation.copy(pose.rotation);

		return this;
	}

	getSupportMap(): SupportMap {
		return new BoxSupportMap(this);
	}

	getLocalAABB(box: ExtendedBox3): ExtendedBox3 {
		box.min.set(-this.halfExtents.x, -this.halfExtents.y, -this.halfExtents.z);
		box.max.set(this.halfExtents.x, this.halfExtents.y, this.halfExtents.z);

		return box;
	}

	getAABB(box: ExtendedBox3, pose: Pose): ExtendedBox3 {
		const transformedHalfExtents = vec3[0].copy(this.halfExtents).applyQuaternion(pose.rotation);
		box.min.copy(pose.position).sub(transformedHalfExtents);
		box.max.copy(pose.position).add(transformedHalfExtents);

		return box;
	}
}
