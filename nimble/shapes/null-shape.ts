import { Pose } from '../types';
import { ExtendedBox3 } from '../computations/math/extended-box3';

export class PhysicsNullShape {
	public readonly type = 'null';

	getLocalAABB(box: ExtendedBox3): ExtendedBox3 {
		return new ExtendedBox3();
	}

	getAABB(box: ExtendedBox3, pose: Pose): ExtendedBox3 {
		return new ExtendedBox3();
	}
}
