import {
	BufferGeometry,
	Float32BufferAttribute,
	Line,
	LineBasicMaterial,
	Material,
	Mesh,
	MeshBasicMaterial,
} from 'three';
import { PhysicsPlane } from '../plane.js';
import { DrawMaterialOptions } from './types.js';

export class PlaneHelper extends Line {
	public plane: PhysicsPlane;
	public size: number;

	constructor(plane: PhysicsPlane, size = 30, options?: DrawMaterialOptions) {
		const color = options?.color ?? 0xffff00;
		const position = [
			1, -1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0,
		];

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(position, 3));

		const material = new LineBasicMaterial({
			color: color,
			toneMapped: false,
			depthTest: !options?.alwaysOnTop ?? true,
			opacity: options?.opacity ?? 1,
			transparent: options?.opacity && options?.opacity < 1 ? true : false,
			fog: options?.fog ?? true,
		});

		super(geometry, material);

		Object.defineProperty(this, 'type', { value: 'PlaneHelper' });
		this.plane = plane;
		this.size = size;

		const positions2 = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];

		/*const geometry2 = new BufferGeometry();
		geometry2.setAttribute('position', new Float32BufferAttribute(positions2, 3));

		this.add(
			new Mesh(
				geometry2,
				new MeshBasicMaterial({
					color: color,
					opacity: 0.1,
					transparent: true,
					depthWrite: false,
					toneMapped: false,
				}),
			),
		);*/
	}

	set(plane: PhysicsPlane) {
		this.plane = plane;
	}

	setMaterial(options: DrawMaterialOptions) {
		const material = this.material as LineBasicMaterial;
		if (options.color) material.color.set(options.color);
		if (options.alwaysOnTop) material.depthTest = !options.alwaysOnTop;
		if (options.opacity) {
			material.opacity = options.opacity;
			material.transparent = options.opacity && options.opacity < 1 ? true : false;
		}
		if (options.fog) material.fog = options.fog;
	}

	updateMatrixWorld() {
		this.position.set(0, 0, 0);
		//this.scale.set(0.5 * this.size, 0.5 * this.size, 1);
		this.lookAt(this.plane.normal);
		//this.translateZ(-this.plane.constant);

		super.updateMatrixWorld();
	}

	dispose() {
		this.geometry.dispose();
		(this.material as Material).dispose();
		(this.children[0] as Mesh).geometry.dispose();
		((this.children[0] as Mesh).material as Material).dispose();
	}
}
