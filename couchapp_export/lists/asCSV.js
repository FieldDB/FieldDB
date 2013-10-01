function(head, req) {
    start({
        'headers': {
            'Content-Type': 'text/csv'
        }
    });
    Array.prototype.unique = function() {
        var a = this.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j, 1);
            }
        }

        return a;
    };

    var getheaders = function(name, value, parent) {
        var ret = "";
        if (typeof(value) == "object") {
            for (var x in value) {
                var family = name;
                if (parent != "") family = parent + "." + name;
                ret = ret + getheaders(x, value[x], family);
            }
        } else {
            if (!isNaN(name)) {
                ret = ret + parent + "[" + name + "],";
            } else {
                if (parent != "") {
                    ret = ret + parent + "." + name + ",";
                } else {
                    ret = ret + name + ",";
                }
            }
        }

        return ret;
    };
    var tocsv = function(therow, heads) {
        var ret = '';
        for (var h in heads) {
            var prop = heads[h].toString().replace(/\[/gi, "'][");
            prop = "['" + prop.replace(/\./gi, "']['");
            if (prop.charAt(prop.length - 1) !== ']') {
                prop = prop + "']";
            }
            var cmd = 'therow' + prop;
            var valor;
            try {
                valor = eval(cmd);
                valor = valor.toString().replace(/, /gi, ' ');
                valor = valor.toString().replace(/(\r\n|\n|\r)/gm, '');
            } catch (er) {
                valor = '';
            }
            ret = ret + valor + ',';
        }
        return ret;
    };

    var row;
    var rows = [];
    var headers = [];
    var muestra = 100;
    var cnt = 1;
    var yasalio = false;

    while (row = getRow()) {
        if (cnt < muestra) {
            header = getheaders("", row, "");
            header = (header.charAt(header.length - 1) === ',') ? header.slice(0, -1) : header;
            header = header.split(',');
            headers = headers.concat(header).unique();
            rows.push(row);
        } else {
            if (cnt == muestra) {
                send(headers.join() + "\n");
                for (var x in rows) {
                    send(tocsv(rows[x], headers) + "\n");
                }
            }
            send(tocsv(row, headers) + "\n");
            yasalio = true;
        }
        cnt = cnt + 1;
    }
    if (!yasalio) {
        send(headers.join() + "\n");
        for (var x in rows) {
            send(tocsv(rows[x], headers) + "\n");
        }
    }
    return "";
}