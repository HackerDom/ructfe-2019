function initInfo() {
    const table = $("#info-table");
    const info = $.get({
        url: "/info",
        async: false
    }).responseJSON;

    for (let [key, value] of Object.entries(info)) {
        table.append(`<tr><td>${key}</td><td>${value}</td></tr>`);
    }
}
