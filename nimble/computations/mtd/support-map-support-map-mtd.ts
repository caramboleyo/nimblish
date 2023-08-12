import { debug } from '../../../debug/debug';
import { Physics } from '../../physics-const';
import { CollidersWithSupportMaps, Pose } from '../../types';
import { CSOPoint } from '../gjk/cso-point';
import { EPA } from '../gjk/epa';
import { GJK } from '../gjk/gjk';
import { VoronoiSimplex } from '../gjk/voronoi-simplex';
import { MtdResult } from './mtd-result';
import * as THREE from 'three';

const simplex = new VoronoiSimplex();
const gjk = new GJK(simplex);
const epa = new EPA(simplex);
const vec3 = [new THREE.Vector3()];

export function inverseMultiplyPose(poseA: Pose, poseB: Pose) {
	const invPoseARotation = poseA.rotation.clone().conjugate();
	const position = poseB.position.clone().sub(poseA.position).applyQuaternion(invPoseARotation);
	const rotation = invPoseARotation.clone().multiply(poseB.rotation);

	return { position, rotation };
}

const prediction = 0.02;

export function computeSupportMapSupportMapMTD(
	shapeA: CollidersWithSupportMaps,
	poseA: Pose,
	shapeB: CollidersWithSupportMaps,
	poseB: Pose,
	result = new MtdResult()
) {
	const direction = vec3[0];
	const poseAB = inverseMultiplyPose(poseA, poseB);

	if (poseAB.position.length() > Physics.EPSILON) {
		direction.copy(poseAB.position).normalize();
	} else {
		direction.set(1, 0, 0);
	}

	const supportMapA = shapeA.getSupportMap();
	const supportMapB = shapeB.getSupportMap();

	simplex.reset(CSOPoint.from_shapes(poseAB, supportMapA, supportMapB, direction));
	const closestPoints = gjk.closestPoints(poseAB, supportMapA, supportMapB, prediction, true);

	if (closestPoints instanceof GJK.ClosestPoints) {
		const pointA = closestPoints.points[0].applyQuaternion(poseA.rotation).add(poseA.position);

		// Transform pointB to shapeB's local space, then to world space.
		const poseBA = inverseMultiplyPose(poseB, poseA);
		const pointB = closestPoints.points[1]
			.clone()
			.applyQuaternion(poseBA.rotation)
			.add(poseBA.position);
		pointB.applyQuaternion(poseB.rotation).add(poseB.position);

		debug.drawPoint(pointA, { alwaysOnTop: true });
		debug.drawPoint(pointB, { alwaysOnTop: true });
	}

	if (closestPoints instanceof GJK.Intersection) {
		const epaResult = epa.closestPoints(poseAB, supportMapA, supportMapB);

		if (epaResult) {
			const { p1, p2, normal } = epaResult;

			result.distance = p2.clone().sub(p1).dot(normal);
			result.direction.copy(normal).applyQuaternion(poseA.rotation);

			return result;
		}
	}

	return null;
}
