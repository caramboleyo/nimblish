import { ExtendedTriangle as TriangleBvh } from 'three-mesh-bvh';
import { PhysicsTrimesh } from '../../shapes/trimesh';
import { ColliderShape, CollidersWithSupportMaps, Pose } from '../../types';
import { ExtendedBox3 } from '../math/extended-box3';
import { MtdResult } from './mtd-result';
import { computeSupportMapSupportMapMTD, inverseMultiplyPose } from './support-map-support-map-mtd';
import { ExtendedTriangle } from '../math/extended-triangle';

const box3 = [new ExtendedBox3()];
const tri = new ExtendedTriangle();
const prediction = 0.02;

export function computeTrimeshSupportMapMTD(
	trimesh: PhysicsTrimesh,
	poseA: Pose,
	shapeB: ColliderShape,
	poseB: Pose,
	result = new MtdResult()
) {
	let hasHit = false;
	// Get an AABB of shapeB in trimesh's local space. Loosen it with the prediction.
	const poseAB = inverseMultiplyPose(poseA, poseB);
	const aabb = box3[0];
	shapeB.getAABB(aabb, poseAB).loosen(prediction);

	function intersectsTriangle(inTri: TriangleBvh) {
		tri.copy(inTri);

		const mtd = computeSupportMapSupportMapMTD(
			tri,
			poseA,
			shapeB as CollidersWithSupportMaps,
			poseB
		);

		if (mtd && mtd.distance < result.distance) {
			result.distance = mtd.distance;
			result.direction.copy(mtd.direction);
			hasHit = true;
		}

		return false;
	}

	trimesh.shapecast({
		intersectsBounds: (bounds) => bounds.intersectsBox(aabb),
		intersectsTriangle: intersectsTriangle,
	});

	return hasHit ? result : null;
}
