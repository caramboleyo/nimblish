//import { racyastColliders } from './computations/raycast/raycast';
//import { PhysicsBox } from './shapes/box';
//import { PhysicsCapsule } from './shapes/capsule';
import { PhysicsPlane } from './shapes/plane';
import { PhysicsSphere } from './shapes/sphere';
//import { PhysicsTrimesh } from './shapes/trimesh';

export const Physics = {
	Sphere: PhysicsSphere,
	//Box: PhysicsBox,
	Plane: PhysicsPlane,
	//Capsule: PhysicsCapsule,
	//Trimesh: PhysicsTrimesh,
	//raycast: racyastColliders,
	EPSILON: 1e-7,
};
