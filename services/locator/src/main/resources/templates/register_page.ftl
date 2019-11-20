<html>
<head>
    <link rel="stylesheet" href="/static/forms.css">
    <link rel="stylesheet" href="/static/background.css">
    <script src="/static/jquery-3.4.1.js"></script>
    <script src="/static/encoder.js"></script>
    <script src="/static/main.js"></script>
</head>
<body onload="setRegisterHandlers()">
<div id="content">
    <form id="register-form">
    <label>Register your submarine</label><br>
    <input type="text" name="username" id="usnm" placeholder="username">
    <input type="password" name="password" id="pswd" placeholder="password"><br>
    <div id="gap">
        <input type="text" id="cstm-fld-name0" value="speed" disabled>
        <input type="text" id="cstm-fld-0" value="0.2" placeholder="0-1 (float)"><br>

        <input type="text" id="cstm-fld-name1" value="color" disabled>
        <input type="text" id="cstm-fld-1" value="#ffff00" placeholder="#abcdef"><br>

        <input type="text" id="cstm-fld-name2" value="size" disabled>
        <input type="text" id="cstm-fld-2" value="10" placeholder="1-40"><br>

    </div>
    <button id="reg-btn">Register</button>
        <button id="lgn-btn-page">Go to login Page</button>
    <button id="add-btn">Add info field</button>
    <br>
</form>
</div>
</body>
</html>
