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
    this.load.spritesheet('link', 'assets/link.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('platform', 'assets/platform.png');
    this.load.image('enemy1', 'assets/enemy1.png');
    this.load.image('enemy2', 'assets/enemy2.png');
    this.load.image('enemy3', 'assets/enemy3.png');
    this.load.image('enemy4', 'assets/enemy4.png');
    this.load.image('rupee', 'assets/rupee.png');
}

function create() {
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Animaciones de Link
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
    platforms = this.physics.add.staticGroup();
    setupLevel(this, currentLevel);

    // Jugador (Link)
    player = this.physics.add.sprite(100, 450, 'link');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    // Enemigos
    enemies = this.physics.add.group();
    spawnEnemies(this);

    // Rupias
    rupees = this.physics.add.group();
    rupees.create(700, 500, 'rupee').setCollideWorldBounds(true);
    this.physics.add.collider(rupees, platforms);
    this.physics.add.overlap(player, rupees, collectRupee, null, this);

    // Inicializar teclado explícitamente
    this.input.keyboard.enabled = true; // Asegurar que el teclado esté habilitado
    cursors = this.input.keyboard.createCursorKeys();
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // Texto del nivel
    levelText = this.add.text(16, 16, 'Nivel: ' + currentLevel, { fontSize: '20px', fill: '#000' });

    // Sonidos
    jumpSound = this.sound.add('jump', { volume: 0.5 });
    attackSound = this.sound.add('attack', { volume: 0.5 });
    rupeeSound = this.sound.add('rupee', { volume: 0.5 });
    this.sound.add('jump', { detune: 100, rate: 1.5 });
    this.sound.add('attack', { detune: 200, rate: 1 });
    this.sound.add('rupee', { detune: 300, rate: 2 });

    // Forzar foco en el juego al hacer clic
    this.input
