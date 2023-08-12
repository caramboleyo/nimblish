import { PhysicsPlane } from '../../shapes/plane';
import { PhysicsSphere } from '../../shapes/sphere';
import { Pose } from '../../types';
import { MtdResult } from './mtd-result';

const posedPlane = new PhysicsPlane();
const posedSphere = new PhysicsSphere();

export function computeSpherePlaneMTD(
	sphere: PhysicsSphere,
	spherePose: Pose,
	plane: PhysicsPlane,
	planePose: Pose,
	result = new MtdResult(),
) {
	posedSphere.copy(sphere).applyPose(spherePose);
	posedPlane.copy(plane).applyPose(planePose);

	const distance = posedSphere.center.dot(posedPlane.normal) + posedPlane.constant;
	console.log('dot', distance, posedSphere.radius);

	if (distance >= posedSphere.radius) return null;

	result.distance = posedSphere.radius - distance;
	result.direction.copy(posedPlane.normal).multiplyScalar(result.distance).normalize();

	return result;
}
