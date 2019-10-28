<html>
<head>
    <script src="https://code.jquery.com/jquery-3.4.1.js"></script>
    <script src="/static/main.js"></script>
</head>
<body>
<p>
    Hello, ${user.name}!<br>
    ${user.color}<br>
    <#if info.a??>
        ${info.a}
    </#if>
    <br>
    <#if info.b??>
        ${info.b}
    </#if>
    <br>
    <#if info.c??>
        ${info.c}
    </#if>
    <br>
</p>
</body>
</html>
