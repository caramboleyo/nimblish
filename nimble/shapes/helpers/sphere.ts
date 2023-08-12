import { SphereGeometry, MeshBasicMaterial, Mesh, Material } from 'three';
import { PhysicsSphere } from '../sphere.js';
import { DrawMaterialOptions } from './types.js';

export class SphereHelper extends Mesh {
	public sphere: PhysicsSphere;

	constructor(sphere: PhysicsSphere, options?: DrawMaterialOptions) {
		const geometry = new SphereGeometry(sphere.radius, 8, 8);
		const material = new MeshBasicMaterial({
			color: options?.color ?? 0x0000ff,
			toneMapped: false,
			depthTest: !options?.alwaysOnTop ?? true,
			opacity: options?.opacity ?? 1,
			transparent: options?.opacity && options?.opacity < 1 ? true : false,
			fog: options?.fog ?? true,
			wireframe: true,
		});

		super(geometry, material);

		Object.defineProperty(this, 'type', { value: 'SphereHelper' });
		this.sphere = sphere;
		console.log(sphere);
		this.position.copy(sphere.center);
	}

	set(sphere: PhysicsSphere) {
		this.sphere = sphere;
		const geometry = new SphereGeometry(sphere.radius, 8, 8);
		this.geometry.copy(geometry);
	}

	setMaterial(options: DrawMaterialOptions) {
		const material = this.material as MeshBasicMaterial;
		if (options.color) material.color.set(options.color);
		if (options.alwaysOnTop) material.depthTest = !options.alwaysOnTop;
		if (options.opacity) {
			material.opacity = options.opacity;
			material.transparent = options.opacity && options.opacity < 1 ? true : false;
		}
		if (options.fog) material.fog = options.fog;
	}

	updateMatrixWorld() {
		this.position.copy(this.sphere.center);
		super.updateMatrixWorld();
	}

	dispose() {
		this.geometry.dispose();
		(this.material as Material).dispose();
	}
}
