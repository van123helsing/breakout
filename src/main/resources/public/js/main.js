var game;
var queue = [];
var loaded = false;


window.onload = async function() {

    webgazer.params.showVideoPreview = false;
    //start the webgazer tracker
    await webgazer.setRegression('ridge') /* currently must set regression and tracker */
        //.setTracker('clmtrackr')
        .setGazeListener(function(data, clock) {
            if(loaded === false){
                $("#mainScreen").show();
                $("#loading").hide();
            }
            loaded = true;

            if(data != null && queue.length < 5){
                queue.push(data.x)
            }

            if(game != null && data != null && game.scene != null && game.scene.keys != null && game.scene.keys.breakout != null && game.scene.keys.breakout.paddle != null){
                queue.push(data.x);
                queue.shift();
                game.scene.keys.breakout.paddle.x = Phaser.Math.Clamp(queue.reduce((a, b) => a + b, 0)/queue.length, game.scene.keys.breakout.paddle.width / 2,
                                                    game.config.width - game.scene.keys.breakout.paddle.width / 2);
            }
            // console.log(data.x); /* data is an object containing an x and y key which are the x and y prediction coordinates (no bounds limiting) */
          //   console.log(clock); /* elapsed time in milliseconds since webgazer.begin() was called */
        }).begin();
        webgazer.showVideoPreview(false) /* shows all video previews */
            .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
            .applyKalmanFilter(true); /* Kalman Filter defaults to on. Can be toggled by user. */

    //Set up the webgazer video feedback.
    var setup = function() {

        //Set up the main canvas. The main canvas is used to calibrate the webgazer.
        var canvas = document.getElementById("plotting_canvas");
        canvas.width = $(window).width()-5;
        canvas.height = $(window).height()-5;
        canvas.style.position = 'fixed';
    };
    setup();

};

// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function() {
    webgazer.end();
}

/**
 * Restart the calibration process by clearing the local storage and reseting the calibration point
 */
function Restart(){
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
}


function Start(){
    if(loaded) {
        $("#mainScreen").hide();
        ClearCanvas();

        if (PointCalibrate >= 9)
            game = new Phaser.Game(config);
        else
            Restart();
    }
}

function Recalibrate(){
    if(loaded){
        webgazer.showPredictionPoints(true);
        $("#mainScreen").hide();
        ClearCanvas();
        Restart();
    }
}