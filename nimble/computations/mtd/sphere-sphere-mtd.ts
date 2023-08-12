import { PhysicsSphere } from '../../shapes/sphere';
import { Pose } from '../../types';
import { MtdResult } from './mtd-result';

const posedSphereA = new PhysicsSphere();
const posedSphereB = new PhysicsSphere();

export function computeSphereSphereMTD(
	sphereA: PhysicsSphere,
	poseA: Pose,
	sphereB: PhysicsSphere,
	poseB: Pose,
	result = new MtdResult()
) {
	posedSphereA.copy(sphereA).applyPose(poseA);
	posedSphereB.copy(sphereB).applyPose(poseB);

	result.direction.subVectors(posedSphereA.center, posedSphereB.center);
	const distance = result.direction.length();
	const radiusSum = posedSphereA.radius + posedSphereB.radius;

	if (distance >= radiusSum) return null;

	result.distance = radiusSum - distance;
	result.direction.normalize();

	return result;
}
