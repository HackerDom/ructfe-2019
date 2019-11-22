const FIELD_SIZE = 80;
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


function getSize(obj, property) {
    const propObj = obj.css(property);
    return parseInt(propObj.substring(0, propObj.length));
}

class Sonar {
    constructor(context, coordinates, size, animationSpeed, uniqNumber, color) {
        this.context = context;
        this.coordinates = coordinates;
        this.obj = Sonar.createSonarObjIfNotExist("sonar-" + uniqNumber.toString());
        this.uniqNumber = uniqNumber;
        this.setAnimationSpeed(animationSpeed);
        this.setSize(size);
        if (color !== null) {
            this.setColor(color);
        }
        this.moveTo(this.coordinates);
    }

    static createSonarObjIfNotExist(sonarId) {
        if (!$("#" + sonarId).length) {
            let body = $('#body');
            body.append("<div class='sonar' id='" + sonarId + "'></div>");
        }
        return $("#" + sonarId);
    }

    setSize(size) {
        this.obj.css("width", size.toString() + "px");
        this.obj.css("height", size.toString() + "px");
    }

    setColor(color) {
        this.obj.css("background", "#" + color);
    }

    move(delta) {
        this.coordinates.x += delta.x;
        this.coordinates.y += delta.y;
        this.moveTo(this.coordinates);
    }

    moveTo(point) {
        this.coordinates.x = (FIELD_SIZE + point.x) % FIELD_SIZE;
        this.coordinates.y = (FIELD_SIZE + point.y) % FIELD_SIZE;

        let sonarWidth = getSize(this.obj, "width") / 2;
        let sonarHeight = getSize(this.obj, "height") / 2;

        const coordinates = this.context.getRealCoordinates(point);

        this.obj.css("left", (coordinates.x - sonarWidth).toString() + "px");
        this.obj.css("top", (coordinates.y - sonarHeight).toString() + "px");
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
        return Math.min(this.height, this.width) - this.m;
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

    getSquareTop() {
        return this.height / 2 - this.getPointerLength() / 2;
    }

    getSquareLeft() {
        return this.width / 2 - this.getPointerLength() / 2;
    }

    setSquare() {
        const square = $("#square");
        square.css("top", this.getSquareTop().toString() + "px");
        square.css("left", this.getSquareLeft().toString() + "px");
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


function logout() {
    location.href = "/logout";
}


function info() {
    location.href = "/info_page";
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
        sonars[user.id] = new Sonar(context, new Point(user.x, user.y), user.size, user.speed, user.id, user.color);
    });

    const userLabel = $("#user-label");
    userLabel.css("left", (context.getSquareLeft() + context.getPointerLength() - getSize(userLabel, "width")).toString() + "px");

    const logoutBtn = $("#logout-btn");
    logoutBtn.css("left", (context.getSquareLeft() + context.getPointerLength() - getSize(logoutBtn, "width") - 10).toString() + "px");
    logoutBtn.css("top", getSize(userLabel, "height") + 4);
    logoutBtn.on("click", logout);

    const infoBtn = $("#info-btn");
    infoBtn.css(
        "left",
        (context.getSquareLeft() +
            context.getPointerLength() -
            getSize(infoBtn, "width") - getSize(logoutBtn, "width") - 20
        ).toString() + "px"
    );
    infoBtn.css("top", getSize(userLabel, "height") + 4);
    infoBtn.on("click", info);
}


function init() {
    window.onresize = initDraw;
    initDraw();
}
