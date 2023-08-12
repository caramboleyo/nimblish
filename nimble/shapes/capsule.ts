import * as THREE from 'three';
import { SupportMap } from '../computations/gjk/support-map';
import { Pose } from '../types';
import { ExtendedBox3 } from '../computations/math/extended-box3';

const vec3 = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

class CapsuleSupportMap extends SupportMap {
	private capsule: PhysicsCapsule;

	constructor(capsule: PhysicsCapsule) {
		super();
		this.capsule = capsule;
	}

	localSupportPoint(dir: THREE.Vector3): THREE.Vector3 {
		const normalizedDir = dir.length() > 0.0 ? dir : new THREE.Vector3(0, 1, 0);
		return this.localSupportPointToward(normalizedDir);
	}

	localSupportPointToward(dir: THREE.Vector3): THREE.Vector3 {
		const normalizedDir = dir.clone().normalize();
		if (normalizedDir.dot(this.capsule.start) > normalizedDir.dot(this.capsule.end)) {
			return this.capsule.start.clone().addScaledVector(normalizedDir, this.capsule.radius);
		} else {
			return this.capsule.end.clone().addScaledVector(normalizedDir, this.capsule.radius);
		}
	}
}

export class PhysicsCapsule extends THREE.Line3 {
	public readonly type = 'capsule';
	public radius: number;
	public supportMap: CapsuleSupportMap;

	constructor(radius = 0.5, halfHeight = 0.5) {
		super(new THREE.Vector3(0, halfHeight, 0), new THREE.Vector3(0, -halfHeight, 0));
		this.radius = radius;
		this.supportMap = new CapsuleSupportMap(this);
	}

	get height() {
		return this.start.distanceTo(this.end);
	}

	get halfHeight() {
		return this.height / 2;
	}

	set halfHeight(halfHeight: number) {
		const axis = this.getAxis(vec3[0]);
		const center = this.getCenter(vec3[1]);

		this.start.copy(center).addScaledVector(axis, -halfHeight);
		this.end.copy(center).addScaledVector(axis, halfHeight);
	}

	applyPose(pose: Pose) {
		this.start.applyQuaternion(pose.rotation).add(pose.position);
		this.end.applyQuaternion(pose.rotation).add(pose.position);

		return this;
	}

	getAxis(result: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
		// Use an up vector if the start and end are the same.
		if (this.start.equals(this.end)) result.set(0, 1, 0);
		else result.subVectors(this.end, this.start).normalize();

		return result;
	}

	getCenter(result: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
		return result.addVectors(this.start, this.end).multiplyScalar(0.5);
	}

	getSupportMap(): CapsuleSupportMap {
		return this.supportMap;
	}

	copy(capsule: PhysicsCapsule) {
		this.start.copy(capsule.start);
		this.end.copy(capsule.end);
		this.radius = capsule.radius;

		return this;
	}

	getLocalAABB(box: ExtendedBox3): ExtendedBox3 {
		const radiusVector = vec3[0].set(this.radius, this.radius, this.radius);
		box.min.copy(this.start).min(this.end).sub(radiusVector);
		box.max.copy(this.start).max(this.end).add(radiusVector);

		return box;
	}

	getAABB(box: ExtendedBox3, pose: Pose): ExtendedBox3 {
		this.getLocalAABB(box);
		box.min.applyQuaternion(pose.rotation).add(pose.position);
		box.max.applyQuaternion(pose.rotation).add(pose.position);

		return box;
	}
}
