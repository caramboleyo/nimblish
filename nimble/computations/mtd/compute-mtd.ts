import { Collider } from '../../collider';
import { computeBoxBoxMTD } from './box-box-mtd';
import { computeBoxPlaneMTD } from './box-plane-mtd';
import { computeCapsulePlaneMTD } from './capsule-plane-mtd';
import { computeTrimeshSupportMapMTD } from './trimesh-support-map-mtd';
import { MtdResult } from './mtd-result';
import { computeSphereBoxMTD } from './sphere-box-mtd';
import { computeSpherePlaneMTD } from './sphere-plane-mtd';
import { computeSphereSphereMTD } from './sphere-sphere-mtd';
import { computeSupportMapSupportMapMTD } from './support-map-support-map-mtd';

function negateMtd(result: MtdResult | null) {
	if (!result) return null;
	result.direction.negate();
	return result;
}

export function computeMTD(
	colliderA: InstanceType<typeof Collider.Constructor>,
	colliderB: InstanceType<typeof Collider.Constructor>,
) {
	switch (colliderA.shape.type) {
		case 'sphere': {
			switch (colliderB.shape.type) {
				case 'sphere': {
					return computeSphereSphereMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
					// return computeSupportMapSupportMapMTD(
					// 	colliderA.shape,
					// 	colliderA.pose,
					// 	colliderB.shape,
					// 	colliderB.pose
					// );
				}
				case 'box': {
					return computeSphereBoxMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
					// return computeSupportMapSupportMapMTD(
					// 	colliderA.shape,
					// 	colliderA.pose,
					// 	colliderB.shape,
					// 	colliderB.pose
					// );
				}
				case 'plane': {
					return computeSpherePlaneMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
				}
				case 'capsule': {
					return computeSupportMapSupportMapMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
				}
				case 'trimesh': {
					return negateMtd(
						computeTrimeshSupportMapMTD(
							colliderB.shape,
							colliderB.pose,
							colliderA.shape,
							colliderA.pose,
						),
					);
				}
			}
			return;
		}
		case 'box': {
			switch (colliderB.shape.type) {
				case 'sphere': {
					return negateMtd(
						computeSphereBoxMTD(
							colliderB.shape,
							colliderB.pose,
							colliderA.shape,
							colliderA.pose,
						),
					);
					// return computeSupportMapSupportMapMTD(
					// 	colliderA.shape,
					// 	colliderA.pose,
					// 	colliderB.shape,
					// 	colliderB.pose
					// );
				}
				case 'box': {
					return computeBoxBoxMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
					// return computeSupportMapSupportMapMTD(
					// 	colliderA.shape,
					// 	colliderA.pose,
					// 	colliderB.shape,
					// 	colliderB.pose
					// );
				}
				case 'plane': {
					return computeBoxPlaneMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
				}
				case 'capsule': {
					return computeSupportMapSupportMapMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
				}
				case 'trimesh': {
					return negateMtd(
						computeTrimeshSupportMapMTD(
							colliderB.shape,
							colliderB.pose,
							colliderA.shape,
							colliderA.pose,
						),
					);
				}
			}

			return;
		}
		case 'capsule': {
			switch (colliderB.shape.type) {
				case 'sphere': {
					return computeSupportMapSupportMapMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
				}
				case 'box': {
					return computeSupportMapSupportMapMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
				}
				case 'plane': {
					return computeCapsulePlaneMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
				}
				case 'capsule': {
					return computeSupportMapSupportMapMTD(
						colliderA.shape,
						colliderA.pose,
						colliderB.shape,
						colliderB.pose,
					);
				}
				case 'trimesh': {
					return negateMtd(
						computeTrimeshSupportMapMTD(
							colliderB.shape,
							colliderB.pose,
							colliderA.shape,
							colliderA.pose,
						),
					);
				}
			}

			return;
		}
	}
}
