import * as THREE from 'three';
import { MtdResult } from './mtd-result';
import { PhysicsSphere } from '../../shapes/sphere';
import { PhysicsBox } from '../../shapes/box';
import { Pose } from '../../types';

const vec3 = [
	new THREE.Vector3(),
	new THREE.Vector3(),
	new THREE.Vector3(),
	new THREE.Vector3(),
	new THREE.Vector3(),
];
const quat = [new THREE.Quaternion()];

const posedSphere = new PhysicsSphere();
const posedBox = new PhysicsBox();

export function computeSphereBoxMTD(
	sphere: PhysicsSphere,
	spherePose: Pose,
	box: PhysicsBox,
	boxPose: Pose,
	result = new MtdResult()
): MtdResult | null {
	posedSphere.copy(sphere).applyPose(spherePose);
	posedBox.copy(box).applyPose(boxPose);

	const contactDistance = 0;
	const delta = vec3[0].subVectors(posedBox.center, posedSphere.center);
	const dRot = vec3[1].copy(delta).applyQuaternion(quat[0].copy(posedBox.rotation).conjugate());

	const boxExtents = box.halfExtents;
	let outside = false;

	for (let i = 0; i < 3; i++) {
		if (dRot.getComponent(i) < -boxExtents.getComponent(i)) {
			outside = true;
			dRot.setComponent(i, -boxExtents.getComponent(i));
		} else if (dRot.getComponent(i) > boxExtents.getComponent(i)) {
			outside = true;
			dRot.setComponent(i, boxExtents.getComponent(i));
		}
	}

	if (outside) {
		const point = vec3[2].copy(dRot).applyQuaternion(posedBox.rotation);
		const normal = vec3[3].copy(delta).sub(point);
		const lenSquared = normal.lengthSq();
		const inflatedDist = posedSphere.radius + contactDistance;

		if (lenSquared > inflatedDist * inflatedDist) return null;

		result.distance = Math.sqrt(lenSquared);
		result.direction.copy(normal).normalize();
		result.point.copy(point.add(posedBox.center));
		result.distance -= posedSphere.radius;
	} else {
		const absdRot = vec3[2].copy(dRot).set(Math.abs(dRot.x), Math.abs(dRot.y), Math.abs(dRot.z));
		const distToSurface = vec3[3].copy(boxExtents).sub(absdRot);

		let minAxisIndex = 0;
		let minDistToSurface = distToSurface.x;
		if (distToSurface.y < minDistToSurface) {
			minDistToSurface = distToSurface.y;
			minAxisIndex = 1;
		}
		if (distToSurface.z < minDistToSurface) {
			minDistToSurface = distToSurface.z;
			minAxisIndex = 2;
		}

		let locNorm = vec3[4];
		locNorm.setComponent(minAxisIndex, dRot.getComponent(minAxisIndex) > 0 ? 1 : -1);
		result.distance = -distToSurface.getComponent(minAxisIndex);

		result.point.copy(posedSphere.center);
		result.direction.copy(locNorm).applyQuaternion(posedBox.rotation);
		result.distance += posedSphere.radius;
	}

	return result;
}
