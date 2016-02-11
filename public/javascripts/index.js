var loginPage = false;
var interval;

$(function () {
    $('.loginBtn').each(function() {
        loginPage = true;

        var $this = $(this);
        $this.click(function() {
            var $spinner = $('<img src="images/spinner.gif" class="spinner">');
            $this.after($spinner);
            $this.attr("disabled", true);
            $this.data("popup", openPopUp($this.data("url")))
        })
    });

    $('#create button').each(function(){
        var $this = $(this);
        $this.click(function(e){
            $this.after('<img src="images/spinner.gif" class="spinner">');
            window.setTimeout(function() {
                $this.attr("disabled", true);

            }, 0);
        });
    });
});

function openPopUp(url) {
    var width = 525,
        height = 630,
        screenTop = !!window.screenTop ? window.screenTop : window.screenY,
        screenLeft = !!window.screenLeft ? window.screenLeft : window.screenX,
        top = Math.floor(screenTop + ($(window).height() - height) / 2),
        left = Math.floor(screenLeft + ($(window).width() - width) / 2);

    var features = [
        "width=" + width,
        "height=" + height,
        "top=" + top,
        "left=" + left,
        "status=no",
        "resizable=yes",
        "toolbar=no",
        "menubar=no",
        "scrollbars=yes"];

    var popup = window.open(url, "oauth", features.join(","));
    popup.focus();

    return popup;
}

function getCookie(name) {
    var cookies = document.cookie;
    name += "=";
    var start = cookies.indexOf(name);
    if (start >= 0) {
        start += name.length;

        var end = cookies.indexOf(';', start);
        if (end < 0) {
            end = cookies.length;
        }
        return cookies.substring(start, end);
    }
    return null;
}

function checkLogin() {
    if (loginPage && getCookie("google_access_token") && getCookie("live_access_token")) {
        clearInterval(interval);
        location.reload();
    } else if(loginPage) {
        function cleanUp(actor) {
            var $actor = $("#"+actor);
            var $loginBtn = $actor.find(".loginBtn");
            var popup = $actor.find(".loginBtn").data("popup");
            if(popup && popup.closed) {
                $actor.find(".spinner").remove();
                if(!getCookie(actor+"_access_token")) {
                    $loginBtn.attr("disabled", false);
                }
            }
            if(getCookie(actor+"_access_token")) {
                if($actor.find(".tick").length == 0) {
                    $loginBtn.attr("disabled", true).after('<img src="/images/tick.png" class="tick">');
                }
            }
        }

        cleanUp("google");
        cleanUp("live");
    } else if(getCookie("google_access_token") == null || getCookie("live_access_token") == null) {
        clearInterval(interval);
        location.reload();
    }
}

interval = window.setInterval(checkLogin, 500);
