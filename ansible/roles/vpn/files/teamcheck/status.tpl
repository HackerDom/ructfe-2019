<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv='refresh' content='60'>
        <title>RuCTFE 2019 Network Status/</title>
        <style>
              /*body {background-color:lightgray}*/
              h1 {text-align: center; padding-bottom: 0px; }
              h3 {text-align: center; padding-bottom: 0px; }
              h4 {text-align: center; padding-bottom: 0px; }
              td {font-family:Arial, Helvetica, sans-serif; 
                    height: 50px; text-align: center;}
              table {width: 98%;}
              .yesnocell {width: 150px; color: #bbbbbb;}
              .yescell {background-color: #00b500;}
              .nocell {background-color: #ff4040;}
              .graycell {color: gray; font-size:small; }
              .namecell {width: 400px}
              p {color:green}
        </style>
    </head>
    <body>
        <h1> RuCTFE 2019 Network Status </h1>
        <h3> Updated at: {{time}} </h3>
        {% if netopened %}
        <h4> Network is opened </h4>
        {% else %}
        <h4> Network is closed </h4>
        {% endif %}
        <table>
            <tr>
            <th>#</th>
            <th>Name</th>
            <th>Router is UP</th>
            <th>Image is UP</th>
            <th>Service is UP</th>
            <th>Router was UP</th>
            <th>Image was UP</th>
            <th>Service was UP</th>
            </tr>

            <tr>
            <th></th>
            <th></th>
            <th class="graycell">&sum; = {{sums.router_ping}}</th>
            <th class="graycell">&sum; = {{sums.image_ping}}</th>
            <th class="graycell">&sum; = {{sums.service_up}}</th>
            <th class="graycell">&sum; = {{sums.router_pingonce}}</th>
            <th class="graycell">&sum; = {{sums.image_pingonce}}</th>
            <th class="graycell">&sum; = {{sums.service_uponce}}</th>
            </tr>
        {% for team in result %}
            <tr>
            <td> {{team.id}} </td>
            <td class="namecell"> {{team.name}} </td>
            {% if team.router_ping is not none %}
            <td title="{{team.router_ip}}" class="yesnocell yescell"> {{team.router_ping}}ms </td>
            {% else %}
            <td title="{{team.router_ip}}" class="yesnocell nocell">  </td>
            {% endif %}
            {% if team.image_ping is not none %}
            <td title="{{team.image_ip}}" class="yesnocell yescell"> {{team.image_ping}}ms </td>
            {% else %}
            <td title="{{team.image_ip}}" class="yesnocell nocell">  </td>
            {% endif %}
            {% if team.service_up is not none %}
            <td title="{{team.image_ip}}:31337" class="yesnocell yescell"> {{team.service_up}}ms </td>
            {% else %}
            <td title="{{team.image_ip}}:31337" class="yesnocell nocell">  </td>
            {% endif %}
            {% if team.router_pingonce %}
            <td title="{{team.router_ip}}" class="yesnocell yescell">  </td>
            {% else %}
            <td title="{{team.router_ip}}" class="yesnocell nocell">  </td>
            {% endif %}
            {% if team.image_pingonce %}
            <td title="{{team.image_ip}}" class="yesnocell yescell">  </td>
            {% else %}
            <td title="{{team.image_ip}}" class="yesnocell nocell">  </td>
            {% endif %}
            {% if team.service_uponce %}
            <td title="{{team.image_ip}}:31337" class="yesnocell yescell">  </td>
            {% else %}
            <td title="{{team.image_ip}}:31337" class="yesnocell nocell">  </td>
            {% endif %}
            </tr>
        {% endfor %}
        </table>
    </body>
</html>
