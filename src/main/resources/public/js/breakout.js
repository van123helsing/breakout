let scoreText;
let livesText;
let levelText;
let startButton;
let menuButton;
let rotation;
let gameOverText;
let wonTheGameText;

const textStyle = {
    font: 'bold 18px Arial',
    fill: '#FFF'
};


var Breakout = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Breakout() {
        Phaser.Scene.call(this, {key: 'breakout'});

        this.bricks;
        this.paddle;
        this.ball;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
    },

    preload: function () {
        this.load.image('paddle', 'img/paddle2.png');
        this.load.image('brick1', 'img/blue2.png');
        this.load.image('brick2', 'img/green2.png');
        this.load.image('brick3', 'img/yellow2.png');
        this.load.image('brick4', 'img/red2.png');
        this.load.image('brick5', 'img/silver2.png');
        this.load.image('ball', 'img/ball2.png');
    },

    create: function () {
        var w = $(window).width()-5;
        var h = $(window).height()-5;
        w = w/2133;
        h = h/1041;

        this.paddle = this.physics.add.image(this.cameras.main.centerX, this.game.config.height - 50, 'paddle')
            .setImmovable()
            .setScale(w,h);

        this.ball = this.physics.add.image(this.cameras.main.centerX, this.game.config.height - 80, 'ball')
            .setCollideWorldBounds(true)
            .setBounce(1)
            .setScale(w,h);

        var allBricks = this.setAllBricks(level1);
        for (i in allBricks) {
            var tmp = this.physics.add.staticGroup({
                key: allBricks[i].brick,
                frameQuantity: 1,
                gridAlign: {width: 20, cellWidth: 60*w, cellHeight: 60*h, x: allBricks[i].x, y: allBricks[i].y}
            });
            if (this.bricks == null)
                this.bricks = tmp;
            else
                this.bricks.addMultiple(tmp.children.entries);
        }


        scoreText = this.add.text(20, 20, 'Score: 0', textStyle);
        livesText = this.add.text(this.game.config.width - 20, 20, 'Lives: ' + this.lives, textStyle).setOrigin(1, 0);
        levelText = this.add.text(this.cameras.main.centerX, 20, 'Level: ' + this.level, textStyle).setOrigin(1, 0);

        gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game over!', textStyle)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({backgroundColor: '#111', fill: '#e74c3c'})
            .setVisible(false);

        wonTheGameText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'You won the game!', textStyle)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({backgroundColor: '#111', fill: '#27ae60'})
            .setVisible(false);

        startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start game', textStyle)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({backgroundColor: '#111'})
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => this.startGame.call(this))
            .on('pointerover', () => startButton.setStyle({fill: '#f39c12'}))
            .on('pointerout', () => startButton.setStyle({fill: '#FFF'}));

        menuButton = this.add.text(this.game.config.width - 60, 70, 'Menu', textStyle)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({backgroundColor: '#111'})
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                if(this.ball.body !== undefined)
                    var velocity = this.ball.body.velocity.clone()
                this.ball.setVelocity(0, 0);
                swal({
                    title: "Exit Game?",
                    text: "If you go to the menu the game will end. Sure you wanna do this?",
                    buttons: {
                        cancel: "Cancel",
                        confirm: "Exit"
                    }
                }).then(isConfirm => {
                    if (isConfirm) {
                        var array = $("canvas");
                        var last_element = array[array.length - 1];
                        last_element.remove();
                        this.game.registry.destroy(); // destroy registry
                        this.game.events.off(); // disable all active events
                        this.ball.destroy();
                        $("#mainScreen").show();
                    } else {
                        if(this.ball.body !== undefined)
                            this.ball.setVelocity(velocity.x, velocity.y);
                    }
                })
            })
            .on('pointerover', () => menuButton.setStyle({fill: '#f39c12'}))
            .on('pointerout', () => menuButton.setStyle({fill: '#FFF'}));

        this.physics.add.collider(this.ball, this.bricks, this.brickHit, null, this);
        this.physics.add.collider(this.ball, this.paddle, null, null, this);

    },

    update: function () {
        if (rotation) {
            this.ball.rotation = rotation === 'left' ? this.ball.rotation - .05 : this.ball.rotation + .05;
        }

        if (this.ball.y > this.paddle.y) {
            this.lives--;

            if (this.lives > 0) {
                livesText.setText(`Lives: ${this.lives}`);

                this.ball.setPosition(this.cameras.main.centerX, this.game.config.height - 100)
                    .setVelocity(300, -150);
            } else {
                this.ball.destroy();

                gameOverText.setVisible(true);
            }
        }
    },

    brickHit: function (ball, brick) {
        var tmpScore = 0
        switch (brick.texture.key){
            case "brick1":
                tmpScore = 5;
                break;
            case "brick2":
                tmpScore = 10;
                break;
            case "brick3":
                tmpScore = 15;
                break;
            case "brick4":
                tmpScore = 20;
                break;
            case "brick5":
                tmpScore = 25;
                break;
        }

        this.score += tmpScore;
        scoreText.setText(`Score: ${this.score}`);

        this.tweens.add({
            targets: brick,
            scaleX: 0,
            scaleY: 0,
            ease: 'Power1',
            duration: 500,
            delay: 250,
            angle: 180,
            onComplete: () => {
                brick.destroy();

                if (this.bricks.countActive() === 0) {
                    ball.destroy();

                    wonTheGameText.setVisible(true);
                }
            }
        });
    },

    startGame: function () {
        startButton.destroy();
        this.ball.setVelocity(-300, -150);
        rotation = 'left';
    },

    setAllBricks: function (level) {
        var array = [];
        for (var i = 0; i < level.length; i++) {
            for (var j = 0; j < level[0].length; j++) {
                var brickName = "";
                switch (level[i][j]) {
                    case "1":
                        brickName = "brick1";
                        break;
                    case "2":
                        brickName = "brick2";
                        break;
                    case "3":
                        brickName = "brick3";
                        break;
                    case "4":
                        brickName = "brick4";
                        break;
                    case "5":
                        brickName = "brick5";
                        break;
                }
                if (brickName === "") continue;

                array.push({
                    brick: brickName,
                    x: j * 64,
                    y: 100 + i * 32
                });
            }
        }

        return array;
    }
});

const config = {
    type: Phaser.AUTO,
    width: $(window).width()-5,
    height: $(window).height()-5,
    scene: [ Breakout ],
    backgroundColor: '#222',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            checkCollision: {
                up: true,
                down: false,
                left: true,
                right: true
            }
        }
    }
};



