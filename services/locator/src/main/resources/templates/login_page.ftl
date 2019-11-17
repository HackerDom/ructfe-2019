<html>
<head>
    <link rel="stylesheet" href="/static/forms.css">
    <link rel="stylesheet" href="/static/background.css">
    <script src="https://code.jquery.com/jquery-3.4.1.js"></script>
    <script src="/static/encoder.js"></script>
    <script src="/static/main.js"></script>
</head>
<body onload="setLoginHandlers()">
<div id="content">
    <form id="login-form">
        <label>Log in your submarine</label><br>
        <input type="text" name="username" id="usnm" placeholder="username">
        <input type="password" name="password" id="pswd" placeholder="password"><br>

        <button id="reg-btn-page">Go to register Page</button>
        <button id="lgn-btn">Login</button>
        <br>
    </form>
</div>
</body>
</html>
