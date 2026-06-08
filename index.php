<?php
// Banco de datos de trivias cognitivas en el servidor
$trivias_db = [
    ["q" => "El aprendizaje significativo de Ausubel ocurre cuando la nueva información se conecta con conceptos previos.", "a" => true],
    ["q" => "La memoria de trabajo visoespacial se encarga de retener temporalmente los estímulos verbales y sonidos.", "a" => false],
    ["q" => "Según Jean Piaget, los desequilibrios cognitivos obligan al sujeto a reestructurar sus esquemas previos.", "a" => true],
    ["q" => "La inhibición proactiva permite ignorar información antigua para retener nuevos estímulos sin interferencias.", "a" => true]
];

// Mezclar las preguntas de forma aleatoria cada vez que se recargue la partida
shuffle($trivias_db);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cognitive Battlegrounds: Survival PHP</title>
    <link rel="stylesheet" href="estilos.css">
</head>
<body>

    <div id="game-wrapper">
        <div id="hud">
            <div class="hp-container">
                <span class="hud-title">HP DEL JUGADOR</span>
                <div class="bar-bg"><div id="hp-bar"></div></div>
            </div>
            <div id="storm-timer">ZONA SEGURA: 60s</div>
            <div class="score-container">CONSTRUCTOS: <span id="score-txt">0/4</span></div>
        </div>

        <canvas id="battleCanvas" width="800" height="500"></canvas>

        <div id="loot-modal">
            <h3>📦 CAJA DE SUMINISTROS COGNITIVOS</h3>
            <p id="question-text">¿Pregunta de teoría?</p>
            <div>
                <button class="btn-action btn-true" onclick="answerLoot(true)">Verdadero</button>
                <button class="btn-action btn-false" onclick="answerLoot(false)">Falso</button>
            </div>
        </div>

        <div id="start-screen" class="screen">
            <h1>COGNITIVE SURVIVAL</h1>
            <p>Usa las <b>Flechas del teclado</b> o <b>WASD</b> para moverte. Recoge las cajas de Loot (verdes), responde las trivias para ganar armas y mantente dentro de la Zona Segura (Círculo Verde).</p>
            <button class="btn-start" onclick="initGame()">Saltar del Avión</button>
        </div>

        <div id="end-screen" class="screen hidden">
            <h1 id="end-title">FIN DE PARTIDA</h1>
            <p id="end-desc">Mensaje de estado</p>
            <button class="btn-start" onclick="location.reload()">Reaparecer (Reiniciar)</button>
        </div>
    </div>

    <script>
        const trivias = <?php echo json_encode($trivias_db); ?>;
    </script>
    <script src="script.js"></script>
</body>
</html>