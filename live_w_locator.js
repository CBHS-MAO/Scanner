$(function() {
    var codes = "testtest";
    var App = {
        init: function() {
            var self = this;

            var state = this.landscapeState;
            if (screen.availWidth < screen.availHeight)
                state = this.portraitState;

            Quagga.init(state, function(err) {
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
                navigator.clipboard.writeText(codes);
                document.getElementById("done").style.display = "block";
                document.getElementsByClassName("stop")[0].textContent = "Copy Again";
                document.getElementById("interactive").remove();
            });
        },
        portraitState: {
            inputStream: {
                type : "LiveStream",
                constraints: {
                    facingMode: "environment",
                    aspectRatio: {min: 1/3, max: 1/3}
                }
            },
            locator: {
                patchSize: "large",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers : ["code_39_reader"]
            },
            locate: true
        },
        landscapeState: {
            inputStream: {
                type : "LiveStream",
                constraints: {
                    facingMode: "environment",
                    aspectRatio: {min: 3, max: 3}
                }
            },
            locator: {
                patchSize: "large",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers : ["code_39_reader"]
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

        if (App.lastResult !== code && /^\d+$/.test(code)) {
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