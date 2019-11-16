let fieldsCount = 3;

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
    let fc = fieldsCount.toString();
    ($("#gap")).append('<input type="text" id="cstm-fld-name' + fc + '" value="field' + fc + '">' +
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

const regex = /^[a-zA-Z0-9]{3,50}$/;
const colorRegex = /^#[0-9a-f]{6}$/;


function setRegisterHandlers() {
    const form = $("#sbm-frm");
    const usernameField = $("#usnm");
    const passwordField = $("#pswd");
    const speedField = $("#cstm-fld-0");
    const colorField = $("#cstm-fld-1");
    const sizeField = $("#cstm-fld-2");

    form.on("submit", function () {
        return false;
    });

    $("#reg-btn").on("click", function (ev) {
        const username = usernameField.val();
        const password = passwordField.val();

        if (!regex.test(username)) {
            alert("Username must match this regex: " + regex.toString());
            return;
        }

        if (!regex.test(password)) {
            alert("Password must match this regex: " + regex.toString());
            return;
        }

        const color = colorField.val();

        if (!colorRegex.test(color)) {
            alert("Color must match this regex: " + colorRegex.toString());
            return;
        }

        const speed = Math.min(Math.max(parseInt(speedField.val()), 0), 1);

        const size = parseInt(sizeField.val());

        if (size < 1 || size > 40) {
            alert("Size must be in range: [1, 40]");
            return;
        }

        const data = JSON.stringify({
            "name": username,
            "password": password,
            "color": color,
            "speed": speed,
            "size": size,
            "content": getContent()
        });
        $.post("/register", data)
            .fail(function (data) {
                console.log("fail");
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
