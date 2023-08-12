import { Physics } from '../../physics-const';
import { PhysicsCapsule } from '../../shapes/capsule';
import { Pose } from '../../types';
import { MtdResult } from './mtd-result';

const posedPlane = new Physics.Plane();
const posedCapsule = new Physics.Capsule();

export function computeCapsulePlaneMTD(
	capsule: PhysicsCapsule,
	capsulePose: Pose,
	plane: THREE.Plane,
	planePose: Pose,
	result = new MtdResult()
) {
	posedCapsule.copy(capsule).applyPose(capsulePose);
	posedPlane.copy(plane).applyPose(planePose);

	const d0 = posedPlane.distanceToPoint(posedCapsule.start);
	const d1 = posedPlane.distanceToPoint(posedCapsule.end);
	const dmin = Math.min(d0, d1) - posedCapsule.radius;

	if (dmin > 0) {
		return null;
	}

	result.direction.copy(posedPlane.normal).negate().normalize();
	result.distance = dmin;

	return result;
}
