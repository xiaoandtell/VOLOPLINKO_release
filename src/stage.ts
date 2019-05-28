module XG {

	/** contains all stage objects */
	export class Stage {
		static readonly Y_MAIN: number = 150;
		static readonly Y_MACHINE: number = 250;
		static readonly Y_SLIDER: number = 20;
		static groupActors: Phaser.Group;
		static groupEffects: Phaser.Group;
		static groupInput: Phaser.Group;
		static groupMachine: Phaser.Group;
		static machine: Machine;
		private managerSpawnActors: ManagerSpawnActors;
		private managerUpdateSlots: ManagerUpdateSlots;
		private score: Score;

		constructor() {
			// score textfield is behind player
			this.score = new Score();

			// create groups from bottommost to topmost
			Stage.groupMachine = Gm.ie.add.group();
			Stage.groupActors = Gm.ie.add.group();
			Stage.groupEffects = Gm.ie.add.group();
			Stage.groupInput = Gm.ie.add.group();

			Stage.machine = new Machine();

			this.managerSpawnActors = new ManagerSpawnActors();
			this.managerUpdateSlots = new ManagerUpdateSlots();

			Touch.init();
		}
	}

	export class Machine implements I_k, I_update {
		static readonly COLOR_FEATURE: number = Color.RED;
		static readonly COLOR_BACKGROUND: number = Color.RED_N9;
		static readonly COLOR_THRESHOLD: number = Color.GRAY_3;
		static readonly HEIGHT_THRESHOLD: number = 32;
		static get YS_PINS(): number[] {
			var y0: number = Stage.Y_MACHINE + 100;
			return [y0, y0 + 80, y0 + 160];
		}
		// used during constructing this
		private numSlotsPerRow: number;
		private widthSlot: number;
		private widthSpacer: number;
		private readonly radiusPin: number = 8;

		k: K;
		slotsRowsPins: Slot[][] = [[], [], []];
		slotsRowsThreshold: Slot[][] = [[], []];
		graphicsSpawnPts: Graphic[] = [];
		private graphicsFeatures: Graphic[] = [];
		private graphicsPins: Graphic[] = [];
		private statesPins: string[] = [null, null, null];

		constructor() {
			this.constructControlHandlers();
			// construct this Machine
			this.constructThisBG();
			this.constructThisBorders();
			this.constructThisPins();
			this.constructThisSpawnPoints();

			var k: string = this.k = Ks.machine;
			(<GmStatePlay>Gm.ie.state.getCurrentState()).updates[k] = this;
		}
		private constructControlHandlers(): void {
			Gm.ie.onControl.add(this.handleControl, this);
		}
		//
		//
		//
		// construct this Machine:
		private constructThis_feature(g: Graphic, mask?: number): void {
			mask = mask || (Collision.BALL | Collision.BOUNDARY);

			Gm.b2d.enable(g);
			var bodyG: PBBody = g.body;
			bodyG.static = true;
			bodyG.setCollisionCategory(Collision.BOUNDARY);
			bodyG.setCollisionMask(mask);

			Gm.ie.add.existing(g);
			Stage.groupActors.add(g);
			this.graphicsFeatures.push(g);
		}
		//
		private constructThisBG(): void {
			var game: Gm = Gm.ie,
				wGame: number = game.width,
				hwGame: number = wGame / 2,
				hGame: number = game.height;
			var hThreshold: number = Machine.HEIGHT_THRESHOLD,
				hhThreshold: number = hThreshold / 2;

			var y: number = Stage.Y_MACHINE;
			var g: Graphic = game.add.graphics(hwGame, y);
			// draw machine's top threshold
			g.beginFill(Color.GRAY_3);
			g.drawRect(-hwGame, -hhThreshold, wGame, hThreshold);
			// set top threshold as walkway for main character
			this.constructThis_feature(g, Collision.MAIN);

			// draw machine's background color
			var hBG: number = hGame - y;
			g.beginFill(Machine.COLOR_BACKGROUND);
			g.drawRect(-hwGame, hhThreshold, wGame, hBG);

			g.beginFill(Machine.COLOR_THRESHOLD);
			// draw machine's bottom threshold
			g.drawRect(-hwGame, hBG - hThreshold, wGame, hThreshold);
			// draw machine's pin thresholds
			var radiusPin: number = this.radiusPin,
				ysPins: number[] = Machine.YS_PINS;
			for (var yPin of ysPins) {
				yPin = yPin - y - radiusPin;
				g.drawRect(-hwGame, yPin, wGame, 2 * radiusPin);
			}

			Stage.groupMachine.add(g);
		}
		private constructThisBorders(): void {
			this.constructThisBordersInitWidths();
			this.constructThisBordersSpacers();
			this.constructThisBordersWalls();
		}
		private constructThisBordersInitWidths(): void {
			var wGame: number = Gm.ie.width;
			// width of slot = width of vole + some margin space
			var wSlot: number =
				this.widthSlot = Vole.diameter + 4;
			// slots are evenly spaced across width of game
			var numSlots: number = Math.floor(wGame / wSlot) - 1;
			if (numSlots % 2 == 0) {
				// ensure a slot at the center of game
				numSlots--;
			}
			this.numSlotsPerRow = numSlots;

			var wTotalSlots: number = numSlots * wSlot;
			// spacers are rectangles that separate slots
			var numSpacers: number = numSlots + 1,
				wTotalSpacers: number = wGame - wTotalSlots;
			this.widthSpacer = wTotalSpacers / numSpacers;
		}
		/** construct top, bottom slots' spacers and slots */
		private constructThisBordersSpacers(): void {
			var game: Gm = Gm.ie;
			var numSpacers: number = this.numSlotsPerRow + 1,
				wSpacer: number = this.widthSpacer,
				hwSpacer: number = wSpacer / 2;
			var h: number = Machine.HEIGHT_THRESHOLD,
				hh: number = h / 2;
			var yT: number = Stage.Y_MACHINE,
				yB: number = game.height - hh;
			var slotsRows: Slot[][] = this.slotsRowsThreshold;
			var wSlot: number = this.widthSlot;
			for (var i = 0; i < numSpacers; i++) {
				var gSp: Graphic;
				var xSpacer: number = hwSpacer + i * (wSpacer + wSlot);

				// construct top hole spacers
				gSp = game.add.graphics(xSpacer, yT);
				gSp.beginFill(Machine.COLOR_FEATURE);
				gSp.drawRect(-hwSpacer, -hh, wSpacer, h);
				var mask: number = Collision.BALL | Collision.HAMMER;
				this.constructThis_feature(gSp, mask);

				// construct bottom hole spacers
				gSp = game.add.graphics(xSpacer, yB);
				gSp.beginFill(Machine.COLOR_FEATURE);
				gSp.drawRect(-hwSpacer, -hh, wSpacer, h);
				this.constructThis_feature(gSp);

				if (i == numSpacers) { break; }

				var xSlot: number = (i + 1) * wSpacer + (i + 0.5) * wSlot;
				// construct top slots
				slotsRows[0].push(new Slot(Ks.center, xSlot, yT, wSlot, h));
				// construct bottom slots
				slotsRows[1].push(new Slot(Ks.bottom, xSlot, yB, wSlot, h));
			}
		}
		private constructThisPins(): void {
			var game: Gm = Gm.ie;

			// pins slide horizontally via prismatic joint,
			// use a machine feature (static body) as joint's bodyA
			var bAnchor: PBBody = this.graphicsFeatures[0].body;

			var groupPins: Phaser.Group = Stage.groupMachine;
			var gsPins: Graphic[] = this.graphicsPins;
			var dPin: number = 16,
				rPin: number = dPin / 2;
			var numColsPins: number = this.numSlotsPerRow - 5;
			// total width available for pins to exist and move within
			var x0: number = this.widthSpacer,
				x1: number = game.width - x0;
			var wTotalPins: number = x1 - x0;
			// space between adjacent pins
			var xDistPins: number = wTotalPins / (numColsPins + 1);
			var yPins: number[] = Machine.YS_PINS,
				numRows: number = yPins.length;
			for (var iR = 0; iR < numRows; iR++) {
				var gPin: Graphic = game.add.graphics();
				gPin.beginFill(Machine.COLOR_FEATURE);
				groupPins.add(gPin);
				this.constructThis_feature(gPin);

				var bPin: PBBody = gPin.body;
				bPin.clearFixtures();

				var slotsRow: Slot[] = this.slotsRowsPins[iR];
				var xPin: number = x0 + xDistPins,
					yPin: number = yPins[iR];
				for (var iC = 1; iC <= numColsPins; iC++) {
					// add pin fixture
					gPin.drawCircle(xPin, yPin, dPin);
					bPin.addCircle(rPin, xPin, yPin);

					if (iC != numColsPins) {
						// add slot between pins
						var typeSlot: string = 'pins' + iR;
						var slot: Slot = new Slot(typeSlot, xPin, yPin,
							xDistPins, 2 * rPin);
						slotsRow.push(slot);
						var gSlot: Graphic = slot.graphic;
						groupPins.moveDown(gSlot);
						var bSlot: PBBody = slot.graphic.body;
						bSlot.static = false;
						game.physics.box2d.weldJoint(bPin, bSlot,
							-bPin.x + xDistPins / 2, -bPin.y,
							-bSlot.x, -bSlot.y);
					}

					xPin += xDistPins;
				}
				Gm.ie.physics.box2d.prismaticJoint(bAnchor, gPin.body,
					undefined, undefined, -bAnchor.x, -bAnchor.y);

				gsPins.push(gPin);
			}
		}
		private constructThisSpawnPoints(): void {
			var gsSpawnPts: Graphic[] = this.graphicsSpawnPts;

			var game: Gm = Gm.ie,
				hwGame: number = game.hwidth;
			var xsSpawnPts: number[] = [hwGame - 300, hwGame, hwGame + 300];
			for (var x of xsSpawnPts) {
				var gSpawn: Graphic = game.add.graphics(x, 600);
				gSpawn.beginFill(Color.BLACK);
				gSpawn.lineStyle(8, Machine.COLOR_THRESHOLD);
				gSpawn.drawCircle(0, 0, 64);
				gsSpawnPts.push(gSpawn);
				Stage.groupMachine.add(gSpawn);
			}
		}
		/** construct left, right pachinko walls */
		private constructThisBordersWalls(): void {
			var game: Gm = Gm.ie;
			var w: number = this.widthSpacer,
				hw: number = w / 2,
				h: number = game.height - Stage.Y_MACHINE
					- 1.5 * Machine.HEIGHT_THRESHOLD,
				hh: number = h / 2;
			var xs: number [] = [hw, game.width - hw];
			var y: number = game.height - h / 2 - Machine.HEIGHT_THRESHOLD;
			for (var i = 0; i < xs.length; i++) {
				var x: number = xs[i];
				var gWall: Graphic = game.add.graphics(x, y);
				gWall.beginFill(Machine.COLOR_FEATURE);
				gWall.drawRect(-hw, -hh, w, h);
				this.constructThis_feature(gWall);
			}
		}
		// :construct this Machine
		//
		//
		//

		private handleControl(type: string, def: {
			isActive: boolean;
			row: number;
			state: string;
		}): void {
			if (type !== Ks.pinsMove) { return; }

			var iRow: number = def.row;
			if (def.isActive) {
				this.statesPins[iRow] = def.state;
				this.graphicsPins[iRow].body.static = false;
			} else {
				if (this.statesPins[iRow] === def.state) {
					this.statesPins[iRow] = null;
					this.graphicsPins[iRow].body.static = true;
				}
			}
		}

		update(): void {
			for (var i in this.statesPins) {
				var statePin: string = this.statesPins[i];
				if (statePin != null) {
					this.updatePin(this.graphicsPins[i].body,
						statePin === Ks.left);
				}
			}
		}
		private updatePin(body: PBBody, isMovingLeft: boolean): void {
			var speed: number = 100;
			body.velocity.x = (isMovingLeft) ? -speed : speed;
		}
	}


	class ManagerSpawnActors {
		private delayVole: number = 4000;
		private delaySlider: number = 5000;

		constructor() {
			var eventsTime: Phaser.Timer = Gm.ie.time.events;
			eventsTime.add(this.delaySlider, this.spawnSlider, this);
			eventsTime.add(this.delayVole, this.spawnVole, this);
		}
		private spawnSlider(): void {
			new Slider(0, Stage.Y_SLIDER);

			// spawn slider slower next time to decrease reward chance
			// slower as score increases
			var deltaDelay: number = Math.min(696969, Score.Value * 100);
			this.delaySlider = this.delaySlider + deltaDelay;
			Gm.ie.time.events.add(this.delaySlider, this.spawnSlider, this);
		}
		/** constructs a vole at one of the 3 spawn points */
		private spawnVole(): void {
			// select random spawn point
			var spawnPts: Graphic[] = Stage.machine.graphicsSpawnPts,
				iSpawnPt: number = Math.floor(spawnPts.length * Math.random()),
				spawnPt: Graphic = spawnPts[iSpawnPt];
			new Vole(spawnPt.x, spawnPt.y);

			// spawn vole faster next time to increase difficulty
			// faster as score increases
			var deltaDelay: number = Math.floor(Score.Value / 100);
			this.delayVole = Math.max(777, this.delayVole - deltaDelay);
			Gm.ie.time.events.add(this.delayVole, this.spawnVole, this);
		}
	}


	class ManagerUpdateSlots {
		index: number;
		pSPCurrent: PatternSlotsPins;

		constructor() {
			this.setNextPSP();
			this.updateSlotsPins();
			this.updateSlotsThreshold();
		}

		private getPSPRand(): PatternSlotsPins {
			var g: number = Bonus.GOLD,
				s: number = Bonus.SILVER;
			var result: PatternSlotsPins;
			switch (Math.floor(Math.random() * 4)) {
				case 0:
					result = {
						numCols: 3,
						values: [[ // gold-centered silver +
							1, s, 1,
							s, g, s,
							1, s, 1
						]]
					};
					break;
				case 1:
					result = {
						numCols: 3,
						values: [[ // gold-centered silver x
							s, 1, s,
							1, g, 1,
							s, 1, s
						]]
					};
					break;
				case 2:
					result = {
						numCols: 3,
						values: [
							[ // gold-centered silver +
								1, s, 1,
								s, g, s,
								1, s, 1
							], [ // gold-centered silver x
								s, 1, s,
								1, g, 1,
								s, 1, s
							]
						]
					};
					break;
				case 3:
					// 3 gold-silver bullets in random row order
					var bullets: number[][] = Phaser.ArrayUtils.shuffle([
						[g, s, 1, 1, 1, 1],
						[1, 1, g, s, 1, 1],
						[1, 1, 1, 1, g, s]
					]);
					result = {
						numCols: 6,
						values: [
							bullets[0]
							.concat(bullets[1])
							.concat(bullets[2])
						]
					};
					break;
			}

			// small random probability of golden pattern
			if (Math.random() < 0.069) {
				var values: number[][] = result.values;
				for (var fV of values) {
				for (var iV in fV) {
					if (fV[iV] == s) {
						fV[iV] = g;
					}
				} }
			}

			return result;
		}
		private setNextPSP() {
			this.pSPCurrent = this.getPSPRand();
			this.index = 0;
		}

		private updateSlotsPins(): void {
			var slots: Slot[][] = Stage.machine.slotsRowsPins;

			// set all slots to no bonus
			for (var slotsRow of slots) {
				for (var slot of slotsRow) {
					slot.value = 1;
				}
			}

			// lay pattern on slots:
			var index: number = this.index;
			var p: PatternSlotsPins = this.pSPCurrent;
			// determine which frame of pattern to draw
			var framesP: number[][] = p.values,
				valsP: number[] = framesP[index % framesP.length];

			var numColsP: number = p.numCols,
				numColsSlots: number = slots[0].length;
			// leftmost slot column to draw pattern
			var iColPL: number = numColsSlots - index;
			// draw pattern by each column
			for (var iColOffset = 0; iColOffset < numColsP; iColOffset++) {
				var iC: number = iColPL + iColOffset;
				if (iC < 0 || iC >= numColsSlots) {
					continue;
				}

				// current pattern column is valid, set bonus
				for (var iR = 0; iR < 3; iR++) {
					slots[iR][iC].value = valsP[iR * numColsP + iColOffset];
				}
			}

			if (iC == 0) {
				this.setNextPSP();
			} else {
				this.index++;
			}

			Gm.ie.time.events.add(2000, this.updateSlotsPins, this);
		}

		/**
		 * sets bonus modifier slots for top and bottom slot rows:
		 * place gold slot sandwiched between silver slots on both rows,
		 * set other slots to no bonus
		 */
		private updateSlotsThreshold(): void {
			var slotsRows: Slot[][] = Stage.machine.slotsRowsThreshold;
			var vGold: number = Bonus.GOLD,
				vSilver: number = Bonus.SILVER;
			for (var slotsRow of slotsRows) {
				// set all slots to no bonus
				for (var slot of slotsRow) {
					slot.value = 1;
				}
				// set gold and silver slots
				var numSlots: number = slotsRow.length;
				var iGold: number = Math.floor(numSlots * Math.random());
				slotsRow[iGold].value = vGold;
				slotsRow[GmMath.mod(iGold - 1, numSlots)].value = vSilver;
				slotsRow[GmMath.mod(iGold + 1, numSlots)].value = vSilver;
			}

			Gm.ie.time.events.add(4000, this.updateSlotsThreshold, this);
		}
	}
	type PatternSlotsPins = {
		numCols: number;
		values: number[][]; // [index frame][pattern at index frame]
	}


	export class Slot {
		graphic: Graphic;
		type: string;
		private ballsInContact: { [k: string]: Ball };
		private _value: number;

		constructor(type: string, x: number, y: number,
			width: number, height: number
		) {
			this.type = type;
			this.ballsInContact = {};
			this.constructGraphic(x, y, width, height);
		}
		private constructGraphic(
			x: number, y: number,
			width: number, height: number
		): void {
			var g: Graphic = this.graphic = Gm.ie.add.graphics(x, y);
			g.beginFill(Color.WHITE);
			g.drawRect(-width / 2, -height / 2, width, height);
			Gm.b2d.enable(g);
			Stage.groupMachine.add(g);
			var bodyG: PBBody = g.body;
			bodyG.data.GetFixtureList().SetUserData(this);
			bodyG.mass = 0;
			bodyG.sensor = true;
			bodyG.static = true;
			bodyG.setCollisionCategory(Collision.SLOT);
			bodyG.setCollisionMask(Collision.BALL);
		}

		handleBeginContact(fixtureThis: BFxt, fixtureThat: BFxt): void {
			if (this.handleContactIfBall(fixtureThat)) {
				var ball: Ball = fixtureThat.GetUserData();
				this.ballsInContact[ball.k] = ball;
			}
		}
		handleEndContact(fixtureThis: BFxt, fixtureThat: BFxt): void {
			if (this.handleContactIfBall(fixtureThat)) {
				var ball: Ball = fixtureThat.GetUserData();
				delete this.ballsInContact[ball.k];
			}
		}

		handleContactIfBall(fixtureThat: BFxt): boolean {
			// handle bonus setting from begin to end contact
			// to set the greater bonus if slot value changes
			// by returning true to remember balls in contact to set bonus
			if (fixtureThat.GetFilterData().categoryBits == Collision.BALL) {
				var ball: Ball = fixtureThat.GetUserData();
				this.setContactedBall(ball);
				return true;
			}
			return false;
		}
		setContactedBall(ball: Ball): void {
			ball.setBonus(this.type, this.value);
		}

		get value(): number {
			return this._value;
		}
		set value(v: number) {
			if (this._value == v) { return; }

			this._value = v;
			if (Bonus.Bonus2Color[v]) {
				this.graphic.alpha = 1;
				this.graphic.tint = Bonus.Bonus2Color[v];

				// update bonus values for balls in contact
				var balls = this.ballsInContact;
				for (var k in balls) {
					this.setContactedBall(balls[k]);
				}
			} else {
				this.graphic.alpha = 0;
			}
		}
	}


	export class Score {
		static Value: number;
		static ITier: number = 0;
		static readonly Tiers: number[] = [0, 2000, 4000, 8000, 14000, 21000];
		static readonly TiersColors: number[]
			= [Color.WHITE, Color.SILVER, Color.GOLD, Color.RED, Color.BLUE_P,
				Color.TYRIAN];
		private textScore: Phaser.Text;

		static colorFromScore(): number {
			return Score.TiersColors[this.ITier];
		}

		constructor() {
			Score.ITier = 0;
			Score.Value = 0;

			this.constructTextScore();
		}

		private constructTextScore(): void {
			var game: Gm = Gm.ie;
			this.textScore = game.add.text(game.hwidth, 50,
				'SCORE:  ' + Score.Value, TextStyle.MAJOR);
			this.textScore.anchor.x = 0.5;
			game.onScore.add(this.updateScore, this);
		}
		private updateScore(difference: number): void {
			var value: number = Score.Value += difference;
			this.textScore.text = 'SCORE:  ' + value;

			// play sound type proportional to score difference
			if (difference < 50) {
				Gm.ie.onSound.dispatch(Ks.scoreSmall);
			} else if (difference < 1000) {
				Gm.ie.onSound.dispatch(Ks.scoreMedium);
			} else {
				Gm.ie.onSound.dispatch(Ks.scoreLarge);
			}

			// update score tier if score exceeds tier value
			var iTier: number = Score.ITier;
			var tiers: number[] = Score.Tiers;
			while (iTier + 1 < tiers.length && value >= tiers[iTier + 1]) {
				iTier = ++Score.ITier;
				this.textScore.addColor(Color.toStringHex(Score.colorFromScore()), 0);
			}
		}
	}


	export class Touch {
		static isOn: boolean = DetectDevice.mobileAndTabletcheck();
		static isInitialized: boolean;
		private static alphaBtnOff: number = 0.5;
		private static alphaBtnOn: number = 0.75;

		private static setEnabled(): void {
			this.isOn = !this.isOn;
		}
		static init(): void {
			if (!this.isOn) { return; }

			if (!this.isInitialized) {
				this.isInitialized = true;
				this.initTouches();
			}

			this.initButtons();
		}
		private static initTouches(): void {
			var game: Gm = Gm.ie;

			// allow up to 6 simultaneous finger touches - default is 2
			game.input.addPointer();
			game.input.addPointer();
			game.input.addPointer();
			game.input.addPointer();

			// disable right click/hold menu
			game.canvas.oncontextmenu = function (event: PointerEvent) {
				event.preventDefault();
			}
		}
		/** add touch buttons to stage */
		private static initButtons(): void {
			var game: Gm = Gm.ie;
			var add: Phaser.GameObjectFactory = game.add;
			var group: Phaser.Group = Stage.groupInput;
			var ys: number[] = Machine.YS_PINS;
			// left-side buttons for main character controls
			var xL: number = 200;
			var gHL: Graphic = add.graphics(xL - 60, ys[1], group),
				gHR: Graphic = add.graphics(xL + 60, ys[1], group),
				gML: Graphic = add.graphics(xL - 100, ys[2], group),
				gMR: Graphic = add.graphics(xL + 100, ys[2], group),
				gMLSlow: Graphic = add.graphics(xL - 35, ys[2], group),
				gMRSlow: Graphic = add.graphics(xL + 35, ys[2], group);
			// right-side buttons for pin row controls
			var xR: number = game.width - 200;
			var gMPTL: Graphic = add.graphics(xR - 50, ys[0], group),
				gMPTR: Graphic = add.graphics(xR + 50, ys[0], group),
				gMPML: Graphic = add.graphics(xR - 50, ys[1], group),
				gMPMR: Graphic = add.graphics(xR + 50, ys[1], group),
				gMPBL: Graphic = add.graphics(xR - 50, ys[2], group),
				gMPBR: Graphic = add.graphics(xR + 50, ys[2], group);
			// draw button backgrounds
			for (var g of [
				gHL, gHR, gML, gMR, gMLSlow, gMRSlow,
				gMPTL, gMPTR, gMPML, gMPMR, gMPBL, gMPBR
			]) {
				g.beginFill(Color.SILVER);
				g.drawCircle(0, 0, 64);
				g.lineStyle(4, Color.WHITE);
				g.alpha = 0.5;
			}
			// draw arrows arrows for move buttons
			for (var g of [gML, gMR, gMLSlow, gMRSlow,
				gMPTL, gMPTR, gMPML, gMPMR, gMPBL, gMPBR
			]) {
				g.moveTo(-12, 12);
				g.lineTo(16, 0);
				g.lineTo(-12, -12);
			}
			// flip arrows to face left for move-left buttons
			gML.scale.x = gMLSlow.scale.x
				= gMPTL.scale.x = gMPML.scale.x = gMPBL.scale.x = -1;
			// move slow buttons are smaller
			gMLSlow.scale.x = gMLSlow.scale.y
				= gMRSlow.scale.x = gMRSlow.scale.y = 0.61;
			// draw hammer symbol for hammer buttons
			for (var g of [gHL, gHR]) {
				g.moveTo(0, -8);
				g.lineTo(-8, -8);
				g.lineTo(-8, -16);
				g.lineTo(8, -16);
				g.lineTo(8, -8);
				g.lineTo(0, -8);
				g.lineTo(0, 16);
				g.scale.x = g.scale.y = 1.25;
			}
			// rotate hammer for swing hammer buttons
			gHL.rotation = -1;
			gHR.rotation = 1;
			// bind buttons to pseudo keyboard inputs
			var KC = Phaser.KeyCode;
			gHL.data = [KC.Q], gHR.data = [KC.E],
				gML.data = [KC.A], gMR.data = [KC.D],
				gMLSlow.data = [KC.A, KC.SHIFT],
				gMRSlow.data = [KC.D, KC.SHIFT],
				gMPTL.data = [KC.U], gMPTR.data = [KC.I],
				gMPML.data = [KC.J], gMPMR.data = [KC.K],
				gMPBL.data = [KC.N], gMPBR.data = [KC.M];
			for (var g of [
				gHL, gHR,
				gML, gMR, gMLSlow, gMRSlow,
				gMPTL, gMPTR, gMPML, gMPMR, gMPBL, gMPBR
			]) {
				// enable buttons' touch handling
				g.inputEnabled = true;
				g.events.onInputOver.add(this.handleBtnOver, this);
				g.events.onInputOut.add(this.handleBtnOut, this);
				g.events.onInputDown.add(this.handleBtnDown, this);
				g.events.onInputUp.add(this.handleBtnUp, this);
				// make buttons bigger
				g.scale.x *= 1.25;
				g.scale.y *= 1.25;
			}
		}
		private static handleBtnDown(g: Graphic): void {
			g.alpha = this.alphaBtnOn;
			var keyCodes: number[] = g.data;
			for (var keyCode of keyCodes) {
				Gm.ie.control.handleKey({ isDown: true, keyCode: keyCode });
			}
		}
		private static handleBtnUp(g: Graphic, p: Phaser.Pointer): void {
			// this is part of a HACK that fixes
			// the bug causing buttons to stick down:
			// (1/3) this part allows swiping over buttons to
			// engage other buttons by swiping onto them
			p.swapTarget(null, false);
		}
		// BUG: over and release does not release button
		private static handleBtnOver(g: Graphic, p: Phaser.Pointer): void {
			if (p.isDown) {
				// this is part of a HACK that fixes
				// the bug causing buttons to stick down:
				// (2/3) this part allows swipe-released buttons to disengage
				// as if click/tap-released
				g.input['_touchedHandler'](p);
			}
		}
		private static handleBtnOut(g: Graphic, p: Phaser.Pointer): void {
			g.alpha = this.alphaBtnOff;
			var keyCodes: number[] = g.data;
			for (var keyCode of keyCodes) {
				Gm.ie.control.handleKey({ isDown: false, keyCode: keyCode });
			}

			// this is part of a HACK that fixes
			// the bug causing buttons to stick down:
			// (3/3) this part allows swiped-out, disengaged buttons
			// to be swiped-over, engaged again
			g.input.reset();
			g.input.start();
		}
	}

}
