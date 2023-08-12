import * as THREE from 'three';
import { Pose } from '../types';
import { ExtendedBox3 } from '../computations/math/extended-box3';
/*import { SupportMap } from '../computations/gjk/support-map';

class SphereSupportMap extends SupportMap {
	private sphere: PhysicsSphere;

	constructor(sphere: PhysicsSphere) {
		super();
		this.sphere = sphere;
	}

	supportPoint(transform: Pose, dir: THREE.Vector3): THREE.Vector3 {
		return this.supportPointToward(transform, dir.clone().normalize());
	}

	supportPointToward(transform: Pose, dir: THREE.Vector3): THREE.Vector3 {
		return transform.position
			.clone()
			.addScaledVector(dir.clone().normalize(), this.sphere.radius);
	}

	localSupportPoint(dir: THREE.Vector3): THREE.Vector3 {
		return this.localSupportPointToward(dir.clone().normalize());
	}

	localSupportPointToward(dir: THREE.Vector3): THREE.Vector3 {
		return dir.clone().normalize().multiplyScalar(this.sphere.radius);
	}
}
*/

export class PhysicsSphere extends THREE.Sphere {
	public readonly type = 'sphere';

	constructor(radius = 1, center?: THREE.Vector3 | [number, number, number]) {
		center = Array.isArray(center)
			? new THREE.Vector3(...center)
			: center ?? new THREE.Vector3();
		super(center, radius);
	}

	applyPose(pose: Pose) {
		this.center.applyQuaternion(pose.rotation).add(pose.position);
		return this;
	}

	getSupportMap(): SupportMap {
		return new SphereSupportMap(this);
	}

	getLocalAABB(box: ExtendedBox3): ExtendedBox3 {
		return this.getBoundingBox(box) as ExtendedBox3;
	}

	getAABB(box: ExtendedBox3, pose: Pose): ExtendedBox3 {
		if (this.isEmpty()) {
			box.makeEmpty();
			return box;
		}

		box.set(pose.position, pose.position);
		box.expandByScalar(this.radius);

		return box;
	}
}
