import * as THREE from 'three';
import { MtdResult } from './mtd-result';
import { PhysicsBox } from '../../shapes/box';
import { PhysicsPlane } from '../../shapes/plane';
import { Pose } from '../../types';

const posedBox = new PhysicsBox();
const posedPlane = new PhysicsPlane();

function computeBoxPoints(box: PhysicsBox): THREE.Vector3[] {
	const { halfExtents, center } = box;
	const corners: THREE.Vector3[] = [];

	const combinations = [
		[-1, -1, -1],
		[1, -1, -1],
		[1, 1, -1],
		[-1, 1, -1],
		[-1, -1, 1],
		[1, -1, 1],
		[1, 1, 1],
		[-1, 1, 1],
	];

	for (let i = 0; i < 8; i++) {
		const point = new THREE.Vector3(
			halfExtents.x * combinations[i][0],
			halfExtents.y * combinations[i][1],
			halfExtents.z * combinations[i][2]
		);
		point.applyQuaternion(box.rotation);
		point.add(center);
		corners.push(point);
	}

	return corners;
}

export function computeBoxPlaneMTD(
	box: PhysicsBox,
	boxPose: Pose,
	plane: PhysicsPlane,
	planePose: Pose,
	result = new MtdResult()
) {
	posedBox.copy(box).applyPose(boxPose);
	posedPlane.copy(plane).applyPose(planePose);

	const points = computeBoxPoints(posedBox);
	let minDistance = posedPlane.distanceToPoint(points[0]);

	for (let i = 1; i < 8; i++) {
		const distance = posedPlane.distanceToPoint(points[i]);
		minDistance = Math.min(minDistance, distance);
	}

	if (minDistance > 0) {
		return null;
	}

	result.direction.copy(posedPlane.normal);
	result.distance = -minDistance;

	return result;
}
