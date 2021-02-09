function setup() {
	createCanvas(window.innerWidth, window.innerHeight).parent('canvasContainer')
	background(0)
	// frameRate(45)

	mouse = createVector()

	createParticles(p5)

	datGuiSetup()
}

let system = {
	systemWidth: 550,
	systemHeight: 150,

	particles: [],
	particleSize: 2,
	particlesStep: 8,

	backgroundColor: 0,

	mouse: {},
	mouseWithLerp: { x: window.innerWidth / 2, y: -100 },
	mouseForce: 0.04,
	mouseForceRadius: 85,
	mouseFactor: 1,
	isClicked: false,

	generate() {
		system.particles = []

		createParticles(p5)
	},

	save() {
		saveCanvas('dottyDots', 'png')
	},
}

function draw() {
	if (!system.isClicked) {
		background(system.backgroundColor)
		updateParticles(p5)

		updateMouseVector(p5)
		drawCursor(p5)
	}

	// Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
	// if (index === 10) {
	// 	fps = frameRate()
	// 	index = 0
	// }
	// fill(255)
	// stroke(0)
	// textSize(20)
	// text('FPS: ' + fps.toFixed(2), 100, 100)
	// text('Hold: ' + system.holdValue.value.toFixed(2), 100, 300)
	// index++
}

function updateMouseVector(p5) {
	system.mouse.x = mouseX
	system.mouse.y = mouseY
}

function createParticles(p5) {
	// Every *step* pixels, create a particle. Its type depends on the pixel color.
	for (let i = width / 2 - system.systemWidth / 2; i <= width / 2 + system.systemWidth / 2; i += system.particlesStep) {
		for (let j = height / 2 - system.systemHeight / 2; j <= height / 2 + system.systemHeight / 2; j += system.particlesStep) {
			system.particles.push(new Particle(p5, { x: i, y: j }))
		}
	}
}

function updateParticles(p5) {
	strokeWeight(system.particleSize)
	stroke('black')
	for (const _particle of system.particles) {
		_particle.applyForce(p5)
		_particle.draw(p5)
	}
}

// Pause the animation
function mouseClicked() {
	system.isClicked = !system.isClicked
}

// Draw cursor
const lerp = (start, end, amt) => {
	return (1 - amt) * start + amt * end
}
function drawCursor(p5) {
	system.mouseWithLerp.x = lerp(system.mouseWithLerp.x, system.mouse.x, 0.2)
	system.mouseWithLerp.y = lerp(system.mouseWithLerp.y, system.mouse.y, 0.2)

	stroke(255)
	strokeWeight(2)
	noFill()
	circle(system.mouseWithLerp.x, system.mouseWithLerp.y, 43)
}

class Particle {
	constructor(p5, pos, type) {
		this.origin = {
			x: pos.x,
			y: pos.y,
		}
		this.pos = pos
		this.acc = {
			x: 0,
			y: 0,
		}
		this.vel = {
			x: 0,
			y: 0,
		}

		this.maxSpeed = 10
		this.maxForce = 0.5
		this.brakeRadius = 100

		this.color = 255
	}

	originAttraction(p5) {
		// Define target
		let target = {
			x: this.origin.x - this.pos.x,
			y: this.origin.y - this.pos.y,
		}

		// Reduce speed when the particle come near its origin
		let dist = Math.sqrt(Math.pow(target.x, 2) + Math.pow(target.y, 2))
		let factor = this.maxSpeed
		if (dist < this.brakeRadius) {
			// Map factor from dist
			let temp = (dist - 0) / (this.brakeRadius - 0)
			factor = 0 + temp * (this.maxSpeed - 0)
		}

		// Set new mag with the target
		if (dist !== 0) {
			target.x = (target.x * factor) / dist
			target.y = (target.y * factor) / dist
		}

		// Define steering force
		let steering = {
			x: target.x - this.vel.x,
			y: target.y - this.vel.y,
		}

		// Limit the magnitude of the force
		let mag = Math.sqrt(Math.pow(steering.x, 2) + Math.pow(steering.y, 2))
		if (mag > this.maxForce) {
			steering.x = (steering.x * this.maxForce) / mag
			steering.y = (steering.y * this.maxForce) / mag
		}

		return steering
	}

	applyForce(p5) {
		// Add attraction force to acceleration
		let attractionForce = this.originAttraction(p5)
		this.acc.x += attractionForce.x
		this.acc.y += attractionForce.y

		// Add repulsion force to acceleration
		let repulsionForce = this.mouseRepulsion(p5)
		this.acc.x += repulsionForce.x
		this.acc.y += repulsionForce.y

		// Add acceleration to velocity
		this.vel.x += this.acc.x
		this.vel.y += this.acc.y

		// Reset acceleration
		this.acc.x = 0
		this.acc.y = 0

		// Add velocity to position
		this.pos.x += this.vel.x
		this.pos.y += this.vel.y
	}

	mouseRepulsion(p5) {
		// Define target
		let target = {
			x: system.mouse.x - this.pos.x,
			y: system.mouse.y - this.pos.y,
		}

		// Calculate and apply the force within a certain distance
		let dist = Math.sqrt(Math.pow(target.x, 2) + Math.pow(target.y, 2))
		if (dist < system.mouseForceRadius) {
			// Define steering force
			let steering = {
				x: target.x - this.vel.x,
				y: target.y - this.vel.y,
			}
			steering.x *= -system.mouseForce * system.mouseFactor
			steering.y *= -system.mouseForce * system.mouseFactor
			return steering
		}
		return { x: 0, y: 0 }
	}

	draw(p5) {
		stroke(this.color)
		point(this.pos.x, this.pos.y)
	}
}

function datGuiSetup() {
	let gui = new dat.GUI({ width: 410 })

	gui.add(system, 'systemWidth', 0, window.innerWidth).name('Longueur')
	gui.add(system, 'systemHeight', 0, window.innerHeight).name('Largeur')
	gui.add(system, 'particleSize', 0.1, 10).name('Taille des particules')
	gui.add(system, 'mouseForce', 0.003, 0.1).name('Froce de la souris')
	gui.add(system, 'mouseForceRadius', 25, 200).name('Portée de la souris')

	gui.add(system, 'save').name('Sauvegarder')
	gui.add(system, 'generate').name('Générer')
}
