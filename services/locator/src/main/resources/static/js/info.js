function initInfo() {
    const table = $("#info-table");
    const info = $.get({
        url: "/info",
        async: false
    }).responseJSON;

    let index = 1;
    for (let [key, value] of Object.entries(info)) {
        const nameId = `filed-name-${index}`;
        const valueId = `filed-value-${index}`;
        table.append(`<tr><td id="${nameId}"></td><td id="${valueId}"></td></tr>`);
        $(`#${nameId}`).text(key);
        $(`#${valueId}`).text(value);
        index++;
    }
}
