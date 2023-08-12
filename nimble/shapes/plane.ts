import { ExtendedBox3 } from '../computations/math/extended-box3';
import { Pose } from '../types';
import * as THREE from 'three';

export class PhysicsPlane extends THREE.Plane {
	public readonly type = 'plane';

	constructor(normal: THREE.Vector3 | [number, number, number] = [0, 1, 0], constant = 0) {
		normal = Array.isArray(normal)
			? new THREE.Vector3(...normal)
			: normal ?? new THREE.Vector3();
		super(normal, constant);
	}

	applyPose(pose: Pose) {
		this.normal.applyQuaternion(pose.rotation);
		this.constant -= pose.position.dot(this.normal);

		return this;
	}

	getLocalAABB(box: ExtendedBox3): ExtendedBox3 {
		return box;
	}

	getAABB(box: ExtendedBox3, pose: Pose): ExtendedBox3 {
		return box;
	}
}
