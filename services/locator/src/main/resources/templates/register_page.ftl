<html>
<head>
    <script src="https://code.jquery.com/jquery-3.4.1.js"></script>
    <script src="/static/main.js"></script>
</head>
<body onload="setRegisterHandlers()">
<form id="sbm-frm">
    <input type="text" name="username" id="usnm" placeholder="username"><br>

    <input type="password" name="password" id="pswd" placeholder="password"><br>


    <select id="power">
        <#list 1..10 as i>
            <option value="${i}">${i}</option>
        </#list>
    </select>
    <br>

    <input type="color" id="color" value="#00ee00"><br>
    <button id="btn">Register</button>
</form>
</body>
</html>
