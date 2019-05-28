module XG {
	export class Fx {
		private static isInitialized: boolean;

		static create(): void {
			// create effects when effects event is dispatched
			Gm.ie.onEffect.add(this.createEffect, this);

			if (this.isInitialized) { return; }

			// create effects particles in cache
			var colors: number[] = [Color.BLUE_P, Color.BLACK, Color.BROWN,
			Color.GOLD, Color.RED, Color.SILVER, Color.TAN, Color.WHITE,
			Color.YELLOW];
			for (var color of colors) {
				var rColor: number = 0xff & (color >> 16),
					gColor: number = 0xff & (color >> 8),
					bColor: number = 0xff & (color);
				var bmd: Phaser.BitmapData = Gm.ie.make.bitmapData(8, 8);
				bmd.fill(rColor, gColor, bColor);
				Gm.ie.cache.addBitmapData(Ks.particle + color, bmd);
			}
		}

		private static createEffect(type: string, def: {
			x: number; y: number;
			colors?: number[]; gravity?: I_xy; // burst
			text?: string; colorStroke?: number; colorsAdd?: K2Number; // text
		}): void {
			switch (type) {
				case Ks.burst:
					new FxBurst(def.x, def.y, def.colors, def.gravity);
					break;
				case Ks.ending:
					new FxEnding(def.x, def.y);
					break;
				case Ks.text:
					new FxText(def.x, def.y, def.text,
						def.colorStroke, def.colorsAdd);
					break;
			}
		}
	}
	class FxBurst implements I_destructor {
		private emitter: PEmitter;

		constructor(x: number, y: number, colors: number[], gravity?: I_xy) {
			var keysParticles: string[] = [];
			for (var color of colors) {
				keysParticles.push(Ks.particle + color);
			}
			var emitter = this.emitter = Gm.ie.add.emitter(x, y, 100);
			emitter.particleClass = ParticleSqBD;
			emitter.makeParticles(keysParticles);
			if (gravity) {
				for (var k in gravity) {
					emitter.gravity[k] = gravity[k];
				}
			}
			emitter.start(true, 4000, null, 8 * keysParticles.length);
			Stage.groupEffects.add(emitter);
			Stage.groupEffects.sendToBack(emitter);

			// tween emitter alpha to 0
			var tween: Phaser.Tween = Gm.ie.add.tween(emitter);
			var propertiesTween: K2V = { alpha: 0 };
			tween.to(propertiesTween, 2000, Phaser.Easing.Quadratic.In);
			tween.start();
			tween.onComplete.addOnce(this.destructor, this);
		}
		destructor(): void {
			this.emitter.destroy();
		}
	}
	class FxEnding implements I_destructor {
		constructor(x: number, y: number) {
			var game: Gm = Gm.ie;
			var g: Graphic = game.add.graphics(x, y);
			g.beginFill(Score.colorFromScore());
			g.drawCircle(0, 0, -Gm.Y_TOP);

			// tween to expand and fill screen
			var tween: Phaser.Tween = game.add.tween(g.scale);
			var propertiesTween: K2V = { x: 16, y: 16 };
			tween.to(propertiesTween, 1000, Phaser.Easing.Quadratic.Out);
			tween.start();
			tween.onComplete.addOnce(this.destructor, this);

			game.camera.shake((Score.ITier + 1) * 0.01, 1000);

			game.onSound.dispatch(Ks.ending);
		}
		destructor(): void {
			Gm.ie.onEnding.dispatch();
		}
	}
	class FxText implements I_destructor {
		private text: Phaser.Text;

		constructor(x: number, y: number, vText: string,
			colorStroke: number, colorsAdd?: K2Number
		) {
			var text: Phaser.Text = this.text
				= Gm.ie.add.text(x, y, vText, TextStyle.MAJOR);
			text.anchor.setTo(0.5, 0.5);
			text.stroke = Color.toStringHex(colorStroke);
			text.strokeThickness = 4;

			if (colorsAdd) {
				for (var i in colorsAdd) {
					text.addColor(Color.toStringHex(colorsAdd[i]), <any>i);
				}
			}

			// if game is in playing state, add to designated layer
			if (Gm.ie.state.getCurrentState() instanceof GmStatePlay) {
				Stage.groupEffects.add(text);
				Stage.groupEffects.sendToBack(text);
			}

			// tween the text
			var propertiesTween: K2V = { alpha: 0, y: y - 100 };
			var tween: Phaser.Tween = Gm.ie.add.tween(text);
			tween.to(propertiesTween, 1000, Phaser.Easing.Quadratic.In);
			tween.start();
			tween.onComplete.addOnce(this.destructor, this);
		}
		destructor(): void {
			this.text.destroy();
		}
	}


	/**
	 * global sound effects
	 */
	export class SFx {
		static get isOn(): boolean { return !Gm.ie.sound.mute; }
		static set isOn(v: boolean) { Gm.ie.sound.mute = !v; }
		private static sounds: Phaser.AudioSprite;

		static createSounds(): void {
			var game: Gm = Gm.ie;
			game.onSound.add(this.play, this);
			this.sounds = game.add.audioSprite(Ks.sfx);
		}

		private static play(k: string): void {
			this.sounds.play(k);
		}
	}
}
