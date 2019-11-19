const setup = () => {
    const elements = $("form>[name]:not([type=hidden]");
    const csrf = $("[name=_csrf]");
    elements.each((index, el) => {
        el.addEventListener("change", (e) => {
            const data = `${el.name}=${el.value}&_csrf=${csrf.val()}`;
            sendAjax('POST', '/settings', data, () => {
                location.reload();
            });
        });
    });

    const selects = $("form>select");
    selects.each((index, el) => {
        el = $(el);
        if(!el.attr("value")) return;
        const selectVal = el.attr("value");
        el.find(`option[value='${selectVal}']`)[0].selected = true;
    })
};

$(document).ready(setup);

