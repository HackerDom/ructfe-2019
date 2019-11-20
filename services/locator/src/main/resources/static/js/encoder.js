function pack(a, b) {
    return a === "b" ? [b] : [Math.floor(b / 256), b % 256];
}


function toUTF8Array(str) {
    let utf8 = [];
    for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        } else {
            i++;
            charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}


function gen(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function make_class(field_names) {
    let className = gen(32);

    let constant_pool = [null, ["a", [3, 13]], ["b", 14],
        ["b", 15], ["c", ['<init>', 4]],
        ["c", ['()V', 5]], ["c", ['Code', 6]],
        ["c", ['', 7]], ["c", ['', 8]],
        ["c", ['this', 9]], ["c", ['L' + className + ";", 10]],
        ["c", ['', 11]], ["c", ['', 12]],
        ["d", [4, 5]], ["c", [className, 14]],
        ["c", ['java/lang/Object', 15]]];

    let fields = [];

    field_names.forEach(function (field_name) {
        constant_pool.push(["c", [field_name, constant_pool.length - 1]]);
    });

    constant_pool.push(["c", ["Ljava/lang/String;", constant_pool.length - 1]]);

    for (let i = 0; i < field_names.length; i++) {
        fields.push([1, constant_pool.length - 2 - i, constant_pool.length - 1])
    }

    let buffer = [];

    buffer.push([202, 254, 186, 190, 0, 0, 0, 52]);

    buffer.push(pack("", constant_pool.length));

    for (let i = 1; i < constant_pool.length; i++) {
        let constant = constant_pool[i];
        if (constant[0] === "c") {
            buffer.push(pack("b", 1));
            buffer.push(pack("", constant[1][0].length));
            buffer.push(toUTF8Array(constant[1][0]));
        } else if (constant[0] === "b") {

            buffer.push(pack("b", 7));
            buffer.push(pack("", constant[1]));
        } else if (constant[0] === "d") {
            buffer.push(pack("b", 12));
            buffer.push(pack("", constant[1][0]));
            buffer.push(pack("", constant[1][1]));
        } else if (constant[0] === "a") {
            buffer.push(pack("b", 10));
            buffer.push(pack("", constant[1][0]));
            buffer.push(pack("", constant[1][1]));
        }
    }

    buffer.push([0, 33, 0, 2, 0, 3, 0, 0]);

    buffer.push(pack("", fields.length));

    fields.forEach(function (field) {

        buffer.push(pack("", field[0]));
        buffer.push(pack("", field[1]));
        buffer.push(pack("", field[2]));
        buffer.push(pack("", 0))
    });

    buffer.push([0, 1, 0, 1, 0, 4, 0, 5, 0, 1, 0, 6, 0, 0, 0, 47, 0, 1, 0, 1, 0, 0, 0, 5, 42, 183, 0, 1, 177, 0, 0, 0, 2, 0, 7, 0, 0, 0, 6, 0, 1, 0, 0, 0, 3, 0, 8, 0, 0, 0, 12, 0, 1, 0, 0, 0, 5, 0, 9, 0, 10, 0, 0, 0, 1, 0, 11, 0, 0, 0, 2, 0, 12]);
    let res = [];
    buffer.forEach(function (line) {
        res.push(...line);

    });
    return res;
}
