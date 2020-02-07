import { World, GSSolver, SplitSolver, NaiveBroadphase, Material, ContactMaterial, Plane, Body, Vec3 } from "cannon";

export class PhysicsEngine {
    private world: World;

    constructor() {
        // Setup our world
        this.world = new World();
        this.world.quatNormalizeSkip = 0;
        this.world.quatNormalizeFast = false;
        var solver = new GSSolver();
        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4;
        solver.iterations = 7;
        solver.tolerance = 0.1;
        var split = true;
        if(split)
            this.world.solver = new SplitSolver(solver);
        else
            this.world.solver = solver;
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new NaiveBroadphase();
        // Create a slippery material (friction coefficient = 0.0)
        const physicsMaterial = new Material("slipperyMaterial");
        const physicsContactMaterial = new ContactMaterial(
        physicsMaterial,
        physicsMaterial,
        {
            friction: 0,
            restitution: 0.3
        }
        );
        // We must add the contact materials to the world
        this.world.addContactMaterial(physicsContactMaterial);
        // Create a plane
        const groundShape = new Plane();
        const groundBody = new Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
        this.world.addBody(groundBody);
    }

    public addBody(body: Body) {
        this.world.addBody(body);
    }

    public step(delta: number) {
        this.world.step(delta);
    }
}