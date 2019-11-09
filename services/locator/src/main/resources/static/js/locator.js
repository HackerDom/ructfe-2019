const FIELD_SIZE = 100;
let sonars = {};


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static random() {
        return new Point(randInt(0, FIELD_SIZE), randInt(0, FIELD_SIZE));
    }
}


class Sonar {
    constructor(context, coordinates, size, animationSpeed, uniqNumber) {
        this.context = context;
        this.coordinates = coordinates;
        this.obj = Sonar.createSonarObj("sonar-" + uniqNumber.toString());
        this.moveTo(this.coordinates);
        this.setAnimationSpeed(animationSpeed);
        this.setSize(size);
    }

    static createSonarObj(sonarId) {
        let body = $('#body');
        body.append("<div class='sonar' id='" + sonarId + "'></div>");
        return $("#" + sonarId);
    }

    setSize(size) {
        this.obj.css("width", size.toString() + "px");
        this.obj.css("height", size.toString() + "px");
    }

    getSize(property) {
        const propObj = this.obj.css(property);
        return parseInt(propObj.substring(0, propObj.length));
    }

    move(delta) {
        this.coordinates.x += delta.x;
        this.coordinates.y += delta.y;
        this.moveTo(this.coordinates);
    }

    moveTo(point) {
        this.coordinates.x = (FIELD_SIZE + point.x) % FIELD_SIZE;
        this.coordinates.y = (FIELD_SIZE + point.y) % FIELD_SIZE;

        let sonarWidth = this.getSize("width");
        let sonarHeight = this.getSize("height");

        const coordinates = this.context.getRealCoordinates(point);

        this.obj.css("left", (coordinates.x - sonarWidth / 2).toString() + "px");
        this.obj.css("top", (coordinates.y - sonarHeight / 2).toString() + "px");
    }

    setAnimationSpeed(animationSpeed) {
        const normalizedAnimationSpeed = 0.5 + animationSpeed * 5;
        const strAnimation = "sonar-effect " + normalizedAnimationSpeed.toString() + "s infinite";
        this.obj.css("animation", strAnimation)
    }
}


class Context {
    constructor(m) {
        this.height = document.body.clientHeight;
        this.width = document.body.clientWidth;
        this.m = m;
    }

    getPointerLength() {
        return Math.min(this.height, this.width) - this.m
    }

    setPointer() {
        let pointer = $("#pointer");
        let pointerLength = this.getPointerLength();
        pointer.css("width", pointerLength);
        pointer.css("left", this.width / 2 - pointerLength / 2);
        pointer.css("top", this.height / 2);
    }

    setCircle(obj, radius) {
        obj.css("width", radius.toString() + "px");
        obj.css("height", radius.toString() + "px");
        obj.css("left", this.width / 2 - radius / 2);
        obj.css("top", this.height / 2 - radius / 2);
    }

    setSquare() {
        const square = $("#square");
        square.css("top", (this.height / 2 - this.getPointerLength() / 2).toString());
        square.css("left", (this.width / 2 - this.getPointerLength() / 2).toString() + "px");
        square.css("width", this.getPointerLength() + "px");
        square.css("height", this.getPointerLength() + "px");
    }

    getRealCoordinates(point) {
        const zeroX = this.width / 2 - this.getPointerLength() / 2;
        const zeroY = this.height / 2 - this.getPointerLength() / 2;
        const k = 1.0 * this.getPointerLength() / FIELD_SIZE;
        return new Point(Math.round(zeroX + k * point.x + k / 2), Math.round(zeroY + k * point.y + k / 2));
    }
}


function randInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}


function initDraw() {
    let context = new Context(10);
    context.setPointer();

    for (let i = 1; i <= 5; i++) {
        let circle = $("#c" + i.toString());
        context.setCircle(circle, context.getPointerLength() * i / 5);
    }
    context.setSquare();

    const users = $.get({
        url: "/users",
        async: false
    }).responseJSON;
    users.forEach(function (user) {
        sonars[user.id] = new Sonar(context, new Point(user.x, user.y), 20, 1, user.id);
    });

    $("#square").on("click", function (e) {
        console.log(sonars[1]);
        sonars[1].move(new Point(1, 0));
        console.log(sonars[1]);
    });

    setInterval(function () {
        sonars[1].move(new Point(1, 0));
    }, 3000);
}
