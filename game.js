let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let player, platforms, enemies, rupees, cursors, attackKey, dashKey;
let currentLevel = 1;
let levelText, jumpSound, attackSound, rupeeSound;

function preload() {
    console.log("Iniciando preload");
    this.load.spritesheet('link', 'assets/link.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('platform', 'assets/platform.png');
    this.load.image('enemy1', 'assets/enemy1.png');
    this.load.image('enemy2', 'assets/enemy2.png');
    this.load.image('enemy3', 'assets/enemy3.png');
    this.load.image('enemy4', 'assets/enemy4.png');
    this.load.image('rupee', 'assets/rupee.png');
    console.log("Preload completado");
}

function create() {
    console.log("Iniciando create");
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Animaciones de Link
    console.log("Creando animaciones");
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('link', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'link', frame: 0 }],
        frameRate: 20
    });
    this.anims.create({
        key: 'jump',
        frames: [{ key: 'link', frame: 2 }],
        frameRate: 20
    });
    this.anims.create({
        key: 'attack',
        frames: [{ key: 'link', frame: 3 }],
        frameRate: 20
    });

    // Plataformas por nivel
    console.log("Configurando plataformas");
    platforms = this.physics.add.staticGroup();
    setupLevel(this, currentLevel);

    // Jugador (Link)
    console.log("Creando jugador");
    player = this.physics.add.sprite(100, 450, 'link');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    // Enemigos
    console.log("Creando enemigos");
    enemies = this.physics.add.group();
    spawnEnemies(this);

    // Rupias
    console.log("Creando rupias");
    rupees = this.physics.add.group();
    rupees.create(700, 500, 'rupee').setCollideWorldBounds(true);
    this.physics.add.collider(rupees, platforms);
    this.physics.add.overlap(player, rupees, collectRupee, null, this);

    // Inicializar teclado
    console.log("Inicializando teclado");
    this.input.keyboard.enabled = true;
    cursors = this.input.keyboard.createCursorKeys();
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // Texto del nivel
    console.log("Añadiendo texto");
    levelText = this.add.text(16, 16, 'Nivel: ' + currentLevel, { fontSize: '20px', fill: '#000' });

    // Sonidos
    console.log("Configurando sonidos");
    jumpSound = this.sound.add('jump', { volume: 0.5 });
    attackSound = this.sound.add('attack', { volume: 0.5 });
    rupeeSound = this.sound.add('rupee', { volume: 0.5 });
    this.sound.add('jump', { detune: 100, rate: 1.5 });
    this.sound.add('attack', { detune: 200, rate: 1 });
    this.sound.add('rupee', { detune: 300, rate: 2 });

    // Forzar foco
    this.input.once('pointerdown', function () {
        console.log("Juego enfocado");
    }, this);

    console.log("Create completado");
}

function update() {
    // Movimientos y depuración
    if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
        console.log("Flecha izquierda presionada");
        player.setVelocityX(-160);
        player.anims.play('walk', true);
        player.flipX = true;
    } else if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
        console.log("Flecha derecha presionada");
        player.setVelocityX(160);
        player.anims.play('walk', true);
        player.flipX = false;
    } else if (!cursors.left.isDown && !cursors.right.isDown) {
        player.setVelocityX(0);
        player.anims.play('idle', true);
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.up) && player.body.touching.down) {
        console.log("Flecha arriba presionada");
        player.setVelocityY(-330);
        player.anims.play('jump', true);
        jumpSound.play();
    }

    if (Phaser.Input.Keyboard.JustDown(attackKey)) {
        console.log("Espacio presionado");
        player.anims.play('attack', true);
        attack(this);
        attackSound.play();
    }

    if (Phaser.Input.Keyboard.JustDown(dashKey) && player.body.touching.down) {
        console.log("Shift presionado");
        player.setVelocityX(player.body.velocity.x > 0 ? 300 : -300);
    }

    // Actualizar enemigos
    enemies.children.iterate(function(enemy) {
        if (enemy.x <= enemy.minX) enemy.setVelocityX(100);
        if (enemy.x >= enemy.maxX) enemy.setVelocityX(-100);
    });
}

function setupLevel(scene, level) {
    platforms.clear(true, true);
    switch (level) {
        case 1:
            platforms.create(400, 568, 'platform').setScale(2).refreshBody();
            platforms.create(600, 400, 'platform');
            break;
        case 2:
            platforms.create(400, 568, 'platform').setScale(2).refreshBody();
            platforms.create(200, 400, 'platform');
            platforms.create(600, 300, 'platform');
            break;
        case 3:
            platforms.create(400, 568, 'platform').setScale(2).refreshBody();
            platforms.create(150, 450, 'platform');
            platforms.create(650, 350, 'platform');
            platforms.create(400, 250, 'platform');
            break;
        case 4:
            platforms.create(400, 568, 'platform').setScale(2).refreshBody();
            platforms.create(100, 400, 'platform');
            platforms.create(300, 300, 'platform');
            platforms.create(500, 200, 'platform');
            platforms.create(700, 100, 'platform');
            break;
    }
}

function spawnEnemies(scene) {
    enemies.clear(true, true);
    let enemy;
    switch (currentLevel) {
        case 1:
            enemy = scene.physics.add.sprite(600, 350, 'enemy1');
            enemy.minX = 550; enemy.maxX = 650;
            break;
        case 2:
            enemy = scene.physics.add.sprite(200, 350, 'enemy2');
            enemy.minX = 150; enemy.maxX = 250;
            break;
        case 3:
            enemy = scene.physics.add.sprite(650, 300, 'enemy3');
            enemy.minX = 600; enemy.maxX = 700;
            break;
        case 4:
            enemy = scene.physics.add.sprite(700, 50, 'enemy4');
            enemy.minX = 650; enemy.maxX = 750;
            break;
    }
    enemy.setVelocityX(-100);
    enemy.setCollideWorldBounds(true);
    scene.physics.add.collider(enemy, platforms);
    scene.physics.add.collider(player, enemy, hitEnemy, null, scene);
    enemies.add(enemy);
}

function attack(scene) {
    enemies.children.iterate(function(enemy) {
        if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 50) {
            enemy.destroy();
        }
    });
}

function hitEnemy(player, enemy) {
    if (player.body.touching.down && enemy.body.touching.up) {
        enemy.destroy();
    } else {
        player.setPosition(100, 450);
    }
}

function collectRupee(player, rupee) {
    rupee.destroy();
    rupeeSound.play();
    if (currentLevel < 4) {
        currentLevel++;
        resetLevel(this);
    } else {
        scene.add.text(300, 300, '¡Juego Completado!', { fontSize: '32px', fill: '#000' });
    }
}

function resetLevel(scene) {
    player.setPosition(100, 450);
    setupLevel(scene, currentLevel);
    spawnEnemies(scene);
    rupees.create(700, 500 - (currentLevel - 1) * 100, 'rupee');
    levelText.setText('Nivel: ' + currentLevel);
}
