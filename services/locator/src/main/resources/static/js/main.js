function setLoginHandlers() {
    const form = $("#sbm-frm");
    const usernameField = $("#usnm");
    const passwordField = $("#pswd");

    form.on("submit", function (ev) {
        const username = usernameField.val();
        const password = passwordField.val();
        const data = JSON.stringify({
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

function setRegisterHandlers() {
    const form = $("#sbm-frm");
    const usernameField = $("#usnm");
    const passwordField = $("#pswd");
    const colorField = $("#color");
    const rawInfoContentField = $("#raw-content");

    form.on("submit", function (ev) {
        const username = usernameField.val();
        const password = passwordField.val();
        const color = colorField.val().substr(1, 6);
        const rawInfoContent = rawInfoContentField.val();
        const data = JSON.stringify({
            "name": username,
            "password": password,
            "color": color,
            "rawInfoContent": rawInfoContent,
        });
        $.post("/register", data)
            .fail(function (data) {
                alert(data);
            })
            .done(function (data) {
                document.location.href = "/";
            })
        ;
        return false;
    });
}

