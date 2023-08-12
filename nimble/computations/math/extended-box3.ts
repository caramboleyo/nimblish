import * as THREE from 'three';

export class ExtendedBox3 extends THREE.Box3 {
	constructor(min?: THREE.Vector3, max?: THREE.Vector3) {
		super(min, max);
	}

	applyQuaternion(quaternion: THREE.Quaternion) {
		this.min.applyQuaternion(quaternion);
		this.max.applyQuaternion(quaternion);
		return this;
	}

	loosen(amount: number) {
		if (amount < 0) throw new Error('Amount must be positive');
		this.min.addScalar(-amount);
		this.max.addScalar(amount);

		return this;
	}

	tighten(amount: number) {
		if (amount < 0) throw new Error('Amount must be positive');
		this.min.addScalar(amount);
		this.max.addScalar(-amount);

		return this;
	}
}
