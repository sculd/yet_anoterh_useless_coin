var move;
$(document).ready(function() {
    move = function() {
        var butt = document.getElementById("loadclick");
        butt.style.display = "none";
        var status = document.getElementById("myProgressstatus");
        status.style.display = "block";
        var loader = document.getElementById("Loader");
        var progressPercentage = document.getElementById("progress-percentage");
        var finalstatus = document.getElementById("finalstatus");
        finalstatus.innerHTML="";

        var width = 10;
        var id = setInterval(frame, 34);

        function frame() {
            if (width >= 100) {
                clearInterval(id);
                progressPercentage.innerHTML = '<span">DONE!</span>';
                progressPercentage.style.left = "45%"
            } else {
                width++;

                if (width == 50)
                    progressPercentage.style.color = '#fff';

                loader.style.width = width + '%';
                progressPercentage.innerHTML = "<small>Definitely checking all documents carefully to make sure you're not from North Korea.</small>";

                loader.style.display = "block";
                progressPercentage.style.display = "block";

            }
        }
    }
});