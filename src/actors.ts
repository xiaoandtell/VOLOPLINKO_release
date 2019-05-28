module XG {

	export class Main implements I_update {
		static readonly width: number = 64;
		static readonly height: number = 128;

		k: string;
		private graphicArrowOffscreen: Graphic;
		private graphicHammer: Graphic;
		private graphicMan: Graphic;
		private isSlow: boolean;
		private stateHammer: string;
		private stateMan: string;

		constructor() {
			this.constructArrow();
			this.constructCharacter();
			this.constructControlHandlers();

			var k: string = this.k = Ks.player;
			(<GmStatePlay>Gm.ie.state.getCurrentState()).updates[k] = this;
		}
		private constructArrow(): void {
			var g: Graphic = Gm.ie.add.graphics(0, 0, Stage.groupActors);
			g.lineStyle(4, Color.BLUE_P);
			g.moveTo(-16, 20);
			g.lineTo(0, 8);
			g.lineTo(16, 20);
			this.graphicArrowOffscreen = g;
		}
		private constructCharacter(): void {
			var x: number = Gm.ie.hwidth,
				y: number = Stage.Y_MAIN;
			this.constructMan(x, y);
			this.constructHammer(x, y);
			// connect hammer to man
			Gm.b2d.revoluteJoint(
				this.graphicMan.body, this.graphicHammer.body,
				0, 32, 0, 0
			);
		}
		private constructHammer(x: number, y: number): void {
			var g: Graphic = Gm.ie.add.graphics(x, y, Stage.groupActors);
			// draw handle
			var wHandle: number = 4,
				hHandle: number = 124;
			g.beginFill(Color.BROWN);
			g.drawRect(-wHandle / 2, -hHandle, wHandle, hHandle);
			Gm.b2d.enable(g);
			var bodyG: PBBody = g.body;
			bodyG.clearFixtures();
			// body fixture of handle
			var fHandle: BFxt
				= bodyG.addRectangle(wHandle, hHandle, 0, -hHandle / 2);
			fHandle.SetUserData(this);
			// draw head
			g.beginFill(Color.SILVER);
			g.lineStyle(2, Color.WHITE);
			var wHead: number = 96,
				hHead: number = 48;
			g.drawRect(-wHead / 2, -(hHandle + hHead), wHead, hHead);
			// body fixture of head
			var fHead: BFxt
				= bodyG.addRectangle(wHead, hHead, 0, -(hHandle + hHead / 2));
			fHead.SetUserData(this);

			bodyG.bullet = true;
			bodyG.setCollisionCategory(Collision.HAMMER);
			bodyG.setCollisionMask(Collision.BOUNDARY | Collision.BALL);

			fHead.GetFilterData().categoryBits = Collision.HEAD_HAMMER;

			// counterweight to head body,
			// prevents torque from shifting character body in swing
			var fCounterweight: BFxt
				= bodyG.addRectangle(wHead, hHead, 0, hHandle + hHead / 2);
			fCounterweight.GetFilterData().categoryBits = Collision.NONE;
			fCounterweight.GetFilterData().maskBits = Collision.NONE;

			this.graphicHammer = g;
		}
		private constructMan(x: number, y: number): void {
			var width: number = Main.width,
				hwidth: number = width / 2;
			var height: number = Main.height,
				hheight: number = height / 2;
			var g: Graphic = Gm.ie.add.graphics(x, y, Stage.groupActors);
			// draw base (perimeter)
			g.beginFill(Color.BLUE_P);
			g.drawRect(-hwidth, -hheight, width, height);
			// create box2d body on base
			Gm.b2d.enable(g);
			var bodyG: PBBody = g.body;
			bodyG.clearFixtures();
			bodyG.addRectangle(width, hheight, 0, hheight / 2);
			var fHead: BFxt = bodyG.addRectangle(width, hheight,
				0, -hheight / 2);
			bodyG.fixedRotation = true;
			bodyG.mass *= 64;
			bodyG.setCollisionCategory(Collision.MAIN);
			bodyG.setCollisionMask(Collision.BOUNDARY | Collision.BALL);
			fHead.GetFilterData().categoryBits = Collision.HEAD_MAIN;

			// draw hands
			g.beginFill(Color.GOLD);
			g.lineStyle(0);
			g.drawCircle(-4, 32, 16);
			g.drawCircle(4, 32, 16);
			// draw hat
			g.beginFill(Color.RED);
			g.drawCircle(0, -hheight, 16)
			// draw head
			g.beginFill(Color.GOLD);
			g.drawRect(-hwidth, -hheight, width, hheight);
			// draw ears
			g.drawCircle(-32, -32, 16);
			g.drawCircle(32, -32, 16);
			// draw mouth
			g.beginFill(Color.RED);
			g.drawRect(-16, -32, 32, 4);
			// draw googly eyes
			var xOffsetEye: number = 16,
				yOffsetEye: number = -56;
			for (var signEye of [-1, 1]) {
				// whites of eyes
				g.beginFill(Color.WHITE);
				g.drawCircle(signEye * xOffsetEye, yOffsetEye, 16);
				// pupils of eyes
				var gPupl: Graphic = Gm.ie.add.graphics(x, y, Stage.groupActors);
				gPupl.beginFill(Color.BLACK);
				gPupl.drawCircle(0, 0, 12);
				Gm.b2d.enable(gPupl);
				var bodyGPupl: PBBody = gPupl.body;
				bodyGPupl.clearFixtures();
				bodyGPupl.addCircle(6, 0, 0);
				bodyGPupl.setCollisionCategory(Collision.NONE);
				bodyGPupl.setCollisionMask(Collision.NONE);
				Gm.b2d.ropeJoint(
					bodyG, bodyGPupl, 2,
					signEye * xOffsetEye, yOffsetEye, 0, 0
				);
			}

			this.graphicMan = g;
		}
		private constructControlHandlers(): void {
			Gm.ie.onControl.add(this.handleControl, this);
			this.stateHammer = this.stateMan = null;
		}

		private handleControl(type: string, def) {
			switch (type) {
				case Ks.mainHammer:
					this.handleControlHammer(def);
					break;
				case Ks.mainMove:
					this.handleControlMove(def);
					break;
				case Ks.mainSlow:
					this.handleControlSlow(def);
					break;
			}
		}
		private handleControlHammer(def: { state: string; }): void {
			var bodyH: PBBody = this.graphicHammer.body;
			var state: string = this.stateHammer = def.state;
			var isSwingL: boolean = state == Ks.left,
				isSwingR: boolean = state == Ks.right;
			if (isSwingL || isSwingR) {
				var velRotationH: number = bodyH.data.GetAngularVelocity();
				velRotationH = bodyH.world.mpx(velRotationH);
				if (isSwingL) {
					velRotationH = Math.min(-1000, velRotationH - 1000);
				} else {
					velRotationH = Math.max(1000, velRotationH + 1000);
				}
				bodyH.rotateRight(velRotationH);
				bodyH.velocity.y = Math.max(1000, bodyH.velocity.y);
				var velBodyMan: I_xy = this.graphicMan.body.velocity;
				velBodyMan.y = Math.max(1000, velBodyMan.y + 1000);
				Gm.ie.onSound.dispatch(Ks.hammerSwing);
			} else { // swing hammer back across center
				// first bound rotation between -pi and pi
				var pi_x2: number = box2d.b2_two_pi;
				var rotation: number = bodyH.rotation % pi_x2;
				if (Math.abs(rotation) > box2d.b2_pi) {
					rotation += (rotation < 0) ? pi_x2 : -pi_x2;
				}
				// swing hammer
				state = (rotation > 0) ? Ks.left : Ks.right;
				this.handleControlHammer({ state: state });
			}
		}
		private handleControlMove(def: {
			isActive: boolean;
			state: string;
		}): void {
			var state: string = def.state;
			if (def.isActive) {
				this.stateMan = state;
			} else if (!def.isActive && this.stateMan === state) {
				this.graphicHammer.body.velocity.x = 0;
				this.graphicMan.body.velocity.x = 0;
				this.stateMan = null;
			}
		}
		private handleControlSlow(def: { isActive: boolean; }): void {
			this.isSlow = def.isActive;
		}

		handleBeginContact(fixtureThis: BFxt, fixtureThat: BFxt): void {
			// play collision sounds when hammer hits
			var cbThis: number = fixtureThis.GetFilterData().categoryBits;
			if (cbThis != Collision.HAMMER && cbThis != Collision.HEAD_HAMMER) {
				return;
			}

			var cbThat: number = fixtureThat.GetFilterData().categoryBits;
			if (cbThat == Collision.BOUNDARY) {
				Gm.ie.onSound.dispatch(Ks.hammerThud);
			} else if (cbThat == Collision.BALL) {
				Gm.ie.onSound.dispatch((cbThis == Collision.HEAD_HAMMER)
					// differentiate proper hammer hit from handle hit
					? Ks.hammerHit
					: Ks.hammerThud
				);
			}
		}

		update(): void {
			this.updateArrow();
			this.updateMan();
		}
		private updateArrow(): void {
			var minY: number = -Main.height / 2;
			var gArrow: Graphic = this.graphicArrowOffscreen,
				gMan: Graphic = this.graphicMan;
			if (gMan.y < minY) {
				// man is up offscreen
				gArrow.scale.x = Math.min(1, 500 / (minY - gMan.y));
				gArrow.x = gMan.x;
				gArrow.y = 0;
			} else {
				gArrow.y = -100;
			}
		}
		/** deprecated: raise hammer */
		// private updateHammer(): void {
		// 	if (this.stateHammer === Ks.top) {
		// 		// raise hammer above head
		// 		var bodyH: PBBody = this.graphicHammer.body;
		// 		var velRotation: number = -400 * bodyH.rotation;
		// 		bodyH.rotateRight(velRotation);
		// 	}
		// }
		private updateMan(): void {
			switch (this.stateMan) {
				case Ks.left:
					var velocity: number = -this.updateMan_getSpeed();
					this.graphicHammer.body.velocity.x = velocity;
					this.graphicMan.body.velocity.x = velocity;
					break;
				case Ks.right:
					var velocity: number = this.updateMan_getSpeed();
					this.graphicHammer.body.velocity.x = velocity;
					this.graphicMan.body.velocity.x = velocity;
					break;
			}
		}
		private updateMan_getSpeed(): number {
			if (this.isSlow) { return 125; }

			// slowly increment speed as speed rises
			// to compensate for increasing spawn rates
			// using scaled sigmoid function,
			// value is 500 at 0, 1000 is limit
			return GmMath.sigmoid(Score.Value, 1000, 1000);
		}

		/** y of bottom of character */
		get y(): number {
			return this.graphicMan.y + Main.height / 2;
		}
	}




	export abstract class Ball implements I_destructor, I_k, I_update, I_xy {
		k: K;
		bonuses: K2Number = {};
		abstract get colorsBase(): number[];
		get colors(): number[] {
			var result: number[] = this.colorsBase;
			var bonuses: K2Number = this.bonuses;
			for (var k in bonuses) {
				var colorBonus: number = Bonus.Bonus2Color[bonuses[k]];
				result.push(colorBonus, colorBonus);
			}
			return result;
		}
		isFinished: boolean = false;
		get x(): number { return this.graphic.body.x; }
		get y(): number { return this.graphic.body.y; }
		protected abstract get valueBase(): number;
		protected diameter: number;
		protected graphic: Graphic;
		protected graphicsBonuses: K2Graphic;
		protected type: string;

		constructor(x: number, y: number) {
			this.constructGraphic(x, y);
			this.graphicsBonuses = {};

			var k: string = this.constructK();
			(<GmStatePlay>Gm.ie.state.getCurrentState()).updates[k] = this;
		}
		protected abstract constructK(): string;
		protected abstract constructGraphic(x: number, y: number): void;
		destructor(): void {
			var k: K = this.k;
			delete (<GmStatePlay>Gm.ie.state.getCurrentState()).updates[k];
			this.graphic.destroy();
		}

		handleBeginContact(fixtureThis: BFxt, fixtureThat: BFxt): void {
			var g: Graphic = this.graphic;
			switch (fixtureThat.GetFilterData().categoryBits) {
				case Collision.HEAD_HAMMER:
					var man: Main = fixtureThat.GetUserData(),
						yMan: number = man.y;
					var yThreshold: number = Stage.Y_MACHINE;
					if (g.y > yThreshold + Vole.diameter / 2) {
						// deep smash: hammer vole below threshold
						this.setBonus(Ks.hammer, Bonus.DEEP);
					} else if (yMan < yThreshold - Machine.HEIGHT_THRESHOLD) {
						// high smash: hammer vole while man is in the air
						this.setBonus(Ks.hammer, Bonus.HIGH);
					}
					g.body.gravityScale = 1;
					break;
				case Collision.HAMMER:
				case Collision.MAIN:
				case Collision.HEAD_MAIN:
					g.body.gravityScale = 1;
					Gm.ie.onSound.dispatch(Ks.ballThud);
					break;
				case Collision.BALL:
					var ballThat: Ball = fixtureThat.GetUserData();
					var bodyMoleThat: PBBody = ballThat.graphic.body;
					// only get knocked down by falling voles
					if (bodyMoleThat.velocity.y <= 0) { break; }

					g.body.gravityScale = 1;
					// chain bonuses from and to contacted vole
					this.setBonusesFrom(ballThat);
					ballThat.setBonusesFrom(this);
					break;
				case Collision.SLOT:
					// don't play sound
					break;
				default:
					Gm.ie.onSound.dispatch(Ks.ballThud);
					break;
			}
		}

		protected finish(type?: string): void {
			this.isFinished = true;

			switch (type) {
				case Ks.score:
					// text effect showing bonuses
					var bonuses: K2Number = this.bonuses;
					var strBonuses: string = '',
						colors: K2Number = {};
					var iColor: number = 0;
					for (var k in bonuses) {
						var bonus: number = bonuses[k];
						strBonuses += Bonus.Bonus2Text[bonus];
						strBonuses += ' x' + bonus + '\n';
						colors[iColor] = Bonus.Bonus2Color[bonus];
						iColor = strBonuses.length;
					}
					Gm.ie.onEffect.dispatch(Ks.text, {
						x: this.x, y: this.y, text: strBonuses,
						colorStroke: Color.WHITE, colorsAdd: colors
					});

					// colored explosion effect from scoring
					if (this.y > Gm.Y_BOTTOM) {
						// if fell through bottom slots, spray up
						var gravity: I_xy = { x: 0, y: -200 };
					}
					Gm.ie.onEffect.dispatch(Ks.burst, {
						x: this.x, y: this.y,
						colors: this.colors, gravity: gravity
					});

					Gm.ie.onScore.dispatch(this.getScore());
					break;
				case Ks.sides:
					// white dust explosion effect from out of bounds
					var gravity: I_xy = {
							x: (this.x < 0) ? 100 : -100,
							y: 0 };
					Gm.ie.onEffect.dispatch(Ks.burst, {
						x: this.x, y: this.y,
						colors: [Color.WHITE], gravity: gravity
					});

					Gm.ie.onSound.dispatch(Ks.ballOut);
					break;
				case Ks.stop:
					// lose game effect
					Gm.ie.onEffect.dispatch(Ks.ending, {x: this.x, y: this.y});
					break;
			}
		}
		private getScore(): number {
			var result: number = this.valueBase;
			var bonuses: K2Number = this.bonuses;
			for (var k in bonuses) {
				result *= bonuses[k];
			}
			return result;
		}
		setBonus(type: string, value: number, isChained?: boolean): void {
			// bonus multipliers have values greater than 1
			if (value <= 1) {
				return;
			}
			var bonuses: K2Number = this.bonuses;
			// do not overwrite existing bonus type with a lower value, for fun
			if (bonuses[type] && bonuses[type] >= value) {
				return;
			}

			var gsBonuses: K2Graphic = this.graphicsBonuses;
			// clear existing bonus effects
			if (gsBonuses[type] && gsBonuses[type] != this.graphic) {
				gsBonuses[type].destroy();
			}
			//// draw bonus effect on graphic
			var colorBonus: number = Bonus.Bonus2Color[value] || Color.WHITE;
			var distanceBonus: number = Bonus.Type2OffsetRadius[type] || 0;
			var g: Graphic = this.graphic;
			g.beginFill(Color.BLACK, 0);
			g.lineStyle(Bonus.WIDTH_HALO, colorBonus);
			var dCircleBonus: number = this.diameter + 2 * distanceBonus;
			gsBonuses[type] = g.drawCircle(0, 0, dCircleBonus);

			var strBonus: string = Bonus.Bonus2Text[value];
			if (isChained) {
				strBonus = 'CHAINED: ' + strBonus;
			}
			Gm.ie.onEffect.dispatch(Ks.text, {
				x: this.x, y: this.y, text: strBonus,
				colorStroke: Bonus.Bonus2Color[value]
			});

			// set bonus
			bonuses[type] = value;

			// play bonus sound
			switch (value) {
				case Bonus.SILVER:
					Gm.ie.onSound.dispatch(Ks.bonusSilver);
					break;
				case Bonus.GOLD:
					Gm.ie.onSound.dispatch(Ks.bonusGold);
					break;
				case Bonus.DEEP:
					Gm.ie.onSound.dispatch(Ks.bonusDeep);
					break;
				case Bonus.HIGH:
					Gm.ie.onSound.dispatch(Ks.bonusHigh);
					break;
			}
		}
		protected setBonusesFrom(a: Ball): void {
			var bonusesThis: K2Number = this.bonuses,
				bonusesThat: K2Number = a.bonuses;
			for (var type in bonusesThat) {
				var bonus: number = bonusesThat[type];
				if (!bonusesThis[type] || bonus > bonusesThis[type]) {
					this.setBonus(type, bonus, true);
				}
			}
		}
		update(): void {
			this.updateCheckOutOfBounds();
			this.updateCheckFinished();
		}
		private updateCheckOutOfBounds(): void {
			var game: Gm = Gm.ie;
			var bodyG: PBBody = this.graphic.body;
			if (bodyG.y > Gm.Y_BOTTOM) {
				this.finish(Ks.score);
			} else if (bodyG.x < 0 || bodyG.x > game.width) {
				this.finish(Ks.sides);
			} else if (bodyG.y < Gm.Y_TOP) {
				this.finish(Ks.stop);
			}
		}
		private updateCheckFinished(): void {
			if (this.isFinished) {
				this.destructor();
			}
		}
	}




	export class Vole extends Ball  {
		static countGlobal: number = 0;
		static readonly diameter: number = 64;
		static readonly VALUE: number = 1;

		get colorsBase(): number[] {
			return [Color.TAN, Color.BLACK, Color.YELLOW];
		}
		protected get valueBase(): number { return Vole.VALUE; }
		protected get diameter(): number { return 64; }
		protected get type(): string { return Ks.vole; }

		protected constructK(): string {
			var result: string = this.k = this.type + Vole.countGlobal++;
			return result;
		}
		protected constructGraphic(x: number, y: number): void {
			var g: Graphic = this.graphic = Gm.ie.add.graphics(x, y);
			// draw head
			g.beginFill(Color.TAN);
			g.drawCircle(0, 0, Vole.diameter);
			// draw eyes
			g.beginFill(Color.BLACK);
			g.drawCircle(-16, -16, 4);
			g.drawCircle(16, -16, 4);
			// draw nose
			g.drawCircle(0, -4, 8);
			// draw teeth
			g.beginFill(Color.YELLOW);
			g.drawRect(-4, 2, 3, 10);
			g.drawRect(0, 2, 3, 11);
			//
			Gm.b2d.enable(this.graphic);
			var bodyG: PBBody = this.graphic.body;
			bodyG.clearFixtures();
			bodyG.static = true;
			// set body on pop out
			var tweenOut: Phaser.Tween = Gm.ie.add.tween(g.scale);
			tweenOut.from({ x: 0, y: 0 }, 1000, Phaser.Easing.Quadratic.In);
			tweenOut.start();
			tweenOut.onComplete.addOnce(this.enableGraphicBody, this);

			Stage.groupActors.add(g);
			Stage.groupActors.sendToBack(g);
		}
		private enableGraphicBody(): void {
			var bodyG: PBBody = this.graphic.body;
			var fG: BFxt = bodyG.addCircle(32, 0, 0);
			fG.SetUserData(this);
			bodyG.bullet = true;
			bodyG.gravityScale = -1;
			bodyG.static = false;
			bodyG.setCollisionCategory(Collision.BALL);
			bodyG.setCollisionMask(Collision.BALL | Collision.BOUNDARY
				| Collision.HAMMER | Collision.MAIN | Collision.SLOT);
			bodyG.velocity.x = 500 * (Math.random() - Math.random());
			bodyG.velocity.y = 500 * (Math.random() - Math.random());
		}
	}




	export class Slider extends Ball {
		static countGlobal: number = 0;
		static readonly VALUE: number = 69;

		get colorsBase(): number[] {
			return [Color.GOLD, Color.RED, Color.YELLOW, Color.BROWN];
		}
		get type(): string { return Ks.slider; }
		protected get valueBase(): number { return Slider.VALUE; }
		protected get diameter(): number { return 32; }

		protected constructK(): string {
			var result: string = this.k = this.type + Slider.countGlobal++
			return result;
		}
		protected constructGraphic(x: number, y: number): void {
			var diameter: number = this.diameter,
				radius: number = diameter / 2;
			var bevel: number = radius / 2;
			var g: Graphic = this.graphic = Gm.ie.add.graphics(x, y);
			// buns
			g.beginFill(Color.GOLD);
			g.drawCircle(0, 0, diameter);
			g.drawRoundedRect(-radius, 0, diameter, radius, bevel);
			// beef
			g.beginFill(Color.BROWN);
			g.drawRoundedRect(-radius - 4, 2, diameter + 8, 8, 4);
			// cheese
			g.beginFill(Color.YELLOW);
			g.drawPolygon(
				{ x: radius, y: 2 },
				{ x: -radius + 2, y: 2 },
				{ x: -4, y: 8 }
			);
			// tomato
			g.beginFill(Color.RED);
			g.drawRect(-radius - 1, -2, diameter + 2, 4);

			Gm.b2d.enable(g);
			var body: PBBody = g.body;
			body.clearFixtures();
			var f: BFxt = body.addCircle(radius, 0, 0);
			f.SetUserData(this);
			body.bullet = true;
			body.gravityScale = 0;
			body.setCollisionCategory(Collision.BALL);
			body.setCollisionMask(Collision.BALL | Collision.BOUNDARY
				| Collision.HAMMER | Collision.MAIN | Collision.SLOT);
			body.velocity.x = 300;

			Stage.groupActors.add(g);
			Stage.groupActors.sendToBack(g);
		}

		handleBeginContact(fixtureThis: BFxt, fixtureThat: BFxt): void {
			if (fixtureThat.GetFilterData().categoryBits == Collision.HEAD_MAIN
			) {
				Gm.ie.onEffect.dispatch(Ks.text, {
					x: this.x, y: this.y, text: 'CHOMP',
					colorStroke: Color.GOLD
				});
				Gm.ie.onSound.dispatch(Ks.chomp);

				this.finish(Ks.score);
			} else {
				super.handleBeginContact(fixtureThis, fixtureThat);
			}
		}
	}

}
