module XG {
	// **** game starting point ****
	window.onload = () => {
		var game: Gm = new Gm(1280, 720, Phaser.AUTO);
		game.state.add(Ks.play, GmStatePlay);
		game.state.add(Ks.stop, GmStateStop);
		game.state.start(Ks.stop);
	}


	export class Gm extends Phaser.Game {
		physics: GmPhysics; // type for inherited property

		/** game instance */
		static get ie(): Gm {
			return <Gm>Phaser.GAMES[0];
		}
		/** game box2d instance */
		static get b2d(): PB {
			return Gm.ie.physics.box2d;
		}
		static readonly Y_TOP: number = -200;
		static get Y_BOTTOM(): number { return Gm.ie.height + 16; }

		get hwidth(): number { return this.width / 2 }
		// control
		control: GmControl;
		// signals:
		onEffect: Phaser.Signal;
		onEnding: Phaser.Signal;
		onControl: Phaser.Signal;
		onScore: Phaser.Signal;
		onSound: Phaser.Signal;
	}
	class GmContactListener extends box2d.b2ContactListener {
		BeginContact(contact: box2d.b2Contact): void {
			this.contact(contact, Ks.handleBeginContact);
		}
		EndContact(contact: box2d.b2Contact): void {
			this.contact(contact, Ks.handleEndContact);
		}

		private contact(contact: box2d.b2Contact, kFunction: string): void {
			var fA: BFxt = contact.GetFixtureA(),
				eA: any = fA.GetUserData();
			var fB: BFxt = contact.GetFixtureB(),
				eB: any = fB.GetUserData();
			if (eA && eA[kFunction]) {
				eA[kFunction](fA, fB);
			}
			if (eB && eB[kFunction]) {
				eB[kFunction](fB, fA);
			}
		}
	}
	export class GmControl {
		/** bind input to game control signals */
		constructor() {
			var KC = Phaser.KeyCode;
			var kb: Phaser.Keyboard = Gm.ie.input.keyboard;
			// handle onDown, onUp
			for (var keyCode of [
				// main character control keys
				KC.Q, KC.W, KC.E,
				KC.A, KC.D, KC.SHIFT,
				// pins rows control keys
				KC.U, KC.I, KC.J, KC.K, KC.N, KC.M
			]) {
				var key: Phaser.Key = kb.addKey(keyCode);
				key.onDown.add(this.handleKey, this);
				key.onUp.add(this.handleKey, this);
			}
		}

		handleKey(e: {
			isDown: boolean;
			keyCode: number;
		}): void {
			var KC = Phaser.KeyCode;
			var kc: number = e.keyCode;
			var onControl: Phaser.Signal = Gm.ie.onControl;
			switch (kc) {
				case KC.Q:
					if (e.isDown) {
						onControl.dispatch(Ks.mainHammer, { state: Ks.left });
					}
					break;
				case KC.W:
					if (e.isDown) {
						onControl.dispatch(Ks.mainHammer, { state: Ks.top });
					}
					break;
				case KC.E:
					if (e.isDown) {
						onControl.dispatch(Ks.mainHammer, { state: Ks.right });
					}
					break;
				case KC.A:
					onControl.dispatch(Ks.mainMove, {
						isActive: e.isDown, state: Ks.left
					});
					break;
				case KC.D:
					onControl.dispatch(Ks.mainMove, {
						isActive: e.isDown, state: Ks.right
					});
					break;
				case KC.SHIFT:
					onControl.dispatch(Ks.mainSlow, { isActive: e.isDown });
					break;
				case KC.U:
				case KC.I:
				case KC.J:
				case KC.K:
				case KC.N:
				case KC.M:
					var row: number = (kc == KC.U || kc == KC.I) ? 0
									: (kc == KC.J || kc == KC.K) ? 1
									: /*kc == Kb.N || kc == Kb.M*/ 2;
					var state: string = (kc == KC.U || kc == KC.J || kc == KC.N)
						? Ks.left : Ks.right;
					onControl.dispatch(Ks.pinsMove, {
						isActive: e.isDown, row: row, state: state
					});
					break;
			}
		}
	}
	class GmPhysics extends Phaser.Physics {
		box2d: PB;
	}
	export class GmStatePlay extends Phaser.State {
		game: Gm;
		//
		updates: K2IUpdate;

		create(): void {
			this.game.onEnding.addOnce(this.endGame, this);
			this.createBox2D();
			this.createBoundariesWorld();
			this.createControlInput();
			this.createEntities();
		}
		private createBoundariesWorld(): void {
			var game: Gm = this.game;
			// side boundaries for world
			var wBound: number = 100,
				hwBound: number = wBound / 2;
			var bBounds: PBBody = new Phaser.Physics.Box2D.Body(game, null);
				bBounds.addRectangle(wBound, 100000, -hwBound);
				bBounds.addRectangle(wBound, 100000, game.width + hwBound);
				bBounds.static = true;
				bBounds.setCollisionCategory(Collision.BOUNDARY_WORLD);
				bBounds.setCollisionMask(Collision.MAIN);
		}
		private createBox2D(): void {
			var physics: GmPhysics = this.game.physics;
			physics.startSystem(Phaser.Physics.BOX2D);
			var b2d: PB = physics.box2d;
			b2d.setPTMRatio(100);
			b2d.gravity.y = 200;
			b2d.world.SetContactListener(new GmContactListener());
		}
		private createControlInput(): void {
			this.game.control = new GmControl();
		}
		private createEntities(): void {
			this.updates = {};
			new Stage();
			new Main();
		}

		private endGame(): void {
			// do not clear sounds from cache
			this.game.state.start(Ks.stop, true, false);
		}


		render(): void {
			//this.game.debug.box2dWorld();
		}
		update(): void {
			var updates: K2IUpdate = this.updates;
			for (var k in updates) {
				updates[k].update();
			}
		}
	}
	export class GmStateStop extends Phaser.State {
		game: Gm;

		private get isLoaded(): boolean {
			return this.game.cache.getSound(Ks.sfx) != null;
		}

		init(): void {
			// strech-fit game on screen
			this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;

			this.initLoad();
		}
		private initLoad(): void {
			if (this.isLoaded) { return; }

			// display loading text
			var textLoad: Phaser.Text = this.game.add.text(0, 0,
				'LOADING.', { fill: Color.toStringHex(Color.WHITE) });
			this.game.load.onLoadComplete.addOnce(textLoad.destroy, textLoad);
		}

		preload(): void {
			if (this.isLoaded) { return; }

			var path: string = 'assets/audiosprite';
			// load .ogg for Firefox
			this.game.load.audiosprite(Ks.sfx, [path + '.mp3', path + '.ogg'],
				path + '.json');
		}

		create(): void {
			this.createSignals();
			Fx.create();
			SFx.createSounds();
			this.createInputHandlerStart();
			this.createText();
		}
		private createSignals(): void {
			var game: Gm = this.game;
			game.onEffect = new Phaser.Signal();
			game.onEnding = new Phaser.Signal();
			game.onControl = new Phaser.Signal();
			game.onScore = new Phaser.Signal();
			game.onSound = new Phaser.Signal();
		}
		private createInputHandlerStart(): void {
			this.game.input.keyboard.addCallbacks(this, this.startGame);
			// disable right click dropdown, mouse wheel scroll
			var fnPreventDefaultInputEvent:
				(this: V, event: PointerEvent | WheelEvent) => void =
				function (this, event: PointerEvent | WheelEvent): void {
					event.preventDefault();
				};
			window.oncontextmenu = fnPreventDefaultInputEvent;
			window.onmousewheel = fnPreventDefaultInputEvent;
		}
		private createText(): void {
			var game: Gm = <Gm>this.game;
			var x: number = game.hwidth;

			// title
			var strTitle: string = '[ V O L O P L I N K O ]';
			var textTitle: Phaser.Text = game.add.text(x, 50,
				strTitle, TextStyle.MAJOR);
			textTitle.anchor.x = 0.5;

			// description
			var strDesc: string = `
				  [ CONTROLS ]
				W:  swing hammer
				Q,E:  swing hammer left, right
				A,D:  move left, right
				SHIFT:  move slower
				U,I, J,K, N,M:  move top, middle, bottom pins left, right


				  [ BASE VALUES ]
				VOLE:  ${Vole.VALUE}
				SLIDER:  ${Slider.VALUE}

				  [ BONUS MULTIPLIERS ]
				${Bonus.sSILVER}:  x${Bonus.SILVER}
				${Bonus.sGOLD}:  x${Bonus.GOLD}
				${Bonus.sDEEP}:  x${Bonus.DEEP}
				${Bonus.sHIGH}:  x${Bonus.HIGH}



				        tap here - or - press any key to play
			`;
			var textDesc: Phaser.Text = game.add.text(x, 128,
				strDesc, TextStyle.MINOR);
			textDesc.anchor.x = 0.5;
			textDesc.inputEnabled = true;
			textDesc.events.onInputDown.add(this.startGame, this);


			// clickable text
			//
			// sound on/off text
			this.createTextBtn(game.height - 77, 'sound', SFx, Color.SILVER);
			//
			// touch input on/off text
			this.createTextBtn(game.height - 55, 'touch', Touch, Color.SILVER);
			//
			// donate text
			this.createTextBtn(game.height - 20,
				'donate BTC', null, Color.GOLD,
				function (_text: Phaser.Text) {
					var strDonate: string = 'Bitcoin Address:  '
						+ '1E6YnvHJDhdYZp9JhjH7da51yJRzdtb6Ck\n\n'
						+ 'Thanks for your help.';
					alert(strDonate);
				}
			);

			// score from last game
			var score: number = Score.Value;
			if (score !== undefined) {
				var textScore: Phaser.Text = game.add.text(x, game.height / 2,
					'SCORE:  ' + score, TextStyle.MAJOR);
				textScore.anchor.x = 0.5;

				// color of score text dependent on previous game's score
				var colorText: number = Score.colorFromScore();
				textScore.addColor(Color.toStringHex(colorText), 0);

				var colorStroke: number = Color.GRAY_3;
				if (colorText == Color.TYRIAN) {
					// after score surpasses highest color tier (21000),
					// text stroke color becomes brighter shade of yellow
					var brightness: number = (score - 21000) / 210;
					brightness = Math.min(0xff, Math.floor(brightness));
					colorStroke = Color.YELLOW + brightness;
				}

				textScore.stroke = Color.toStringHex(colorStroke);
				textScore.strokeThickness = 8;
				textScore.rotation = Math.PI * -0.125;
			}
		}
		private createTextBtn(y: number, strProperty: string,
			objProperty: { isOn: boolean; },
			color: number, functionOnDown?: Function
		): Phaser.Text {
			var game: Gm = Gm.ie;
			var x: number = game.width - 30;
			var text: string = (objProperty != null)
				? this.createTextBtnSetText(strProperty, objProperty.isOn)
				: strProperty;
			var result: Phaser.Text
				= game.add.text(x, y, text, TextStyle.MINOR);
			result.addColor(Color.toStringHex(color), 0);
			result.anchor.x = result.anchor.y = 1;
			result.boundsAlignH = Ks.right;
			result.boundsAlignV = Ks.bottom;
			result.inputEnabled = true;
			// bind click function
			functionOnDown = functionOnDown || this.createTextBtnSet;
			result.events.onInputDown.add(functionOnDown, this,
				0, strProperty, objProperty);
			return result;
		}
		private createTextBtnSet(text: Phaser.Text, v, strProperty: string,
			objProperty: { isOn: boolean; }
		): void {
			var isOn: boolean = objProperty.isOn = !objProperty.isOn;
			var gm: Gm = Gm.ie;
			var strOn: string = strProperty.toUpperCase()
				+ ((isOn) ? ' ON' : ' OFF');
			var colorOn: number = (isOn) ? Color.GOLD : Color.SILVER;
			// sound changed text effect
			gm.onEffect.dispatch(Ks.text, {
				x: gm.width / 2, y: gm.height / 2,
				text: strOn, colorStroke: colorOn
			});
			// sound will only play if sound is on
			gm.onSound.dispatch((isOn) ? Ks.bonusGold : Ks.bonusSilver);
			// change text of button
			text.text = this.createTextBtnSetText(strProperty, isOn);
		}
		private createTextBtnSetText(strProperty: string, isOn: boolean
		): string {
			// text says: set to the opposite of current state
			return 'set ' + strProperty + ((isOn) ? ' off' : ' on');
		}

		shutdown(): void {
			this.game.input.keyboard.removeCallbacks();
		}

		private startGame(): void {
			// do not clear sounds from cache
			this.game.state.start(Ks.play, true, false);
		}
	}
	export class Graphic extends Phaser.Graphics {
		body: PBBody;
	}
	/** a square BitmapData */
	export class ParticleSqBD extends Phaser.Particle {
		constructor(game: Gm, x: number, y: number, key: string) {
			super(game, x, y, Gm.ie.cache.getBitmapData(key));
		}
	}


	export class GmH {
		static count(vs: K2V): number {
			return Object.keys(vs).length;
		}

		/**
		 * takes an implicitly even-length array and transforms it into a K2V Object
		 * even-indexed elements become keys, odd-indexed elements become values
		 */
		static toK2VFromK0V1s(...pairsK0V1: (K | V)[]): K2V {
			var result: K2V = {};
			for (var iKV: number = 0; iKV < pairsK0V1.length; iKV += 2) {
				var k: K = pairsK0V1[iKV],
					v: V = pairsK0V1[iKV + 1];
				result[k] = v;
			}
			return result;
		}
	}
	export class GmMath {
		static mod(n: number, m: number): number {
			return ((n % m) + m) % m;
		}
		static sigmoid(x: number, scaleX: number, scaleY: number): number {
			var ePowX: number = Math.pow(Math.E, x / scaleX);
			return scaleY * (ePowX / (ePowX + 1));
		}
	}


	export class Collision {
		static readonly NONE: number = 0x0000;
		static readonly BOUNDARY: number = 0x0001;
		static readonly HAMMER: number = 0x0002;
		static readonly MAIN: number = 0x0004;
		static readonly HEAD: number = 0x0008;
		static readonly HEAD_HAMMER: number = Collision.HAMMER | Collision.HEAD;
		static readonly HEAD_MAIN: number = Collision.MAIN | Collision.HEAD;
		static readonly BALL: number = 0x0010;
		static readonly SLOT: number = 0x0020;
		// want to prevent main character from leaving screen,
		// but play no sound when colliding hammer
		static readonly BOUNDARY_WORLD: number = 0x0040 | Collision.BOUNDARY;
	}


	export class Color {
		static readonly BLACK: number = 0x000000;
		static readonly BLUE_P: number = 0x3366ff;
		static readonly BROWN: number = 0x663300;
		static readonly GOLD: number = 0xffcc33;
		static readonly GRAY_3: number = 0x333333;
		static readonly RED: number = 0xff0000;
		static readonly RED_N9: number = 0x660000;
		static readonly SILVER: number = 0x999999;
		static readonly TAN: number = 0x996600;
		static readonly TYRIAN: number = 0xcc0099;
		static readonly YELLOW: number = 0xffff00;
		static readonly WHITE: number = 0xffffff;

		static toStringHex(c: number): string {
			return '#' + c.toString(16).substring(0, 6);
		}
	}

	export class TextStyle {
		static get MAJOR(): Phaser.PhaserTextStyle {
			return {
				align: Ks.center, fill: '#ffffff', font: '32px Arial'
			};
		}
		static get MINOR(): Phaser.PhaserTextStyle {
			return {
				align: Ks.left, fill: '#ffffff', font: '16px Arial'
			};
		}
	}


	export class Ks {
		static readonly top: string = 'top';
		static readonly left: string = 'left';
		static readonly bottom: string = 'bottom';
		static readonly right: string = 'right';
		static readonly center: string = 'center';
		static readonly sides: string = 'sides';
		static readonly score: string = 'score';
		// states
		static readonly play: string = 'play';
		static readonly stop: string = 'stop';
		// classes
		static readonly hammer: string = 'hammer';
		static readonly machine: string = 'machine';
		static readonly particle: string = 'particle';
		static readonly player: string = 'player';
		// balls
		static readonly vole: string = 'vole';
		static readonly slider: string = 'slider';
		// functions
		static readonly handleBeginContact: string = 'handleBeginContact';
		static readonly handleEndContact: string = 'handleEndContact';
		// effects
		static readonly burst: string = 'burst';
		static readonly ending: string = 'ending';
		static readonly text: string = 'text';
		// control
		static readonly mainHammer: string = 'mainHammer';
		static readonly mainMove: string = 'mainMove';
		static readonly mainSlow: string = 'mainSlow';
		static readonly pinsMove: string = 'pinsMove';
		// sound effects
		static readonly ballOut: string = 'ballOut';
		static readonly ballThud: string = 'ballThud';
		static readonly bonusDeep: string = 'bonusDeep';
		static readonly bonusGold: string = 'bonusGold';
		static readonly bonusHigh: string = 'bonusHigh';
		static readonly bonusSilver: string = 'bonusSilver';
		static readonly chomp: string = 'chomp';
		//static readonly ending: string = 'ending';
		static readonly hammerHit: string = 'hammerHit';
		static readonly hammerSwing: string = 'hammerSwing';
		static readonly hammerThud: string = 'hammerThud';
		static readonly scoreLarge: string = 'scoreLarge';
		static readonly scoreMedium: string = 'scoreMedium';
		static readonly scoreSmall: string = 'scoreSmall';
		static readonly sfx: string = 'sfx';
	}

	export class Bonus {
		static readonly SILVER: number = 2;
		static readonly GOLD: number = 4;
		static readonly DEEP: number = 6;
		static readonly HIGH: number = 7;

		static readonly sSILVER: string = 'SILVER';
		static readonly sGOLD: string = 'GOLD';
		static readonly sDEEP: string = 'DEEP SMASH';
		static readonly sHIGH: string = 'HIGH SMASH';

		static readonly Bonus2Color: K2Number = GmH.toK2VFromK0V1s(
			Bonus.SILVER, Color.SILVER,
			Bonus.GOLD, Color.GOLD,
			Bonus.DEEP, Color.RED,
			Bonus.HIGH, Color.BLUE_P
		);
		static readonly Bonus2Text: K2String = GmH.toK2VFromK0V1s(
			Bonus.SILVER, Bonus.sSILVER,
			Bonus.GOLD, Bonus.sGOLD,
			Bonus.DEEP, Bonus.sDEEP,
			Bonus.HIGH, Bonus.sHIGH
		);

		static readonly WIDTH_HALO: number = 2;
		static readonly Type2OffsetRadius: K2Number = GmH.toK2VFromK0V1s(
			Ks.hammer, 6 * Bonus.WIDTH_HALO,
			Ks.top, 5 * Bonus.WIDTH_HALO,
			'pins0', 4 * Bonus.WIDTH_HALO,
			'pins1', 3 * Bonus.WIDTH_HALO,
			'pins2', 2 * Bonus.WIDTH_HALO,
			Ks.bottom, Bonus.WIDTH_HALO
		);
	}


	// interfaces
	export interface I_destructor { destructor(): void; }
	export interface I_k { k: K; }
	export interface I_update { update(): void; }
	export interface I_xy { x: number; y: number; }
	// types
	/** key or index to access values in object or array */
	export type K = string | number;
	/** value or variable */
	export type V = any;
	// K-V mapped objects
	export type K2V = { [k: string]: V };
	export type K2Graphic = { [k: string]: Graphic };
	export type K2Number = { [k: string]: number };
	export type K2String = { [k: string]: string };
	export type K2IUpdate = { [k: string]: I_update };
	// imported
	export type BFxt = box2d.b2Fixture;
	export type PB = Phaser.Physics.Box2D;
	export type PBBody = Phaser.Physics.Box2D.Body;
	export type PEmitter = Phaser.Particles.Arcade.Emitter;
}
