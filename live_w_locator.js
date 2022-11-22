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
            $(".container").on("click", "button", function(e) {
                e.preventDefault();
                Quagga.stop();
                document.getElementById("interactive").remove();
                navigator.clipboard.writeText(codes);
                document.getElementById("done").style.display = "block";
            });
        },
        state: {
            numOfWorkers: 2,
            locate: true,
            inputStream: {
                type : "LiveStream",
                constraints: {
                    facingMode: "environment",
                }
            },
            frequency: 10,
            decoder: {
                readers : ["code_39_reader"],
                debug: {
                    drawBoundingBox: false,
                    showFrequency: false,
                    drawScanLine: false,
                    showPattern: false
                }
            },
            locator: {
                halfSample: true,
                patchSize: "large",
                debug: {
                    showCanvas: false,
                    showPatches: false,
                    showFoundPatches: false,
                    showSkeleton: false,
                    showLabels: false,
                    showPatchLabels: false,
                    showRemainingPatchLabels: false,
                    boxFromPatches: {
                      showTransformed: false,
                      showTransformedBox: false,
                      showBB: false
                    }
                }
            },
            debug: false
        },
        lastResult : null
    };

    App.init();

    Quagga.onDetected(function(result) {
        var code = result.codeResult.code;
        if (App.lastResult !== code) {
            App.lastResult = code;
            var $node = $('<li class="code"><h4 class="code"></h4></li>');
            $node.find("h4.code").html(code);
            $("ul.codes").prepend($node);
            codes += code + ", ";
            document.getElementById("interactive").style.borderColor = "lime";
            setTimeout(function() {document.getElementById("interactive").style.borderColor = "black";}, 1000);
        }
    });

});
