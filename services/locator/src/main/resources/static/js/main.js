let fieldsCount = 0;

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


function addField() {
    const form = $("#sbm-frm");
    let fc = fieldsCount.toString();
    form.append('<input type="text" id="cstm-fld-name' + fc + '" value="field' + fc + '">' +
        '<input type="text" id="cstm-fld-' + fc + '" value="value' + fc + '"><br>');
    fieldsCount++;
}

function toBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function getContent() {
    let d = {};
    let keys = [];
    for (let i = 0; i < fieldsCount; i++) {
        let key = $('#cstm-fld-name' + i.toString()).val();
        let value = $('#cstm-fld-' + i.toString()).val();
        keys.push(key);
        d[key] = value;
    }
    keys.sort();

    let key = toBase64(make_class(keys));
    let message = keys.map(function (key) {
            return d[key].length.toString();
        }).join(":") + ":" +
        keys.map(function (key) {
            return d[key].toString();
        }).join("");
    return {
        "key": key,
        "message": message
    };
}

function setRegisterHandlers() {
    const form = $("#sbm-frm");
    const usernameField = $("#usnm");
    const passwordField = $("#pswd");
    const colorField = $("#color");

    form.on("submit", function () {
        return false;
    });

    $("#btn").on("click", function (ev) {
        const username = usernameField.val();
        const password = passwordField.val();
        const color = colorField.val().substr(1, 6);
        const data = JSON.stringify({
            "name": username,
            "password": password,
            "color": color,
            "content": getContent()
        });
        console.log(data);
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
    $("#add-btn").on("click", function (e) {
        addField();
    });
}
