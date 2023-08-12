import { MeshBVH, MeshBVHOptions } from 'three-mesh-bvh';
import * as THREE from 'three';
import { Pose } from '../types';
import { ExtendedBox3 } from '../computations/math/extended-box3';

const scale = new THREE.Vector3(1, 1, 1);

export class PhysicsTrimesh extends MeshBVH {
	public readonly type = 'trimesh';

	constructor(geometry?: THREE.BufferGeometry) {
		let _geometry;

		if (geometry) {
			_geometry = geometry;
		} else {
			_geometry = new THREE.BufferGeometry();
			const vertices = new Float32Array([0.0, 0.0, 0.0]);
			_geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		}

		super(_geometry);
	}

	setGeometry(geometry: THREE.BufferGeometry, options?: MeshBVHOptions) {
		const newMeshBvh = new MeshBVH(geometry, options);
		Object.assign(this, newMeshBvh);
	}

	applyPose(pose: Pose) {
		this.geometry.applyMatrix4(new THREE.Matrix4().compose(pose.position, pose.rotation, scale));
		return this;
	}

	copy(trimesh: PhysicsTrimesh) {
		this.geometry.copy(trimesh.geometry);
		return this;
	}

	getLocalAABB(box: ExtendedBox3): ExtendedBox3 {
		this.geometry.computeBoundingBox();
		return box.copy(this.geometry.boundingBox!);
	}

	getAABB(box: ExtendedBox3, pose: Pose): ExtendedBox3 {
		this.getLocalAABB(box);
		box.min.applyQuaternion(pose.rotation).add(pose.position);
		box.max.applyQuaternion(pose.rotation).add(pose.position);

		return box;
	}
}
