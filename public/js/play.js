var playState = {
	create: function() {
		game.physics.arcade.gravity.y = 500;
		scrollSpeed = -50;

		bg = game.add.tileSprite(0, 0, 800, 600, 'background');
		bg.scale.setTo(3, 2);

		scoreText = game.add.text(16, 16, 'Score: ' + score, { font: '32px Fantasy', fill: '#222222' });
		livesText = game.add.text(670, 16, 'Lives: ' + lives, { font: '32px Fantasy', fill: '#222222' });
		livesText.text = "Lives: " + lives;

		platforms = game.add.physicsGroup();
		carrots = game.add.physicsGroup();
		eaten = game.add.physicsGroup();
		snowmen = game.add.physicsGroup();
		// create first platform with carrot on it
		platforms.create(250, 450, 'ledge');
		carrots.create(280, 416, 'carrot-top');

		// create other platforms
		platforms.create(10, 550, 'ledge');
		platforms.create(550, 350, 'ledge');

		//create ice platform with snwoman
		platforms.create(800, 300, 'ice-ledge');
		snowmen.create(830, 300 - 50, 'snowman');

		platforms.setAll('body.allowGravity', false);
		platforms.setAll('body.immovable', true);
		platforms.setAll('body.velocity.x', scrollSpeed);

		carrots.setAll('body.allowGravity', false);
		carrots.setAll('body.immovable', true);
		carrots.setAll('body.velocity.x', scrollSpeed);

		snowmen.setAll('body.velocity.x', scrollSpeed);

		player = game.add.sprite(252, 400, 'bunny');

		game.physics.arcade.enable(player);

		player.body.setSize(26, 48, 1, -2);
		player.animations.add('left', [0, 1, 2, 3], 10, true);
		player.animations.add('right', [5, 6, 7, 8], 10, true);

		//snow machine
		emitter = game.add.emitter(600, 0);
		emitter.width = 1500;
		emitter.makeParticles('snowflake', 0, 1500, false, false);
		emitter.particleDrag.y = 400;
		emitter.maxParticleSpeed.x = scrollSpeed - 25;
		emitter.minParticleSpeed.x = scrollSpeed - 75;
		emitter.maxParticleScale = 2;
		emitter.lifespan = 4000;
		emitter.gravity = -15;

		squashedSnowman = game.add.emitter(0, 0, 20);
		squashedSnowman.width = 30;
		squashedSnowman.minParticleScale = 2;
		squashedSnowman.maxParticleScale = 3;

		squashedSnowman.setAllChildren('enableBody', true);
		// squashedSnowman.setAllChildren('body.acceleration.y', -450);
		squashedSnowman.bounce.y = 0.1;

		cursors = game.input.keyboard.createCursorKeys();
	},

	update: function() {
		hitPlatform = game.physics.arcade.collide(player, platforms, setFriction);
		touchCarrot = game.physics.arcade.overlap(player, carrots, setCarrot);
		hitSnowman = game.physics.arcade.collide(player, snowmen, fightSnowman);
		game.physics.arcade.collide(snowmen, platforms, moveSnowman);
		game.physics.arcade.collide(squashedSnowman, platforms);
		game.physics.arcade.overlap(player, squashedSnowman, collectSnowball);

		if (timer % 10 === 0) setNextLedge();

		emitter.emitParticle();

		if(!hitPlatform) airFriction();

		if(!cursors.up.isDown && hitPlatform) {
			jumpCount = 0;
		} else if (!cursors.up.isDown && !hitPlatform && jumpCount < 1) {
			jumpCount = 1;
		}

		if(cursors.left.isDown && !eating) {
			player.body.velocity.x = -150;

			if (jumpCount == 1) {
				player.animations.stop();
				player.frame = 3;
			} else {
				player.animations.play('left');
			}
		} else if (cursors.right.isDown && !eating) {
			player.body.velocity.x = 150;

			if (jumpCount == 1) {
				player.animations.stop();
				player.frame = 6;
			} else {
				player.animations.play('right');
			}
		} else {
			player.animations.stop();
			player.frame = 4;
		}

		if(cursors.up.isDown && player.body.touching.down && hitPlatform && !eating) {
			player.body.velocity.y = -300;
			sounds.jump.play();
		} else if (cursors.up.isDown && jumpCount === 1) {
				player.body.velocity.y = -270;
				sounds.jump.play();
				jumpCount = 2;
		}
		if (cursors.down.isDown && touchCarrot) {
			eatCarrot();
		} else if (cursors.down.isDown && jumpCount > 0) {
			player.body.acceleration.y = 10000;
		} else if (!cursors.down.isDown) {
			player.body.acceleration.y = 0;
		}
		timer++;

		if(player.body.position.y > 600) {
			playerFall();
		}
		if(score > nextLife){
			lives++;
			livesText.text = "Lives: " + lives;
			nextLife *= 2;
		}
		killSnowmen();

	}
};
