$(function() {
    var codes = "";
    var App = {
        init: function() {
            var self = this;

            Quagga.init(this.state, function(err) {
                if (err) {
                    return self.handleError(err);
                }
                App.attachListeners();
                console.log("Initialization finished. Ready to start.");
                Quagga.start();
            });
        },
        handleError: function(err) {
            console.log(err);
        },
        attachListeners: function() {
            $(".container").on("click", "button.stop", function(e) {
                e.preventDefault();
                Quagga.stop();
                document.getElementById("interactive").remove();
                navigator.clipboard.writeText(codes);
                document.getElementById("done").style.display = "block";
            });
        },
        state: {
            inputStream: {
                type : "LiveStream",
                constraints: {
                    facingMode: "environment",
                }
            },
            locator: {
                patchSize: "large",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers : [{
                    format: "code_39_reader",
                    config: {}
                }]
            },
            locate: true
        },
        lastResult : null
    };

    App.init();

    Quagga.onProcessed(function(result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
        }
    });

    Quagga.onDetected(function(result) {
        var code = result.codeResult.code;

        if (App.lastResult !== code) {
            App.lastResult = code;
            var $node = $('<li><h4 class="code"></h4></li>');
            $node.find("h4.code").html(code);
            $("ul.codes").prepend($node);
            codes += code + ", ";
            document.getElementById("interactive").style.borderColor = "lime";
            setTimeout(function() {document.getElementById("interactive").style.borderColor = "black";}, 1000);
        }
    });

});
