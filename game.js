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

console.log("Iniciando juego");
let game = new Phaser.Game(config);
let player, platforms, enemies, rupees, cursors, attackKey, dashKey;
let currentLevel = 1;
let levelText;

function preload() {
    console.log("Iniciando preload");
    try {
        this.load.spritesheet('link', 'assets/link.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('platform', 'assets/platform.png');
        this.load.image('enemy1', 'assets/enemy1.png');
        this.load.image('enemy2', 'assets/enemy2.png');
        this.load.image('enemy3', 'assets/enemy3.png');
        this.load.image('enemy4', 'assets/enemy4.png');
        this.load.image('rupee', 'assets/rupee.png');
        console.log("Preload completado");
    } catch (error) {
        console.error("Error en preload:", error);
    }
}

function create() {
    console.log("Iniciando create");
    try {
        this.cameras.main.setBackgroundColor('#87CEEB');
        console.log("Fondo establecido");

        // Plataformas
        console.log("Configurando plataformas");
        platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'platform').setScale(2).refreshBody();
        platforms.create(600, 400, 'platform');

        // Jugador (Link)
        console.log("Creando jugador");
        player = this.physics.add.sprite(100, 450, 'link');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, platforms);

        // Enemigos
        console.log("Creando enemigos");
        enemies = this.physics.add.group();
        let enemy = this.physics.add.sprite(600, 350, 'enemy1');
        enemy.setVelocityX(-100);
        enemy.setCollideWorldBounds(true);
        enemy.minX = 550; enemy.maxX = 650;
        this.physics.add.collider(enemy, platforms);
        this.physics.add.collider(player, enemy, hitEnemy, null, this);
        enemies.add(enemy);

        // Rupias
        console.log("Creando rupias");
        rupees = this.physics.add.group();
        rupees.create(700, 500, 'rupee').setCollideWorldBounds(true);
        this.physics.add.collider(rupees, platforms);
        this.physics.add.overlap(player, rupees, collectRupee, null, this);

        // Inicializar teclado con respaldo
        console.log("Inicializando teclado");
        this.input.keyboard.enabled = true;
        cursors = this.input.keyboard.createCursorKeys();
        attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // Forzar foco al hacer clic
        this.input.on('pointerdown', () => {
            console.log("Juego enfocado");
        });

        // Texto del nivel
        console.log("Añadiendo texto");
        levelText = this.add.text(16, 16, 'Nivel: ' + currentLevel, { fontSize: '20px', fill: '#000' });

        console.log("Create completado");
    } catch (error) {
        console.error("Error en create:", error);
    }
}

function update() {
    console.log("Actualizando juego - player.body.touching.down:", player.body.touching.down);
    // Prueba múltiples formas de detectar la tecla para depurar
    if (Phaser.Input.Keyboard.JustDown(cursors.up) || this.input.keyboard.checkDown(cursors.up)) {
        console.log("Flecha arriba presionada - Saltando (JustDown o checkDown)");
        if (player.body.touching.down) {
            console.log("Puede saltar: está en el suelo");
            player.setVelocityY(-330);
        } else {
            console.log("No puede saltar: no está en el suelo");
        }
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
        console.log("Flecha izquierda presionada");
        player.setVelocityX(-160);
    } else if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
        console.log("Flecha derecha presionada");
        player.setVelocityX(160);
    } else if (!cursors.left.isDown && !cursors.right.isDown) {
        player.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(attackKey)) {
        console.log("Espacio presionado");
        attack(this);
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

function hitEnemy(player, enemy) {
    if (player.body.touching.down && enemy.body.touching.up) {
        enemy.destroy();
    } else {
        player.setPosition(100, 450);
    }
}

function collectRupee(player, rupee) {
    rupee.destroy();
    if (currentLevel < 4) {
        currentLevel++;
        resetLevel(this);
    } else {
        this.add.text(300, 300, '¡Juego Completado!', { fontSize: '32px', fill: '#000' });
    }
}

function resetLevel(scene) {
    player.setPosition(100, 450);
    platforms.clear(true, true);
    switch (currentLevel) {
        case 1:
            platforms.create(400, 568, 'platform').setScale(2).refreshBody();
            platforms.create(600, 400, 'platform');
            let enemy1 = scene.physics.add.sprite(600, 350, 'enemy1');
            enemy1.setVelocityX(-100);
            enemy1.setCollideWorldBounds(true);
            enemy1.minX = 550; enemy1.maxX = 650;
            scene.physics.add.collider(enemy1, platforms);
            scene.physics.add.collider(player, enemy1, hitEnemy, null, scene);
            enemies.add(enemy1);
            rupees.create(700, 500, 'rupee');
            break;
        // Agrega casos 2, 3, 4 similares (simplificados para este ejemplo)
    }
    levelText.setText('Nivel: ' + currentLevel);
}

function attack(scene) {
    enemies.children.iterate(function(enemy) {
        if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 50) {
            enemy.destroy();
        }
    });
}