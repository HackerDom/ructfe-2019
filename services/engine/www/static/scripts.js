const MAX_SIZE = 64 * 1024;

function upload() {
    var input = document.getElementsByName('fuel')[0];

    if (!input.files.length) {
        return;
    }

    var fuel = input.files[0];

    if (fuel.size >= MAX_SIZE) {
        alert('File is too big!');
        return;
    }

    var reader = new FileReader();

    reader.onload = function(e)
    {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload/', true);

        xhr.onload = function() {
            if (this.status == 200) {
                window.location.href = '/check/?' + this.response;
            }
            else {
                alert('Error.');
            }
        }

        xhr.send(e.target.result);
    };

    reader.readAsBinaryString(fuel);
}

function list() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/list/', true);

    xhr.onload = function() {
        if (this.status != 200) {
            alert('Error.');
            return;
        }
        
        var fuel_ids = this.response.split('\n');
        var container = document.getElementById('list');
        
        for (var fuel_id of fuel_ids) {
            if (fuel_id.length == 0) {
                continue;
            }
            
            var link = document.createElement('a');
            link.className = 'link';
            link.href = '/check/?' + fuel_id;
            link.innerText = fuel_id;
            
            var li = document.createElement('li');
            li.appendChild(link);
            
            container.appendChild(li);
        }
        
        container.firstElementChild.remove();
    }

    xhr.send();
}

function check() {
    var fuel_id = document.getElementsByName('fuel_id')[0].value;
    var property = document.getElementsByName('property')[0].value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/check/?' + encodeURIComponent(fuel_id), true);

    xhr.onload = function() {
        if (this.status != 200) {
            alert('Error.');
            return;
        }
        
        var result = document.getElementById('result');
        result.innerText = this.response;
    }

    xhr.send(property);
}

function load_fuel_id() {
    var query = window.location.search;
    var fuel_id = document.getElementsByName('fuel_id')[0];

    if (query.length > 1) {
        fuel_id.value = query.substring(1);
    }
}
