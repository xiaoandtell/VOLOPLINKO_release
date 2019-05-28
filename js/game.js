/**
 * BEFORE OBSERVING OR ACQUIRING SOURCE CODE,
 * YOU MUST FULLY READ, UNDERSTAND, AND AGREE TO COMPLY STRICTLY
 * WITH LICENSE.txt, AND SEND YOUR AGREEMENT TO XJ.
 * https://github.com/xiaoandtell/VOLOPLINKO_release/blob/master/LICENSE.txt
 */

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var XG;
(function (XG) {
    var Main = /** @class */ (function () {
        function Main() {
            this.constructArrow();
            this.constructCharacter();
            this.constructControlHandlers();
            var k = this.k = XG.Ks.player;
            XG.Gm.ie.state.getCurrentState().updates[k] = this;
        }
        Main.prototype.constructArrow = function () {
            var g = XG.Gm.ie.add.graphics(0, 0, XG.Stage.groupActors);
            g.lineStyle(4, XG.Color.BLUE_P);
            g.moveTo(-16, 20);
            g.lineTo(0, 8);
            g.lineTo(16, 20);
            this.graphicArrowOffscreen = g;
        };
        Main.prototype.constructCharacter = function () {
            var x = XG.Gm.ie.hwidth, y = XG.Stage.Y_MAIN;
            this.constructMan(x, y);
            this.constructHammer(x, y);
            // connect hammer to man
            XG.Gm.b2d.revoluteJoint(this.graphicMan.body, this.graphicHammer.body, 0, 32, 0, 0);
        };
        Main.prototype.constructHammer = function (x, y) {
            var g = XG.Gm.ie.add.graphics(x, y, XG.Stage.groupActors);
            // draw handle
            var wHandle = 4, hHandle = 124;
            g.beginFill(XG.Color.BROWN);
            g.drawRect(-wHandle / 2, -hHandle, wHandle, hHandle);
            XG.Gm.b2d.enable(g);
            var bodyG = g.body;
            bodyG.clearFixtures();
            // body fixture of handle
            var fHandle = bodyG.addRectangle(wHandle, hHandle, 0, -hHandle / 2);
            fHandle.SetUserData(this);
            // draw head
            g.beginFill(XG.Color.SILVER);
            g.lineStyle(2, XG.Color.WHITE);
            var wHead = 96, hHead = 48;
            g.drawRect(-wHead / 2, -(hHandle + hHead), wHead, hHead);
            // body fixture of head
            var fHead = bodyG.addRectangle(wHead, hHead, 0, -(hHandle + hHead / 2));
            fHead.SetUserData(this);
            bodyG.bullet = true;
            bodyG.setCollisionCategory(XG.Collision.HAMMER);
            bodyG.setCollisionMask(XG.Collision.BOUNDARY | XG.Collision.BALL);
            fHead.GetFilterData().categoryBits = XG.Collision.HEAD_HAMMER;
            // counterweight to head body,
            // prevents torque from shifting character body in swing
            var fCounterweight = bodyG.addRectangle(wHead, hHead, 0, hHandle + hHead / 2);
            fCounterweight.GetFilterData().categoryBits = XG.Collision.NONE;
            fCounterweight.GetFilterData().maskBits = XG.Collision.NONE;
            this.graphicHammer = g;
        };
        Main.prototype.constructMan = function (x, y) {
            var width = Main.width, hwidth = width / 2;
            var height = Main.height, hheight = height / 2;
            var g = XG.Gm.ie.add.graphics(x, y, XG.Stage.groupActors);
            // draw base (perimeter)
            g.beginFill(XG.Color.BLUE_P);
            g.drawRect(-hwidth, -hheight, width, height);
            // create box2d body on base
            XG.Gm.b2d.enable(g);
            var bodyG = g.body;
            bodyG.clearFixtures();
            bodyG.addRectangle(width, hheight, 0, hheight / 2);
            var fHead = bodyG.addRectangle(width, hheight, 0, -hheight / 2);
            bodyG.fixedRotation = true;
            bodyG.mass *= 64;
            bodyG.setCollisionCategory(XG.Collision.MAIN);
            bodyG.setCollisionMask(XG.Collision.BOUNDARY | XG.Collision.BALL);
            fHead.GetFilterData().categoryBits = XG.Collision.HEAD_MAIN;
            // draw hands
            g.beginFill(XG.Color.GOLD);
            g.lineStyle(0);
            g.drawCircle(-4, 32, 16);
            g.drawCircle(4, 32, 16);
            // draw hat
            g.beginFill(XG.Color.RED);
            g.drawCircle(0, -hheight, 16);
            // draw head
            g.beginFill(XG.Color.GOLD);
            g.drawRect(-hwidth, -hheight, width, hheight);
            // draw ears
            g.drawCircle(-32, -32, 16);
            g.drawCircle(32, -32, 16);
            // draw mouth
            g.beginFill(XG.Color.RED);
            g.drawRect(-16, -32, 32, 4);
            // draw googly eyes
            var xOffsetEye = 16, yOffsetEye = -56;
            for (var _i = 0, _a = [-1, 1]; _i < _a.length; _i++) {
                var signEye = _a[_i];
                // whites of eyes
                g.beginFill(XG.Color.WHITE);
                g.drawCircle(signEye * xOffsetEye, yOffsetEye, 16);
                // pupils of eyes
                var gPupl = XG.Gm.ie.add.graphics(x, y, XG.Stage.groupActors);
                gPupl.beginFill(XG.Color.BLACK);
                gPupl.drawCircle(0, 0, 12);
                XG.Gm.b2d.enable(gPupl);
                var bodyGPupl = gPupl.body;
                bodyGPupl.clearFixtures();
                bodyGPupl.addCircle(6, 0, 0);
                bodyGPupl.setCollisionCategory(XG.Collision.NONE);
                bodyGPupl.setCollisionMask(XG.Collision.NONE);
                XG.Gm.b2d.ropeJoint(bodyG, bodyGPupl, 2, signEye * xOffsetEye, yOffsetEye, 0, 0);
            }
            this.graphicMan = g;
        };
        Main.prototype.constructControlHandlers = function () {
            XG.Gm.ie.onControl.add(this.handleControl, this);
            this.stateHammer = this.stateMan = null;
        };
        Main.prototype.handleControl = function (type, def) {
            switch (type) {
                case XG.Ks.mainHammer:
                    this.handleControlHammer(def);
                    break;
                case XG.Ks.mainMove:
                    this.handleControlMove(def);
                    break;
                case XG.Ks.mainSlow:
                    this.handleControlSlow(def);
                    break;
            }
        };
        Main.prototype.handleControlHammer = function (def) {
            var bodyH = this.graphicHammer.body;
            var state = this.stateHammer = def.state;
            var isSwingL = state == XG.Ks.left, isSwingR = state == XG.Ks.right;
            if (isSwingL || isSwingR) {
                var velRotationH = bodyH.data.GetAngularVelocity();
                velRotationH = bodyH.world.mpx(velRotationH);
                if (isSwingL) {
                    velRotationH = Math.min(-1000, velRotationH - 1000);
                }
                else {
                    velRotationH = Math.max(1000, velRotationH + 1000);
                }
                bodyH.rotateRight(velRotationH);
                bodyH.velocity.y = Math.max(1000, bodyH.velocity.y);
                var velBodyMan = this.graphicMan.body.velocity;
                velBodyMan.y = Math.max(1000, velBodyMan.y + 1000);
                XG.Gm.ie.onSound.dispatch(XG.Ks.hammerSwing);
            }
            else { // swing hammer back across center
                // first bound rotation between -pi and pi
                var pi_x2 = box2d.b2_two_pi;
                var rotation = bodyH.rotation % pi_x2;
                if (Math.abs(rotation) > box2d.b2_pi) {
                    rotation += (rotation < 0) ? pi_x2 : -pi_x2;
                }
                // swing hammer
                state = (rotation > 0) ? XG.Ks.left : XG.Ks.right;
                this.handleControlHammer({ state: state });
            }
        };
        Main.prototype.handleControlMove = function (def) {
            var state = def.state;
            if (def.isActive) {
                this.stateMan = state;
            }
            else if (!def.isActive && this.stateMan === state) {
                this.graphicHammer.body.velocity.x = 0;
                this.graphicMan.body.velocity.x = 0;
                this.stateMan = null;
            }
        };
        Main.prototype.handleControlSlow = function (def) {
            this.isSlow = def.isActive;
        };
        Main.prototype.handleBeginContact = function (fixtureThis, fixtureThat) {
            // play collision sounds when hammer hits
            var cbThis = fixtureThis.GetFilterData().categoryBits;
            if (cbThis != XG.Collision.HAMMER && cbThis != XG.Collision.HEAD_HAMMER) {
                return;
            }
            var cbThat = fixtureThat.GetFilterData().categoryBits;
            if (cbThat == XG.Collision.BOUNDARY) {
                XG.Gm.ie.onSound.dispatch(XG.Ks.hammerThud);
            }
            else if (cbThat == XG.Collision.BALL) {
                XG.Gm.ie.onSound.dispatch((cbThis == XG.Collision.HEAD_HAMMER)
                    // differentiate proper hammer hit from handle hit
                    ? XG.Ks.hammerHit
                    : XG.Ks.hammerThud);
            }
        };
        Main.prototype.update = function () {
            this.updateArrow();
            this.updateMan();
        };
        Main.prototype.updateArrow = function () {
            var minY = -Main.height / 2;
            var gArrow = this.graphicArrowOffscreen, gMan = this.graphicMan;
            if (gMan.y < minY) {
                // man is up offscreen
                gArrow.scale.x = Math.min(1, 500 / (minY - gMan.y));
                gArrow.x = gMan.x;
                gArrow.y = 0;
            }
            else {
                gArrow.y = -100;
            }
        };
        /** deprecated: raise hammer */
        // private updateHammer(): void {
        // 	if (this.stateHammer === Ks.top) {
        // 		// raise hammer above head
        // 		var bodyH: PBBody = this.graphicHammer.body;
        // 		var velRotation: number = -400 * bodyH.rotation;
        // 		bodyH.rotateRight(velRotation);
        // 	}
        // }
        Main.prototype.updateMan = function () {
            switch (this.stateMan) {
                case XG.Ks.left:
                    var velocity = -this.updateMan_getSpeed();
                    this.graphicHammer.body.velocity.x = velocity;
                    this.graphicMan.body.velocity.x = velocity;
                    break;
                case XG.Ks.right:
                    var velocity = this.updateMan_getSpeed();
                    this.graphicHammer.body.velocity.x = velocity;
                    this.graphicMan.body.velocity.x = velocity;
                    break;
            }
        };
        Main.prototype.updateMan_getSpeed = function () {
            if (this.isSlow) {
                return 125;
            }
            // slowly increment speed as speed rises
            // to compensate for increasing spawn rates
            // using scaled sigmoid function,
            // value is 500 at 0, 1000 is limit
            return XG.GmMath.sigmoid(XG.Score.Value, 1000, 1000);
        };
        Object.defineProperty(Main.prototype, "y", {
            /** y of bottom of character */
            get: function () {
                return this.graphicMan.y + Main.height / 2;
            },
            enumerable: true,
            configurable: true
        });
        Main.width = 64;
        Main.height = 128;
        return Main;
    }());
    XG.Main = Main;
    var Ball = /** @class */ (function () {
        function Ball(x, y) {
            this.bonuses = {};
            this.isFinished = false;
            this.constructGraphic(x, y);
            this.graphicsBonuses = {};
            var k = this.constructK();
            XG.Gm.ie.state.getCurrentState().updates[k] = this;
        }
        Object.defineProperty(Ball.prototype, "colors", {
            get: function () {
                var result = this.colorsBase;
                var bonuses = this.bonuses;
                for (var k in bonuses) {
                    var colorBonus = XG.Bonus.Bonus2Color[bonuses[k]];
                    result.push(colorBonus, colorBonus);
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ball.prototype, "x", {
            get: function () { return this.graphic.body.x; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ball.prototype, "y", {
            get: function () { return this.graphic.body.y; },
            enumerable: true,
            configurable: true
        });
        Ball.prototype.destructor = function () {
            var k = this.k;
            delete XG.Gm.ie.state.getCurrentState().updates[k];
            this.graphic.destroy();
        };
        Ball.prototype.handleBeginContact = function (fixtureThis, fixtureThat) {
            var g = this.graphic;
            switch (fixtureThat.GetFilterData().categoryBits) {
                case XG.Collision.HEAD_HAMMER:
                    var man = fixtureThat.GetUserData(), yMan = man.y;
                    var yThreshold = XG.Stage.Y_MACHINE;
                    if (g.y > yThreshold + Vole.diameter / 2) {
                        // deep smash: hammer vole below threshold
                        this.setBonus(XG.Ks.hammer, XG.Bonus.DEEP);
                    }
                    else if (yMan < yThreshold - XG.Machine.HEIGHT_THRESHOLD) {
                        // high smash: hammer vole while man is in the air
                        this.setBonus(XG.Ks.hammer, XG.Bonus.HIGH);
                    }
                    g.body.gravityScale = 1;
                    break;
                case XG.Collision.HAMMER:
                case XG.Collision.MAIN:
                case XG.Collision.HEAD_MAIN:
                    g.body.gravityScale = 1;
                    XG.Gm.ie.onSound.dispatch(XG.Ks.ballThud);
                    break;
                case XG.Collision.BALL:
                    var ballThat = fixtureThat.GetUserData();
                    var bodyMoleThat = ballThat.graphic.body;
                    // only get knocked down by falling voles
                    if (bodyMoleThat.velocity.y <= 0) {
                        break;
                    }
                    g.body.gravityScale = 1;
                    // chain bonuses from and to contacted vole
                    this.setBonusesFrom(ballThat);
                    ballThat.setBonusesFrom(this);
                    break;
                case XG.Collision.SLOT:
                    // don't play sound
                    break;
                default:
                    XG.Gm.ie.onSound.dispatch(XG.Ks.ballThud);
                    break;
            }
        };
        Ball.prototype.finish = function (type) {
            this.isFinished = true;
            switch (type) {
                case XG.Ks.score:
                    // text effect showing bonuses
                    var bonuses = this.bonuses;
                    var strBonuses = '', colors = {};
                    var iColor = 0;
                    for (var k in bonuses) {
                        var bonus = bonuses[k];
                        strBonuses += XG.Bonus.Bonus2Text[bonus];
                        strBonuses += ' x' + bonus + '\n';
                        colors[iColor] = XG.Bonus.Bonus2Color[bonus];
                        iColor = strBonuses.length;
                    }
                    XG.Gm.ie.onEffect.dispatch(XG.Ks.text, {
                        x: this.x, y: this.y, text: strBonuses,
                        colorStroke: XG.Color.WHITE, colorsAdd: colors
                    });
                    // colored explosion effect from scoring
                    if (this.y > XG.Gm.Y_BOTTOM) {
                        // if fell through bottom slots, spray up
                        var gravity = { x: 0, y: -200 };
                    }
                    XG.Gm.ie.onEffect.dispatch(XG.Ks.burst, {
                        x: this.x, y: this.y,
                        colors: this.colors, gravity: gravity
                    });
                    XG.Gm.ie.onScore.dispatch(this.getScore());
                    break;
                case XG.Ks.sides:
                    // white dust explosion effect from out of bounds
                    var gravity = {
                        x: (this.x < 0) ? 100 : -100,
                        y: 0
                    };
                    XG.Gm.ie.onEffect.dispatch(XG.Ks.burst, {
                        x: this.x, y: this.y,
                        colors: [XG.Color.WHITE], gravity: gravity
                    });
                    XG.Gm.ie.onSound.dispatch(XG.Ks.ballOut);
                    break;
                case XG.Ks.stop:
                    // lose game effect
                    XG.Gm.ie.onEffect.dispatch(XG.Ks.ending, { x: this.x, y: this.y });
                    break;
            }
        };
        Ball.prototype.getScore = function () {
            var result = this.valueBase;
            var bonuses = this.bonuses;
            for (var k in bonuses) {
                result *= bonuses[k];
            }
            return result;
        };
        Ball.prototype.setBonus = function (type, value, isChained) {
            // bonus multipliers have values greater than 1
            if (value <= 1) {
                return;
            }
            var bonuses = this.bonuses;
            // do not overwrite existing bonus type with a lower value, for fun
            if (bonuses[type] && bonuses[type] >= value) {
                return;
            }
            var gsBonuses = this.graphicsBonuses;
            // clear existing bonus effects
            if (gsBonuses[type] && gsBonuses[type] != this.graphic) {
                gsBonuses[type].destroy();
            }
            //// draw bonus effect on graphic
            var colorBonus = XG.Bonus.Bonus2Color[value] || XG.Color.WHITE;
            var distanceBonus = XG.Bonus.Type2OffsetRadius[type] || 0;
            var g = this.graphic;
            g.beginFill(XG.Color.BLACK, 0);
            g.lineStyle(XG.Bonus.WIDTH_HALO, colorBonus);
            var dCircleBonus = this.diameter + 2 * distanceBonus;
            gsBonuses[type] = g.drawCircle(0, 0, dCircleBonus);
            var strBonus = XG.Bonus.Bonus2Text[value];
            if (isChained) {
                strBonus = 'CHAINED: ' + strBonus;
            }
            XG.Gm.ie.onEffect.dispatch(XG.Ks.text, {
                x: this.x, y: this.y, text: strBonus,
                colorStroke: XG.Bonus.Bonus2Color[value]
            });
            // set bonus
            bonuses[type] = value;
            // play bonus sound
            switch (value) {
                case XG.Bonus.SILVER:
                    XG.Gm.ie.onSound.dispatch(XG.Ks.bonusSilver);
                    break;
                case XG.Bonus.GOLD:
                    XG.Gm.ie.onSound.dispatch(XG.Ks.bonusGold);
                    break;
                case XG.Bonus.DEEP:
                    XG.Gm.ie.onSound.dispatch(XG.Ks.bonusDeep);
                    break;
                case XG.Bonus.HIGH:
                    XG.Gm.ie.onSound.dispatch(XG.Ks.bonusHigh);
                    break;
            }
        };
        Ball.prototype.setBonusesFrom = function (a) {
            var bonusesThis = this.bonuses, bonusesThat = a.bonuses;
            for (var type in bonusesThat) {
                var bonus = bonusesThat[type];
                if (!bonusesThis[type] || bonus > bonusesThis[type]) {
                    this.setBonus(type, bonus, true);
                }
            }
        };
        Ball.prototype.update = function () {
            this.updateCheckOutOfBounds();
            this.updateCheckFinished();
        };
        Ball.prototype.updateCheckOutOfBounds = function () {
            var game = XG.Gm.ie;
            var bodyG = this.graphic.body;
            if (bodyG.y > XG.Gm.Y_BOTTOM) {
                this.finish(XG.Ks.score);
            }
            else if (bodyG.x < 0 || bodyG.x > game.width) {
                this.finish(XG.Ks.sides);
            }
            else if (bodyG.y < XG.Gm.Y_TOP) {
                this.finish(XG.Ks.stop);
            }
        };
        Ball.prototype.updateCheckFinished = function () {
            if (this.isFinished) {
                this.destructor();
            }
        };
        return Ball;
    }());
    XG.Ball = Ball;
    var Vole = /** @class */ (function (_super) {
        __extends(Vole, _super);
        function Vole() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(Vole.prototype, "colorsBase", {
            get: function () {
                return [XG.Color.TAN, XG.Color.BLACK, XG.Color.YELLOW];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vole.prototype, "valueBase", {
            get: function () { return Vole.VALUE; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vole.prototype, "diameter", {
            get: function () { return 64; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vole.prototype, "type", {
            get: function () { return XG.Ks.vole; },
            enumerable: true,
            configurable: true
        });
        Vole.prototype.constructK = function () {
            var result = this.k = this.type + Vole.countGlobal++;
            return result;
        };
        Vole.prototype.constructGraphic = function (x, y) {
            var g = this.graphic = XG.Gm.ie.add.graphics(x, y);
            // draw head
            g.beginFill(XG.Color.TAN);
            g.drawCircle(0, 0, Vole.diameter);
            // draw eyes
            g.beginFill(XG.Color.BLACK);
            g.drawCircle(-16, -16, 4);
            g.drawCircle(16, -16, 4);
            // draw nose
            g.drawCircle(0, -4, 8);
            // draw teeth
            g.beginFill(XG.Color.YELLOW);
            g.drawRect(-4, 2, 3, 10);
            g.drawRect(0, 2, 3, 11);
            //
            XG.Gm.b2d.enable(this.graphic);
            var bodyG = this.graphic.body;
            bodyG.clearFixtures();
            bodyG.static = true;
            // set body on pop out
            var tweenOut = XG.Gm.ie.add.tween(g.scale);
            tweenOut.from({ x: 0, y: 0 }, 1000, Phaser.Easing.Quadratic.In);
            tweenOut.start();
            tweenOut.onComplete.addOnce(this.enableGraphicBody, this);
            XG.Stage.groupActors.add(g);
            XG.Stage.groupActors.sendToBack(g);
        };
        Vole.prototype.enableGraphicBody = function () {
            var bodyG = this.graphic.body;
            var fG = bodyG.addCircle(32, 0, 0);
            fG.SetUserData(this);
            bodyG.bullet = true;
            bodyG.gravityScale = -1;
            bodyG.static = false;
            bodyG.setCollisionCategory(XG.Collision.BALL);
            bodyG.setCollisionMask(XG.Collision.BALL | XG.Collision.BOUNDARY
                | XG.Collision.HAMMER | XG.Collision.MAIN | XG.Collision.SLOT);
            bodyG.velocity.x = 500 * (Math.random() - Math.random());
            bodyG.velocity.y = 500 * (Math.random() - Math.random());
        };
        Vole.countGlobal = 0;
        Vole.diameter = 64;
        Vole.VALUE = 1;
        return Vole;
    }(Ball));
    XG.Vole = Vole;
    var Slider = /** @class */ (function (_super) {
        __extends(Slider, _super);
        function Slider() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(Slider.prototype, "colorsBase", {
            get: function () {
                return [XG.Color.GOLD, XG.Color.RED, XG.Color.YELLOW, XG.Color.BROWN];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slider.prototype, "type", {
            get: function () { return XG.Ks.slider; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slider.prototype, "valueBase", {
            get: function () { return Slider.VALUE; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slider.prototype, "diameter", {
            get: function () { return 32; },
            enumerable: true,
            configurable: true
        });
        Slider.prototype.constructK = function () {
            var result = this.k = this.type + Slider.countGlobal++;
            return result;
        };
        Slider.prototype.constructGraphic = function (x, y) {
            var diameter = this.diameter, radius = diameter / 2;
            var bevel = radius / 2;
            var g = this.graphic = XG.Gm.ie.add.graphics(x, y);
            // buns
            g.beginFill(XG.Color.GOLD);
            g.drawCircle(0, 0, diameter);
            g.drawRoundedRect(-radius, 0, diameter, radius, bevel);
            // beef
            g.beginFill(XG.Color.BROWN);
            g.drawRoundedRect(-radius - 4, 2, diameter + 8, 8, 4);
            // cheese
            g.beginFill(XG.Color.YELLOW);
            g.drawPolygon({ x: radius, y: 2 }, { x: -radius + 2, y: 2 }, { x: -4, y: 8 });
            // tomato
            g.beginFill(XG.Color.RED);
            g.drawRect(-radius - 1, -2, diameter + 2, 4);
            XG.Gm.b2d.enable(g);
            var body = g.body;
            body.clearFixtures();
            var f = body.addCircle(radius, 0, 0);
            f.SetUserData(this);
            body.bullet = true;
            body.gravityScale = 0;
            body.setCollisionCategory(XG.Collision.BALL);
            body.setCollisionMask(XG.Collision.BALL | XG.Collision.BOUNDARY
                | XG.Collision.HAMMER | XG.Collision.MAIN | XG.Collision.SLOT);
            body.velocity.x = 300;
            XG.Stage.groupActors.add(g);
            XG.Stage.groupActors.sendToBack(g);
        };
        Slider.prototype.handleBeginContact = function (fixtureThis, fixtureThat) {
            if (fixtureThat.GetFilterData().categoryBits == XG.Collision.HEAD_MAIN) {
                XG.Gm.ie.onEffect.dispatch(XG.Ks.text, {
                    x: this.x, y: this.y, text: 'CHOMP',
                    colorStroke: XG.Color.GOLD
                });
                XG.Gm.ie.onSound.dispatch(XG.Ks.chomp);
                this.finish(XG.Ks.score);
            }
            else {
                _super.prototype.handleBeginContact.call(this, fixtureThis, fixtureThat);
            }
        };
        Slider.countGlobal = 0;
        Slider.VALUE = 69;
        return Slider;
    }(Ball));
    XG.Slider = Slider;
})(XG || (XG = {}));
var XG;
(function (XG) {
    var DetectDevice = /** @class */ (function () {
        function DetectDevice() {
        }
        /**
         * functions from
         * https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
         */
        DetectDevice.mobilecheck = function () {
            var check = false;
            (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
                check = true; })(navigator.userAgent || navigator.vendor || window['opera']);
            return check;
        };
        DetectDevice.mobileAndTabletcheck = function () {
            var check = false;
            (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
                check = true; })(navigator.userAgent || navigator.vendor || window['opera']);
            return check;
        };
        return DetectDevice;
    }());
    XG.DetectDevice = DetectDevice;
})(XG || (XG = {}));
var XG;
(function (XG) {
    var Fx = /** @class */ (function () {
        function Fx() {
        }
        Fx.create = function () {
            // create effects when effects event is dispatched
            XG.Gm.ie.onEffect.add(this.createEffect, this);
            if (this.isInitialized) {
                return;
            }
            // create effects particles in cache
            var colors = [XG.Color.BLUE_P, XG.Color.BLACK, XG.Color.BROWN,
                XG.Color.GOLD, XG.Color.RED, XG.Color.SILVER, XG.Color.TAN, XG.Color.WHITE,
                XG.Color.YELLOW];
            for (var _i = 0, colors_1 = colors; _i < colors_1.length; _i++) {
                var color = colors_1[_i];
                var rColor = 0xff & (color >> 16), gColor = 0xff & (color >> 8), bColor = 0xff & (color);
                var bmd = XG.Gm.ie.make.bitmapData(8, 8);
                bmd.fill(rColor, gColor, bColor);
                XG.Gm.ie.cache.addBitmapData(XG.Ks.particle + color, bmd);
            }
        };
        Fx.createEffect = function (type, def) {
            switch (type) {
                case XG.Ks.burst:
                    new FxBurst(def.x, def.y, def.colors, def.gravity);
                    break;
                case XG.Ks.ending:
                    new FxEnding(def.x, def.y);
                    break;
                case XG.Ks.text:
                    new FxText(def.x, def.y, def.text, def.colorStroke, def.colorsAdd);
                    break;
            }
        };
        return Fx;
    }());
    XG.Fx = Fx;
    var FxBurst = /** @class */ (function () {
        function FxBurst(x, y, colors, gravity) {
            var keysParticles = [];
            for (var _i = 0, colors_2 = colors; _i < colors_2.length; _i++) {
                var color = colors_2[_i];
                keysParticles.push(XG.Ks.particle + color);
            }
            var emitter = this.emitter = XG.Gm.ie.add.emitter(x, y, 100);
            emitter.particleClass = XG.ParticleSqBD;
            emitter.makeParticles(keysParticles);
            if (gravity) {
                for (var k in gravity) {
                    emitter.gravity[k] = gravity[k];
                }
            }
            emitter.start(true, 4000, null, 8 * keysParticles.length);
            XG.Stage.groupEffects.add(emitter);
            XG.Stage.groupEffects.sendToBack(emitter);
            // tween emitter alpha to 0
            var tween = XG.Gm.ie.add.tween(emitter);
            var propertiesTween = { alpha: 0 };
            tween.to(propertiesTween, 2000, Phaser.Easing.Quadratic.In);
            tween.start();
            tween.onComplete.addOnce(this.destructor, this);
        }
        FxBurst.prototype.destructor = function () {
            this.emitter.destroy();
        };
        return FxBurst;
    }());
    var FxEnding = /** @class */ (function () {
        function FxEnding(x, y) {
            var game = XG.Gm.ie;
            var g = game.add.graphics(x, y);
            g.beginFill(XG.Score.colorFromScore());
            g.drawCircle(0, 0, -XG.Gm.Y_TOP);
            // tween to expand and fill screen
            var tween = game.add.tween(g.scale);
            var propertiesTween = { x: 16, y: 16 };
            tween.to(propertiesTween, 1000, Phaser.Easing.Quadratic.Out);
            tween.start();
            tween.onComplete.addOnce(this.destructor, this);
            game.camera.shake((XG.Score.ITier + 1) * 0.01, 1000);
            game.onSound.dispatch(XG.Ks.ending);
        }
        FxEnding.prototype.destructor = function () {
            XG.Gm.ie.onEnding.dispatch();
        };
        return FxEnding;
    }());
    var FxText = /** @class */ (function () {
        function FxText(x, y, vText, colorStroke, colorsAdd) {
            var text = this.text
                = XG.Gm.ie.add.text(x, y, vText, XG.TextStyle.MAJOR);
            text.anchor.setTo(0.5, 0.5);
            text.stroke = XG.Color.toStringHex(colorStroke);
            text.strokeThickness = 4;
            if (colorsAdd) {
                for (var i in colorsAdd) {
                    text.addColor(XG.Color.toStringHex(colorsAdd[i]), i);
                }
            }
            // if game is in playing state, add to designated layer
            if (XG.Gm.ie.state.getCurrentState() instanceof XG.GmStatePlay) {
                XG.Stage.groupEffects.add(text);
                XG.Stage.groupEffects.sendToBack(text);
            }
            // tween the text
            var propertiesTween = { alpha: 0, y: y - 100 };
            var tween = XG.Gm.ie.add.tween(text);
            tween.to(propertiesTween, 1000, Phaser.Easing.Quadratic.In);
            tween.start();
            tween.onComplete.addOnce(this.destructor, this);
        }
        FxText.prototype.destructor = function () {
            this.text.destroy();
        };
        return FxText;
    }());
    /**
     * global sound effects
     */
    var SFx = /** @class */ (function () {
        function SFx() {
        }
        Object.defineProperty(SFx, "isOn", {
            get: function () { return !XG.Gm.ie.sound.mute; },
            set: function (v) { XG.Gm.ie.sound.mute = !v; },
            enumerable: true,
            configurable: true
        });
        SFx.createSounds = function () {
            var game = XG.Gm.ie;
            game.onSound.add(this.play, this);
            this.sounds = game.add.audioSprite(XG.Ks.sfx);
        };
        SFx.play = function (k) {
            this.sounds.play(k);
        };
        return SFx;
    }());
    XG.SFx = SFx;
})(XG || (XG = {}));
var XG;
(function (XG) {
    // **** game starting point ****
    window.onload = function () {
        var game = new Gm(1280, 720, Phaser.AUTO);
        game.state.add(Ks.play, GmStatePlay);
        game.state.add(Ks.stop, GmStateStop);
        game.state.start(Ks.stop);
    };
    var Gm = /** @class */ (function (_super) {
        __extends(Gm, _super);
        function Gm() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(Gm, "ie", {
            /** game instance */
            get: function () {
                return Phaser.GAMES[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Gm, "b2d", {
            /** game box2d instance */
            get: function () {
                return Gm.ie.physics.box2d;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Gm, "Y_BOTTOM", {
            get: function () { return Gm.ie.height + 16; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Gm.prototype, "hwidth", {
            get: function () { return this.width / 2; },
            enumerable: true,
            configurable: true
        });
        Gm.Y_TOP = -200;
        return Gm;
    }(Phaser.Game));
    XG.Gm = Gm;
    var GmContactListener = /** @class */ (function (_super) {
        __extends(GmContactListener, _super);
        function GmContactListener() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GmContactListener.prototype.BeginContact = function (contact) {
            this.contact(contact, Ks.handleBeginContact);
        };
        GmContactListener.prototype.EndContact = function (contact) {
            this.contact(contact, Ks.handleEndContact);
        };
        GmContactListener.prototype.contact = function (contact, kFunction) {
            var fA = contact.GetFixtureA(), eA = fA.GetUserData();
            var fB = contact.GetFixtureB(), eB = fB.GetUserData();
            if (eA && eA[kFunction]) {
                eA[kFunction](fA, fB);
            }
            if (eB && eB[kFunction]) {
                eB[kFunction](fB, fA);
            }
        };
        return GmContactListener;
    }(box2d.b2ContactListener));
    var GmControl = /** @class */ (function () {
        /** bind input to game control signals */
        function GmControl() {
            var KC = Phaser.KeyCode;
            var kb = Gm.ie.input.keyboard;
            // handle onDown, onUp
            for (var _i = 0, _a = [
                // main character control keys
                KC.Q, KC.W, KC.E,
                KC.A, KC.D, KC.SHIFT,
                // pins rows control keys
                KC.U, KC.I, KC.J, KC.K, KC.N, KC.M
            ]; _i < _a.length; _i++) {
                var keyCode = _a[_i];
                var key = kb.addKey(keyCode);
                key.onDown.add(this.handleKey, this);
                key.onUp.add(this.handleKey, this);
            }
        }
        GmControl.prototype.handleKey = function (e) {
            var KC = Phaser.KeyCode;
            var kc = e.keyCode;
            var onControl = Gm.ie.onControl;
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
                    var row = (kc == KC.U || kc == KC.I) ? 0
                        : (kc == KC.J || kc == KC.K) ? 1
                            : /*kc == Kb.N || kc == Kb.M*/ 2;
                    var state = (kc == KC.U || kc == KC.J || kc == KC.N)
                        ? Ks.left : Ks.right;
                    onControl.dispatch(Ks.pinsMove, {
                        isActive: e.isDown, row: row, state: state
                    });
                    break;
            }
        };
        return GmControl;
    }());
    XG.GmControl = GmControl;
    var GmPhysics = /** @class */ (function (_super) {
        __extends(GmPhysics, _super);
        function GmPhysics() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return GmPhysics;
    }(Phaser.Physics));
    var GmStatePlay = /** @class */ (function (_super) {
        __extends(GmStatePlay, _super);
        function GmStatePlay() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GmStatePlay.prototype.create = function () {
            this.game.onEnding.addOnce(this.endGame, this);
            this.createBox2D();
            this.createBoundariesWorld();
            this.createControlInput();
            this.createEntities();
        };
        GmStatePlay.prototype.createBoundariesWorld = function () {
            var game = this.game;
            // side boundaries for world
            var wBound = 100, hwBound = wBound / 2;
            var bBounds = new Phaser.Physics.Box2D.Body(game, null);
            bBounds.addRectangle(wBound, 100000, -hwBound);
            bBounds.addRectangle(wBound, 100000, game.width + hwBound);
            bBounds.static = true;
            bBounds.setCollisionCategory(Collision.BOUNDARY_WORLD);
            bBounds.setCollisionMask(Collision.MAIN);
        };
        GmStatePlay.prototype.createBox2D = function () {
            var physics = this.game.physics;
            physics.startSystem(Phaser.Physics.BOX2D);
            var b2d = physics.box2d;
            b2d.setPTMRatio(100);
            b2d.gravity.y = 200;
            b2d.world.SetContactListener(new GmContactListener());
        };
        GmStatePlay.prototype.createControlInput = function () {
            this.game.control = new GmControl();
        };
        GmStatePlay.prototype.createEntities = function () {
            this.updates = {};
            new XG.Stage();
            new XG.Main();
        };
        GmStatePlay.prototype.endGame = function () {
            // do not clear sounds from cache
            this.game.state.start(Ks.stop, true, false);
        };
        GmStatePlay.prototype.render = function () {
            //this.game.debug.box2dWorld();
        };
        GmStatePlay.prototype.update = function () {
            var updates = this.updates;
            for (var k in updates) {
                updates[k].update();
            }
        };
        return GmStatePlay;
    }(Phaser.State));
    XG.GmStatePlay = GmStatePlay;
    var GmStateStop = /** @class */ (function (_super) {
        __extends(GmStateStop, _super);
        function GmStateStop() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(GmStateStop.prototype, "isLoaded", {
            get: function () {
                return this.game.cache.getSound(Ks.sfx) != null;
            },
            enumerable: true,
            configurable: true
        });
        GmStateStop.prototype.init = function () {
            // strech-fit game on screen
            this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            this.initLoad();
        };
        GmStateStop.prototype.initLoad = function () {
            if (this.isLoaded) {
                return;
            }
            // display loading text
            var textLoad = this.game.add.text(0, 0, 'LOADING.', { fill: Color.toStringHex(Color.WHITE) });
            this.game.load.onLoadComplete.addOnce(textLoad.destroy, textLoad);
        };
        GmStateStop.prototype.preload = function () {
            if (this.isLoaded) {
                return;
            }
            var path = 'assets/audiosprite';
            // load .ogg for Firefox
            this.game.load.audiosprite(Ks.sfx, [path + '.mp3', path + '.ogg'], path + '.json');
        };
        GmStateStop.prototype.create = function () {
            this.createSignals();
            XG.Fx.create();
            XG.SFx.createSounds();
            this.createInputHandlerStart();
            this.createText();
        };
        GmStateStop.prototype.createSignals = function () {
            var game = this.game;
            game.onEffect = new Phaser.Signal();
            game.onEnding = new Phaser.Signal();
            game.onControl = new Phaser.Signal();
            game.onScore = new Phaser.Signal();
            game.onSound = new Phaser.Signal();
        };
        GmStateStop.prototype.createInputHandlerStart = function () {
            this.game.input.keyboard.addCallbacks(this, this.startGame);
            // disable right click dropdown, mouse wheel scroll
            var fnPreventDefaultInputEvent = function (event) {
                event.preventDefault();
            };
            window.oncontextmenu = fnPreventDefaultInputEvent;
            window.onmousewheel = fnPreventDefaultInputEvent;
        };
        GmStateStop.prototype.createText = function () {
            var game = this.game;
            var x = game.hwidth;
            // title
            var strTitle = '[ V O L O P L I N K O ]';
            var textTitle = game.add.text(x, 50, strTitle, TextStyle.MAJOR);
            textTitle.anchor.x = 0.5;
            // description
            var strDesc = "\n\t\t\t\t  [ CONTROLS ]\n\t\t\t\tW:  swing hammer\n\t\t\t\tQ,E:  swing hammer left, right\n\t\t\t\tA,D:  move left, right\n\t\t\t\tSHIFT:  move slower\n\t\t\t\tU,I, J,K, N,M:  move top, middle, bottom pins left, right\n\n\n\t\t\t\t  [ BASE VALUES ]\n\t\t\t\tVOLE:  " + XG.Vole.VALUE + "\n\t\t\t\tSLIDER:  " + XG.Slider.VALUE + "\n\n\t\t\t\t  [ BONUS MULTIPLIERS ]\n\t\t\t\t" + Bonus.sSILVER + ":  x" + Bonus.SILVER + "\n\t\t\t\t" + Bonus.sGOLD + ":  x" + Bonus.GOLD + "\n\t\t\t\t" + Bonus.sDEEP + ":  x" + Bonus.DEEP + "\n\t\t\t\t" + Bonus.sHIGH + ":  x" + Bonus.HIGH + "\n\n\n\n\t\t\t\t        tap here - or - press any key to play\n\t\t\t";
            var textDesc = game.add.text(x, 128, strDesc, TextStyle.MINOR);
            textDesc.anchor.x = 0.5;
            textDesc.inputEnabled = true;
            textDesc.events.onInputDown.add(this.startGame, this);
            // clickable text
            //
            // sound on/off text
            this.createTextBtn(game.height - 77, 'sound', XG.SFx, Color.SILVER);
            //
            // touch input on/off text
            this.createTextBtn(game.height - 55, 'touch', XG.Touch, Color.SILVER);
            //
            // donate text
            this.createTextBtn(game.height - 20, 'donate BTC', null, Color.GOLD, function (_text) {
                var strDonate = 'Bitcoin Address:  '
                    + '1E6YnvHJDhdYZp9JhjH7da51yJRzdtb6Ck\n\n'
                    + 'Thanks for your help.';
                alert(strDonate);
            });
            // score from last game
            var score = XG.Score.Value;
            if (score !== undefined) {
                var textScore = game.add.text(x, game.height / 2, 'SCORE:  ' + score, TextStyle.MAJOR);
                textScore.anchor.x = 0.5;
                // color of score text dependent on previous game's score
                var colorText = XG.Score.colorFromScore();
                textScore.addColor(Color.toStringHex(colorText), 0);
                var colorStroke = Color.GRAY_3;
                if (colorText == Color.TYRIAN) {
                    // after score surpasses highest color tier (21000),
                    // text stroke color becomes brighter shade of yellow
                    var brightness = (score - 21000) / 210;
                    brightness = Math.min(0xff, Math.floor(brightness));
                    colorStroke = Color.YELLOW + brightness;
                }
                textScore.stroke = Color.toStringHex(colorStroke);
                textScore.strokeThickness = 8;
                textScore.rotation = Math.PI * -0.125;
            }
        };
        GmStateStop.prototype.createTextBtn = function (y, strProperty, objProperty, color, functionOnDown) {
            var game = Gm.ie;
            var x = game.width - 30;
            var text = (objProperty != null)
                ? this.createTextBtnSetText(strProperty, objProperty.isOn)
                : strProperty;
            var result = game.add.text(x, y, text, TextStyle.MINOR);
            result.addColor(Color.toStringHex(color), 0);
            result.anchor.x = result.anchor.y = 1;
            result.boundsAlignH = Ks.right;
            result.boundsAlignV = Ks.bottom;
            result.inputEnabled = true;
            // bind click function
            functionOnDown = functionOnDown || this.createTextBtnSet;
            result.events.onInputDown.add(functionOnDown, this, 0, strProperty, objProperty);
            return result;
        };
        GmStateStop.prototype.createTextBtnSet = function (text, v, strProperty, objProperty) {
            var isOn = objProperty.isOn = !objProperty.isOn;
            var gm = Gm.ie;
            var strOn = strProperty.toUpperCase()
                + ((isOn) ? ' ON' : ' OFF');
            var colorOn = (isOn) ? Color.GOLD : Color.SILVER;
            // sound changed text effect
            gm.onEffect.dispatch(Ks.text, {
                x: gm.width / 2, y: gm.height / 2,
                text: strOn, colorStroke: colorOn
            });
            // sound will only play if sound is on
            gm.onSound.dispatch((isOn) ? Ks.bonusGold : Ks.bonusSilver);
            // change text of button
            text.text = this.createTextBtnSetText(strProperty, isOn);
        };
        GmStateStop.prototype.createTextBtnSetText = function (strProperty, isOn) {
            // text says: set to the opposite of current state
            return 'set ' + strProperty + ((isOn) ? ' off' : ' on');
        };
        GmStateStop.prototype.shutdown = function () {
            this.game.input.keyboard.removeCallbacks();
        };
        GmStateStop.prototype.startGame = function () {
            // do not clear sounds from cache
            this.game.state.start(Ks.play, true, false);
        };
        return GmStateStop;
    }(Phaser.State));
    XG.GmStateStop = GmStateStop;
    var Graphic = /** @class */ (function (_super) {
        __extends(Graphic, _super);
        function Graphic() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Graphic;
    }(Phaser.Graphics));
    XG.Graphic = Graphic;
    /** a square BitmapData */
    var ParticleSqBD = /** @class */ (function (_super) {
        __extends(ParticleSqBD, _super);
        function ParticleSqBD(game, x, y, key) {
            return _super.call(this, game, x, y, Gm.ie.cache.getBitmapData(key)) || this;
        }
        return ParticleSqBD;
    }(Phaser.Particle));
    XG.ParticleSqBD = ParticleSqBD;
    var GmH = /** @class */ (function () {
        function GmH() {
        }
        GmH.count = function (vs) {
            return Object.keys(vs).length;
        };
        /**
         * takes an implicitly even-length array and transforms it into a K2V Object
         * even-indexed elements become keys, odd-indexed elements become values
         */
        GmH.toK2VFromK0V1s = function () {
            var pairsK0V1 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                pairsK0V1[_i] = arguments[_i];
            }
            var result = {};
            for (var iKV = 0; iKV < pairsK0V1.length; iKV += 2) {
                var k = pairsK0V1[iKV], v = pairsK0V1[iKV + 1];
                result[k] = v;
            }
            return result;
        };
        return GmH;
    }());
    XG.GmH = GmH;
    var GmMath = /** @class */ (function () {
        function GmMath() {
        }
        GmMath.mod = function (n, m) {
            return ((n % m) + m) % m;
        };
        GmMath.sigmoid = function (x, scaleX, scaleY) {
            var ePowX = Math.pow(Math.E, x / scaleX);
            return scaleY * (ePowX / (ePowX + 1));
        };
        return GmMath;
    }());
    XG.GmMath = GmMath;
    var Collision = /** @class */ (function () {
        function Collision() {
        }
        Collision.NONE = 0x0000;
        Collision.BOUNDARY = 0x0001;
        Collision.HAMMER = 0x0002;
        Collision.MAIN = 0x0004;
        Collision.HEAD = 0x0008;
        Collision.HEAD_HAMMER = Collision.HAMMER | Collision.HEAD;
        Collision.HEAD_MAIN = Collision.MAIN | Collision.HEAD;
        Collision.BALL = 0x0010;
        Collision.SLOT = 0x0020;
        // want to prevent main character from leaving screen,
        // but play no sound when colliding hammer
        Collision.BOUNDARY_WORLD = 0x0040 | Collision.BOUNDARY;
        return Collision;
    }());
    XG.Collision = Collision;
    var Color = /** @class */ (function () {
        function Color() {
        }
        Color.toStringHex = function (c) {
            return '#' + c.toString(16).substring(0, 6);
        };
        Color.BLACK = 0x000000;
        Color.BLUE_P = 0x3366ff;
        Color.BROWN = 0x663300;
        Color.GOLD = 0xffcc33;
        Color.GRAY_3 = 0x333333;
        Color.RED = 0xff0000;
        Color.RED_N9 = 0x660000;
        Color.SILVER = 0x999999;
        Color.TAN = 0x996600;
        Color.TYRIAN = 0xcc0099;
        Color.YELLOW = 0xffff00;
        Color.WHITE = 0xffffff;
        return Color;
    }());
    XG.Color = Color;
    var TextStyle = /** @class */ (function () {
        function TextStyle() {
        }
        Object.defineProperty(TextStyle, "MAJOR", {
            get: function () {
                return {
                    align: Ks.center, fill: '#ffffff', font: '32px Arial'
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextStyle, "MINOR", {
            get: function () {
                return {
                    align: Ks.left, fill: '#ffffff', font: '16px Arial'
                };
            },
            enumerable: true,
            configurable: true
        });
        return TextStyle;
    }());
    XG.TextStyle = TextStyle;
    var Ks = /** @class */ (function () {
        function Ks() {
        }
        Ks.top = 'top';
        Ks.left = 'left';
        Ks.bottom = 'bottom';
        Ks.right = 'right';
        Ks.center = 'center';
        Ks.sides = 'sides';
        Ks.score = 'score';
        // states
        Ks.play = 'play';
        Ks.stop = 'stop';
        // classes
        Ks.hammer = 'hammer';
        Ks.machine = 'machine';
        Ks.particle = 'particle';
        Ks.player = 'player';
        // balls
        Ks.vole = 'vole';
        Ks.slider = 'slider';
        // functions
        Ks.handleBeginContact = 'handleBeginContact';
        Ks.handleEndContact = 'handleEndContact';
        // effects
        Ks.burst = 'burst';
        Ks.ending = 'ending';
        Ks.text = 'text';
        // control
        Ks.mainHammer = 'mainHammer';
        Ks.mainMove = 'mainMove';
        Ks.mainSlow = 'mainSlow';
        Ks.pinsMove = 'pinsMove';
        // sound effects
        Ks.ballOut = 'ballOut';
        Ks.ballThud = 'ballThud';
        Ks.bonusDeep = 'bonusDeep';
        Ks.bonusGold = 'bonusGold';
        Ks.bonusHigh = 'bonusHigh';
        Ks.bonusSilver = 'bonusSilver';
        Ks.chomp = 'chomp';
        //static readonly ending: string = 'ending';
        Ks.hammerHit = 'hammerHit';
        Ks.hammerSwing = 'hammerSwing';
        Ks.hammerThud = 'hammerThud';
        Ks.scoreLarge = 'scoreLarge';
        Ks.scoreMedium = 'scoreMedium';
        Ks.scoreSmall = 'scoreSmall';
        Ks.sfx = 'sfx';
        return Ks;
    }());
    XG.Ks = Ks;
    var Bonus = /** @class */ (function () {
        function Bonus() {
        }
        Bonus.SILVER = 2;
        Bonus.GOLD = 4;
        Bonus.DEEP = 6;
        Bonus.HIGH = 7;
        Bonus.sSILVER = 'SILVER';
        Bonus.sGOLD = 'GOLD';
        Bonus.sDEEP = 'DEEP SMASH';
        Bonus.sHIGH = 'HIGH SMASH';
        Bonus.Bonus2Color = GmH.toK2VFromK0V1s(Bonus.SILVER, Color.SILVER, Bonus.GOLD, Color.GOLD, Bonus.DEEP, Color.RED, Bonus.HIGH, Color.BLUE_P);
        Bonus.Bonus2Text = GmH.toK2VFromK0V1s(Bonus.SILVER, Bonus.sSILVER, Bonus.GOLD, Bonus.sGOLD, Bonus.DEEP, Bonus.sDEEP, Bonus.HIGH, Bonus.sHIGH);
        Bonus.WIDTH_HALO = 2;
        Bonus.Type2OffsetRadius = GmH.toK2VFromK0V1s(Ks.hammer, 6 * Bonus.WIDTH_HALO, Ks.top, 5 * Bonus.WIDTH_HALO, 'pins0', 4 * Bonus.WIDTH_HALO, 'pins1', 3 * Bonus.WIDTH_HALO, 'pins2', 2 * Bonus.WIDTH_HALO, Ks.bottom, Bonus.WIDTH_HALO);
        return Bonus;
    }());
    XG.Bonus = Bonus;
})(XG || (XG = {}));
var XG;
(function (XG) {
    /** contains all stage objects */
    var Stage = /** @class */ (function () {
        function Stage() {
            // score textfield is behind player
            this.score = new Score();
            // create groups from bottommost to topmost
            Stage.groupMachine = XG.Gm.ie.add.group();
            Stage.groupActors = XG.Gm.ie.add.group();
            Stage.groupEffects = XG.Gm.ie.add.group();
            Stage.groupInput = XG.Gm.ie.add.group();
            Stage.machine = new Machine();
            this.managerSpawnActors = new ManagerSpawnActors();
            this.managerUpdateSlots = new ManagerUpdateSlots();
            Touch.init();
        }
        Stage.Y_MAIN = 150;
        Stage.Y_MACHINE = 250;
        Stage.Y_SLIDER = 20;
        return Stage;
    }());
    XG.Stage = Stage;
    var Machine = /** @class */ (function () {
        function Machine() {
            this.radiusPin = 8;
            this.slotsRowsPins = [[], [], []];
            this.slotsRowsThreshold = [[], []];
            this.graphicsSpawnPts = [];
            this.graphicsFeatures = [];
            this.graphicsPins = [];
            this.statesPins = [null, null, null];
            this.constructControlHandlers();
            // construct this Machine
            this.constructThisBG();
            this.constructThisBorders();
            this.constructThisPins();
            this.constructThisSpawnPoints();
            var k = this.k = XG.Ks.machine;
            XG.Gm.ie.state.getCurrentState().updates[k] = this;
        }
        Object.defineProperty(Machine, "YS_PINS", {
            get: function () {
                var y0 = Stage.Y_MACHINE + 100;
                return [y0, y0 + 80, y0 + 160];
            },
            enumerable: true,
            configurable: true
        });
        Machine.prototype.constructControlHandlers = function () {
            XG.Gm.ie.onControl.add(this.handleControl, this);
        };
        //
        //
        //
        // construct this Machine:
        Machine.prototype.constructThis_feature = function (g, mask) {
            mask = mask || (XG.Collision.BALL | XG.Collision.BOUNDARY);
            XG.Gm.b2d.enable(g);
            var bodyG = g.body;
            bodyG.static = true;
            bodyG.setCollisionCategory(XG.Collision.BOUNDARY);
            bodyG.setCollisionMask(mask);
            XG.Gm.ie.add.existing(g);
            Stage.groupActors.add(g);
            this.graphicsFeatures.push(g);
        };
        //
        Machine.prototype.constructThisBG = function () {
            var game = XG.Gm.ie, wGame = game.width, hwGame = wGame / 2, hGame = game.height;
            var hThreshold = Machine.HEIGHT_THRESHOLD, hhThreshold = hThreshold / 2;
            var y = Stage.Y_MACHINE;
            var g = game.add.graphics(hwGame, y);
            // draw machine's top threshold
            g.beginFill(XG.Color.GRAY_3);
            g.drawRect(-hwGame, -hhThreshold, wGame, hThreshold);
            // set top threshold as walkway for main character
            this.constructThis_feature(g, XG.Collision.MAIN);
            // draw machine's background color
            var hBG = hGame - y;
            g.beginFill(Machine.COLOR_BACKGROUND);
            g.drawRect(-hwGame, hhThreshold, wGame, hBG);
            g.beginFill(Machine.COLOR_THRESHOLD);
            // draw machine's bottom threshold
            g.drawRect(-hwGame, hBG - hThreshold, wGame, hThreshold);
            // draw machine's pin thresholds
            var radiusPin = this.radiusPin, ysPins = Machine.YS_PINS;
            for (var _i = 0, ysPins_1 = ysPins; _i < ysPins_1.length; _i++) {
                var yPin = ysPins_1[_i];
                yPin = yPin - y - radiusPin;
                g.drawRect(-hwGame, yPin, wGame, 2 * radiusPin);
            }
            Stage.groupMachine.add(g);
        };
        Machine.prototype.constructThisBorders = function () {
            this.constructThisBordersInitWidths();
            this.constructThisBordersSpacers();
            this.constructThisBordersWalls();
        };
        Machine.prototype.constructThisBordersInitWidths = function () {
            var wGame = XG.Gm.ie.width;
            // width of slot = width of vole + some margin space
            var wSlot = this.widthSlot = XG.Vole.diameter + 4;
            // slots are evenly spaced across width of game
            var numSlots = Math.floor(wGame / wSlot) - 1;
            if (numSlots % 2 == 0) {
                // ensure a slot at the center of game
                numSlots--;
            }
            this.numSlotsPerRow = numSlots;
            var wTotalSlots = numSlots * wSlot;
            // spacers are rectangles that separate slots
            var numSpacers = numSlots + 1, wTotalSpacers = wGame - wTotalSlots;
            this.widthSpacer = wTotalSpacers / numSpacers;
        };
        /** construct top, bottom slots' spacers and slots */
        Machine.prototype.constructThisBordersSpacers = function () {
            var game = XG.Gm.ie;
            var numSpacers = this.numSlotsPerRow + 1, wSpacer = this.widthSpacer, hwSpacer = wSpacer / 2;
            var h = Machine.HEIGHT_THRESHOLD, hh = h / 2;
            var yT = Stage.Y_MACHINE, yB = game.height - hh;
            var slotsRows = this.slotsRowsThreshold;
            var wSlot = this.widthSlot;
            for (var i = 0; i < numSpacers; i++) {
                var gSp;
                var xSpacer = hwSpacer + i * (wSpacer + wSlot);
                // construct top hole spacers
                gSp = game.add.graphics(xSpacer, yT);
                gSp.beginFill(Machine.COLOR_FEATURE);
                gSp.drawRect(-hwSpacer, -hh, wSpacer, h);
                var mask = XG.Collision.BALL | XG.Collision.HAMMER;
                this.constructThis_feature(gSp, mask);
                // construct bottom hole spacers
                gSp = game.add.graphics(xSpacer, yB);
                gSp.beginFill(Machine.COLOR_FEATURE);
                gSp.drawRect(-hwSpacer, -hh, wSpacer, h);
                this.constructThis_feature(gSp);
                if (i == numSpacers) {
                    break;
                }
                var xSlot = (i + 1) * wSpacer + (i + 0.5) * wSlot;
                // construct top slots
                slotsRows[0].push(new Slot(XG.Ks.center, xSlot, yT, wSlot, h));
                // construct bottom slots
                slotsRows[1].push(new Slot(XG.Ks.bottom, xSlot, yB, wSlot, h));
            }
        };
        Machine.prototype.constructThisPins = function () {
            var game = XG.Gm.ie;
            // pins slide horizontally via prismatic joint,
            // use a machine feature (static body) as joint's bodyA
            var bAnchor = this.graphicsFeatures[0].body;
            var groupPins = Stage.groupMachine;
            var gsPins = this.graphicsPins;
            var dPin = 16, rPin = dPin / 2;
            var numColsPins = this.numSlotsPerRow - 5;
            // total width available for pins to exist and move within
            var x0 = this.widthSpacer, x1 = game.width - x0;
            var wTotalPins = x1 - x0;
            // space between adjacent pins
            var xDistPins = wTotalPins / (numColsPins + 1);
            var yPins = Machine.YS_PINS, numRows = yPins.length;
            for (var iR = 0; iR < numRows; iR++) {
                var gPin = game.add.graphics();
                gPin.beginFill(Machine.COLOR_FEATURE);
                groupPins.add(gPin);
                this.constructThis_feature(gPin);
                var bPin = gPin.body;
                bPin.clearFixtures();
                var slotsRow = this.slotsRowsPins[iR];
                var xPin = x0 + xDistPins, yPin = yPins[iR];
                for (var iC = 1; iC <= numColsPins; iC++) {
                    // add pin fixture
                    gPin.drawCircle(xPin, yPin, dPin);
                    bPin.addCircle(rPin, xPin, yPin);
                    if (iC != numColsPins) {
                        // add slot between pins
                        var typeSlot = 'pins' + iR;
                        var slot = new Slot(typeSlot, xPin, yPin, xDistPins, 2 * rPin);
                        slotsRow.push(slot);
                        var gSlot = slot.graphic;
                        groupPins.moveDown(gSlot);
                        var bSlot = slot.graphic.body;
                        bSlot.static = false;
                        game.physics.box2d.weldJoint(bPin, bSlot, -bPin.x + xDistPins / 2, -bPin.y, -bSlot.x, -bSlot.y);
                    }
                    xPin += xDistPins;
                }
                XG.Gm.ie.physics.box2d.prismaticJoint(bAnchor, gPin.body, undefined, undefined, -bAnchor.x, -bAnchor.y);
                gsPins.push(gPin);
            }
        };
        Machine.prototype.constructThisSpawnPoints = function () {
            var gsSpawnPts = this.graphicsSpawnPts;
            var game = XG.Gm.ie, hwGame = game.hwidth;
            var xsSpawnPts = [hwGame - 300, hwGame, hwGame + 300];
            for (var _i = 0, xsSpawnPts_1 = xsSpawnPts; _i < xsSpawnPts_1.length; _i++) {
                var x = xsSpawnPts_1[_i];
                var gSpawn = game.add.graphics(x, 600);
                gSpawn.beginFill(XG.Color.BLACK);
                gSpawn.lineStyle(8, Machine.COLOR_THRESHOLD);
                gSpawn.drawCircle(0, 0, 64);
                gsSpawnPts.push(gSpawn);
                Stage.groupMachine.add(gSpawn);
            }
        };
        /** construct left, right pachinko walls */
        Machine.prototype.constructThisBordersWalls = function () {
            var game = XG.Gm.ie;
            var w = this.widthSpacer, hw = w / 2, h = game.height - Stage.Y_MACHINE
                - 1.5 * Machine.HEIGHT_THRESHOLD, hh = h / 2;
            var xs = [hw, game.width - hw];
            var y = game.height - h / 2 - Machine.HEIGHT_THRESHOLD;
            for (var i = 0; i < xs.length; i++) {
                var x = xs[i];
                var gWall = game.add.graphics(x, y);
                gWall.beginFill(Machine.COLOR_FEATURE);
                gWall.drawRect(-hw, -hh, w, h);
                this.constructThis_feature(gWall);
            }
        };
        // :construct this Machine
        //
        //
        //
        Machine.prototype.handleControl = function (type, def) {
            if (type !== XG.Ks.pinsMove) {
                return;
            }
            var iRow = def.row;
            if (def.isActive) {
                this.statesPins[iRow] = def.state;
                this.graphicsPins[iRow].body.static = false;
            }
            else {
                if (this.statesPins[iRow] === def.state) {
                    this.statesPins[iRow] = null;
                    this.graphicsPins[iRow].body.static = true;
                }
            }
        };
        Machine.prototype.update = function () {
            for (var i in this.statesPins) {
                var statePin = this.statesPins[i];
                if (statePin != null) {
                    this.updatePin(this.graphicsPins[i].body, statePin === XG.Ks.left);
                }
            }
        };
        Machine.prototype.updatePin = function (body, isMovingLeft) {
            var speed = 100;
            body.velocity.x = (isMovingLeft) ? -speed : speed;
        };
        Machine.COLOR_FEATURE = XG.Color.RED;
        Machine.COLOR_BACKGROUND = XG.Color.RED_N9;
        Machine.COLOR_THRESHOLD = XG.Color.GRAY_3;
        Machine.HEIGHT_THRESHOLD = 32;
        return Machine;
    }());
    XG.Machine = Machine;
    var ManagerSpawnActors = /** @class */ (function () {
        function ManagerSpawnActors() {
            this.delayVole = 4000;
            this.delaySlider = 5000;
            var eventsTime = XG.Gm.ie.time.events;
            eventsTime.add(this.delaySlider, this.spawnSlider, this);
            eventsTime.add(this.delayVole, this.spawnVole, this);
        }
        ManagerSpawnActors.prototype.spawnSlider = function () {
            new XG.Slider(0, Stage.Y_SLIDER);
            // spawn slider slower next time to decrease reward chance
            // slower as score increases
            var deltaDelay = Math.min(696969, Score.Value * 100);
            this.delaySlider = this.delaySlider + deltaDelay;
            XG.Gm.ie.time.events.add(this.delaySlider, this.spawnSlider, this);
        };
        /** constructs a vole at one of the 3 spawn points */
        ManagerSpawnActors.prototype.spawnVole = function () {
            // select random spawn point
            var spawnPts = Stage.machine.graphicsSpawnPts, iSpawnPt = Math.floor(spawnPts.length * Math.random()), spawnPt = spawnPts[iSpawnPt];
            new XG.Vole(spawnPt.x, spawnPt.y);
            // spawn vole faster next time to increase difficulty
            // faster as score increases
            var deltaDelay = Math.floor(Score.Value / 100);
            this.delayVole = Math.max(777, this.delayVole - deltaDelay);
            XG.Gm.ie.time.events.add(this.delayVole, this.spawnVole, this);
        };
        return ManagerSpawnActors;
    }());
    var ManagerUpdateSlots = /** @class */ (function () {
        function ManagerUpdateSlots() {
            this.setNextPSP();
            this.updateSlotsPins();
            this.updateSlotsThreshold();
        }
        ManagerUpdateSlots.prototype.getPSPRand = function () {
            var g = XG.Bonus.GOLD, s = XG.Bonus.SILVER;
            var result;
            switch (Math.floor(Math.random() * 4)) {
                case 0:
                    result = {
                        numCols: 3,
                        values: [[
                                1, s, 1,
                                s, g, s,
                                1, s, 1
                            ]]
                    };
                    break;
                case 1:
                    result = {
                        numCols: 3,
                        values: [[
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
                            [
                                1, s, 1,
                                s, g, s,
                                1, s, 1
                            ], [
                                s, 1, s,
                                1, g, 1,
                                s, 1, s
                            ]
                        ]
                    };
                    break;
                case 3:
                    // 3 gold-silver bullets in random row order
                    var bullets = Phaser.ArrayUtils.shuffle([
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
                var values = result.values;
                for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                    var fV = values_1[_i];
                    for (var iV in fV) {
                        if (fV[iV] == s) {
                            fV[iV] = g;
                        }
                    }
                }
            }
            return result;
        };
        ManagerUpdateSlots.prototype.setNextPSP = function () {
            this.pSPCurrent = this.getPSPRand();
            this.index = 0;
        };
        ManagerUpdateSlots.prototype.updateSlotsPins = function () {
            var slots = Stage.machine.slotsRowsPins;
            // set all slots to no bonus
            for (var _i = 0, slots_1 = slots; _i < slots_1.length; _i++) {
                var slotsRow = slots_1[_i];
                for (var _a = 0, slotsRow_1 = slotsRow; _a < slotsRow_1.length; _a++) {
                    var slot = slotsRow_1[_a];
                    slot.value = 1;
                }
            }
            // lay pattern on slots:
            var index = this.index;
            var p = this.pSPCurrent;
            // determine which frame of pattern to draw
            var framesP = p.values, valsP = framesP[index % framesP.length];
            var numColsP = p.numCols, numColsSlots = slots[0].length;
            // leftmost slot column to draw pattern
            var iColPL = numColsSlots - index;
            // draw pattern by each column
            for (var iColOffset = 0; iColOffset < numColsP; iColOffset++) {
                var iC = iColPL + iColOffset;
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
            }
            else {
                this.index++;
            }
            XG.Gm.ie.time.events.add(2000, this.updateSlotsPins, this);
        };
        /**
         * sets bonus modifier slots for top and bottom slot rows:
         * place gold slot sandwiched between silver slots on both rows,
         * set other slots to no bonus
         */
        ManagerUpdateSlots.prototype.updateSlotsThreshold = function () {
            var slotsRows = Stage.machine.slotsRowsThreshold;
            var vGold = XG.Bonus.GOLD, vSilver = XG.Bonus.SILVER;
            for (var _i = 0, slotsRows_1 = slotsRows; _i < slotsRows_1.length; _i++) {
                var slotsRow = slotsRows_1[_i];
                // set all slots to no bonus
                for (var _a = 0, slotsRow_2 = slotsRow; _a < slotsRow_2.length; _a++) {
                    var slot = slotsRow_2[_a];
                    slot.value = 1;
                }
                // set gold and silver slots
                var numSlots = slotsRow.length;
                var iGold = Math.floor(numSlots * Math.random());
                slotsRow[iGold].value = vGold;
                slotsRow[XG.GmMath.mod(iGold - 1, numSlots)].value = vSilver;
                slotsRow[XG.GmMath.mod(iGold + 1, numSlots)].value = vSilver;
            }
            XG.Gm.ie.time.events.add(4000, this.updateSlotsThreshold, this);
        };
        return ManagerUpdateSlots;
    }());
    var Slot = /** @class */ (function () {
        function Slot(type, x, y, width, height) {
            this.type = type;
            this.ballsInContact = {};
            this.constructGraphic(x, y, width, height);
        }
        Slot.prototype.constructGraphic = function (x, y, width, height) {
            var g = this.graphic = XG.Gm.ie.add.graphics(x, y);
            g.beginFill(XG.Color.WHITE);
            g.drawRect(-width / 2, -height / 2, width, height);
            XG.Gm.b2d.enable(g);
            Stage.groupMachine.add(g);
            var bodyG = g.body;
            bodyG.data.GetFixtureList().SetUserData(this);
            bodyG.mass = 0;
            bodyG.sensor = true;
            bodyG.static = true;
            bodyG.setCollisionCategory(XG.Collision.SLOT);
            bodyG.setCollisionMask(XG.Collision.BALL);
        };
        Slot.prototype.handleBeginContact = function (fixtureThis, fixtureThat) {
            if (this.handleContactIfBall(fixtureThat)) {
                var ball = fixtureThat.GetUserData();
                this.ballsInContact[ball.k] = ball;
            }
        };
        Slot.prototype.handleEndContact = function (fixtureThis, fixtureThat) {
            if (this.handleContactIfBall(fixtureThat)) {
                var ball = fixtureThat.GetUserData();
                delete this.ballsInContact[ball.k];
            }
        };
        Slot.prototype.handleContactIfBall = function (fixtureThat) {
            // handle bonus setting from begin to end contact
            // to set the greater bonus if slot value changes
            // by returning true to remember balls in contact to set bonus
            if (fixtureThat.GetFilterData().categoryBits == XG.Collision.BALL) {
                var ball = fixtureThat.GetUserData();
                this.setContactedBall(ball);
                return true;
            }
            return false;
        };
        Slot.prototype.setContactedBall = function (ball) {
            ball.setBonus(this.type, this.value);
        };
        Object.defineProperty(Slot.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (v) {
                if (this._value == v) {
                    return;
                }
                this._value = v;
                if (XG.Bonus.Bonus2Color[v]) {
                    this.graphic.alpha = 1;
                    this.graphic.tint = XG.Bonus.Bonus2Color[v];
                    // update bonus values for balls in contact
                    var balls = this.ballsInContact;
                    for (var k in balls) {
                        this.setContactedBall(balls[k]);
                    }
                }
                else {
                    this.graphic.alpha = 0;
                }
            },
            enumerable: true,
            configurable: true
        });
        return Slot;
    }());
    XG.Slot = Slot;
    var Score = /** @class */ (function () {
        function Score() {
            Score.ITier = 0;
            Score.Value = 0;
            this.constructTextScore();
        }
        Score.colorFromScore = function () {
            return Score.TiersColors[this.ITier];
        };
        Score.prototype.constructTextScore = function () {
            var game = XG.Gm.ie;
            this.textScore = game.add.text(game.hwidth, 50, 'SCORE:  ' + Score.Value, XG.TextStyle.MAJOR);
            this.textScore.anchor.x = 0.5;
            game.onScore.add(this.updateScore, this);
        };
        Score.prototype.updateScore = function (difference) {
            var value = Score.Value += difference;
            this.textScore.text = 'SCORE:  ' + value;
            // play sound type proportional to score difference
            if (difference < 50) {
                XG.Gm.ie.onSound.dispatch(XG.Ks.scoreSmall);
            }
            else if (difference < 1000) {
                XG.Gm.ie.onSound.dispatch(XG.Ks.scoreMedium);
            }
            else {
                XG.Gm.ie.onSound.dispatch(XG.Ks.scoreLarge);
            }
            // update score tier if score exceeds tier value
            var iTier = Score.ITier;
            var tiers = Score.Tiers;
            while (iTier + 1 < tiers.length && value >= tiers[iTier + 1]) {
                iTier = ++Score.ITier;
                this.textScore.addColor(XG.Color.toStringHex(Score.colorFromScore()), 0);
            }
        };
        Score.ITier = 0;
        Score.Tiers = [0, 2000, 4000, 8000, 14000, 21000];
        Score.TiersColors = [XG.Color.WHITE, XG.Color.SILVER, XG.Color.GOLD, XG.Color.RED, XG.Color.BLUE_P,
            XG.Color.TYRIAN];
        return Score;
    }());
    XG.Score = Score;
    var Touch = /** @class */ (function () {
        function Touch() {
        }
        Touch.setEnabled = function () {
            this.isOn = !this.isOn;
        };
        Touch.init = function () {
            if (!this.isOn) {
                return;
            }
            if (!this.isInitialized) {
                this.isInitialized = true;
                this.initTouches();
            }
            this.initButtons();
        };
        Touch.initTouches = function () {
            var game = XG.Gm.ie;
            // allow up to 6 simultaneous finger touches - default is 2
            game.input.addPointer();
            game.input.addPointer();
            game.input.addPointer();
            game.input.addPointer();
            // disable right click/hold menu
            game.canvas.oncontextmenu = function (event) {
                event.preventDefault();
            };
        };
        /** add touch buttons to stage */
        Touch.initButtons = function () {
            var game = XG.Gm.ie;
            var add = game.add;
            var group = Stage.groupInput;
            var ys = Machine.YS_PINS;
            // left-side buttons for main character controls
            var xL = 200;
            var gHL = add.graphics(xL - 60, ys[1], group), gHR = add.graphics(xL + 60, ys[1], group), gML = add.graphics(xL - 100, ys[2], group), gMR = add.graphics(xL + 100, ys[2], group), gMLSlow = add.graphics(xL - 35, ys[2], group), gMRSlow = add.graphics(xL + 35, ys[2], group);
            // right-side buttons for pin row controls
            var xR = game.width - 200;
            var gMPTL = add.graphics(xR - 50, ys[0], group), gMPTR = add.graphics(xR + 50, ys[0], group), gMPML = add.graphics(xR - 50, ys[1], group), gMPMR = add.graphics(xR + 50, ys[1], group), gMPBL = add.graphics(xR - 50, ys[2], group), gMPBR = add.graphics(xR + 50, ys[2], group);
            // draw button backgrounds
            for (var _i = 0, _a = [
                gHL, gHR, gML, gMR, gMLSlow, gMRSlow,
                gMPTL, gMPTR, gMPML, gMPMR, gMPBL, gMPBR
            ]; _i < _a.length; _i++) {
                var g = _a[_i];
                g.beginFill(XG.Color.SILVER);
                g.drawCircle(0, 0, 64);
                g.lineStyle(4, XG.Color.WHITE);
                g.alpha = 0.5;
            }
            // draw arrows arrows for move buttons
            for (var _b = 0, _c = [gML, gMR, gMLSlow, gMRSlow,
                gMPTL, gMPTR, gMPML, gMPMR, gMPBL, gMPBR
            ]; _b < _c.length; _b++) {
                var g = _c[_b];
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
            for (var _d = 0, _e = [gHL, gHR]; _d < _e.length; _d++) {
                var g = _e[_d];
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
            for (var _f = 0, _g = [
                gHL, gHR,
                gML, gMR, gMLSlow, gMRSlow,
                gMPTL, gMPTR, gMPML, gMPMR, gMPBL, gMPBR
            ]; _f < _g.length; _f++) {
                var g = _g[_f];
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
        };
        Touch.handleBtnDown = function (g) {
            g.alpha = this.alphaBtnOn;
            var keyCodes = g.data;
            for (var _i = 0, keyCodes_1 = keyCodes; _i < keyCodes_1.length; _i++) {
                var keyCode = keyCodes_1[_i];
                XG.Gm.ie.control.handleKey({ isDown: true, keyCode: keyCode });
            }
        };
        Touch.handleBtnUp = function (g, p) {
            // this is part of a HACK that fixes
            // the bug causing buttons to stick down:
            // (1/3) this part allows swiping over buttons to
            // engage other buttons by swiping onto them
            p.swapTarget(null, false);
        };
        // BUG: over and release does not release button
        Touch.handleBtnOver = function (g, p) {
            if (p.isDown) {
                // this is part of a HACK that fixes
                // the bug causing buttons to stick down:
                // (2/3) this part allows swipe-released buttons to disengage
                // as if click/tap-released
                g.input['_touchedHandler'](p);
            }
        };
        Touch.handleBtnOut = function (g, p) {
            g.alpha = this.alphaBtnOff;
            var keyCodes = g.data;
            for (var _i = 0, keyCodes_2 = keyCodes; _i < keyCodes_2.length; _i++) {
                var keyCode = keyCodes_2[_i];
                XG.Gm.ie.control.handleKey({ isDown: false, keyCode: keyCode });
            }
            // this is part of a HACK that fixes
            // the bug causing buttons to stick down:
            // (3/3) this part allows swiped-out, disengaged buttons
            // to be swiped-over, engaged again
            g.input.reset();
            g.input.start();
        };
        Touch.isOn = XG.DetectDevice.mobileAndTabletcheck();
        Touch.alphaBtnOff = 0.5;
        Touch.alphaBtnOn = 0.75;
        return Touch;
    }());
    XG.Touch = Touch;
})(XG || (XG = {}));
//# sourceMappingURL=game.js.map