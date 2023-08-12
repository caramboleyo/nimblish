import * as THREE from 'three';

export class MtdResult {
	direction: THREE.Vector3;
	distance: number;
	point: THREE.Vector3;

	constructor() {
		this.direction = new THREE.Vector3();
		this.distance = 0;
		this.point = new THREE.Vector3();
	}
}
