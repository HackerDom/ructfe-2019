function setHandlers() {
    var form = $("#sbm-frm");
    var usernameField = $("#usnm");
    var passwordField = $("#pswd");

    form.on("submit", function (ev) {
        var username = usernameField.val();
        var password = passwordField.val();
        var data = JSON.stringify({
            "name": username,
            "password": password
        });
        $.post("/login", data)
            .fail(function (data) {
                alert("Wrong password");
            })
            .done(function (data) {
                document.location.href = "/";
            })
        ;
        return false;
    });
}
