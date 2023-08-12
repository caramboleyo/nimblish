import * as THREE from 'three';
import { MtdResult } from './mtd-result';
import { PhysicsBox } from '../../shapes/box';
import { Pose } from '../../types';

const vec3 = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
const posedBoxA = new PhysicsBox();
const posedBoxB = new PhysicsBox();

function getRotatedAxis(box: PhysicsBox, axisIndex: number): THREE.Vector3 {
	let axis = new THREE.Vector3();
	axis.setComponent(axisIndex, 1); // Set the selected axis to 1, others to 0
	axis.applyQuaternion(box.rotation);
	return axis;
}

function projectBoxOnAxis(box: PhysicsBox, axis: THREE.Vector3): [number, number] {
	const boxExt =
		Math.abs(getRotatedAxis(box, 0).dot(axis)) * box.halfExtents.x +
		Math.abs(getRotatedAxis(box, 1).dot(axis)) * box.halfExtents.y +
		Math.abs(getRotatedAxis(box, 2).dot(axis)) * box.halfExtents.z;
	const center = box.center.dot(axis);
	return [center - boxExt, center + boxExt];
}

function testAxisSeparation(
	axis: THREE.Vector3,
	boxA: PhysicsBox,
	boxB: PhysicsBox
): [boolean, number] {
	const [min1, max1] = projectBoxOnAxis(boxA, axis);
	const [min2, max2] = projectBoxOnAxis(boxB, axis);

	if (max1 < min2 || max2 < min1) {
		return [false, 0]; // Separated along this axis
	} else {
		const depth = Math.min(max1 - min2, max2 - min1);
		return [true, depth];
	}
}

export function computeBoxBoxMTD(
	boxA: PhysicsBox,
	poseA: Pose,
	boxB: PhysicsBox,
	poseB: Pose,
	result = new MtdResult()
) {
	posedBoxA.copy(boxA).applyPose(poseA);
	posedBoxB.copy(boxB).applyPose(poseB);

	let minDepth = Infinity;
	const mtd = result.direction;

	// Test the box axes
	for (let box of [posedBoxA, posedBoxB]) {
		for (let axisIndex of [0, 1, 2]) {
			const axis = getRotatedAxis(box, axisIndex);
			const [overlaps, depth] = testAxisSeparation(axis, posedBoxA, posedBoxB);
			if (!overlaps) {
				return null;
			}
			if (depth < minDepth) {
				minDepth = depth;
				mtd.copy(axis);
			}
		}
	}

	// Test the cross products of pairs of axes
	for (let axisIndex1 of [0, 1, 2]) {
		for (let axisIndex2 of [0, 1, 2]) {
			const axis1 = getRotatedAxis(posedBoxA, axisIndex1);
			const axis2 = getRotatedAxis(posedBoxB, axisIndex2);
			const axis = axis1.cross(axis2);
			if (axis.lengthSq() < 1e-6) {
				// Almost zero length
				continue;
			}
			axis.normalize();
			const [overlaps, depth] = testAxisSeparation(axis, posedBoxA, posedBoxB);
			if (!overlaps) {
				return null;
			}
			if (depth < minDepth) {
				minDepth = depth;
				mtd.copy(axis);
			}
		}
	}

	// Ensure the MTD points from box2 to box1
	const witness = new THREE.Vector3().subVectors(posedBoxA.center, posedBoxB.center);
	if (mtd.dot(witness) < 0) {
		mtd.negate();
	}

	result.distance = minDepth;

	return result;
}
