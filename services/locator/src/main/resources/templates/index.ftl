<html>
<head>
    <script src="https://code.jquery.com/jquery-3.4.1.js"></script>
    <script src="/static/main.js"></script>
</head>
<body>
<p>
    Hello, ${user.name}!<br>
    <br>
    ${info}
    ${info.field1}
    <#--    <#list fields as item>-->

    <#--        ${info["${item}"]}-->
    <#--    </#list>-->
</p>
</body>
</html>
