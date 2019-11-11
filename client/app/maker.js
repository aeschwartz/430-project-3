let csrf; // don't create an accessible variable for this

const handleDomo = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($("#domoName").val() == '' || $("#domoAge").val() == '' || $("#domoTeeth").val() == '') {
        handleError("RAWR! All fields are required");
        return false;
    }

    console.log($("input[name=_csrf]").val());

    sendAjax('POST', $("#domoForm").attr('action'), $("#domoForm").serialize(), loadDomosFromServer);

    return false;
};

const editDomo = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    const form = $(e.target);

    if (form.find(".domoName>input").val() == '' || form.find(".domoAge>input").val() == '' || form.find(".domoTeeth>input").val() == '') {
        handleError("RAWR! All fields are required");
        return false;
    }

    sendAjax('POST', form.attr("action"), form.serialize(), loadDomosFromServer);

    return false;
}

const DomoForm = (props) => {
    return (
        <form id="domoForm"
            onSubmit={handleDomo}
            name="domoForm"
            action="/maker"
            method="POST"
            className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="text" name="age" placeholder="Domo Age" />
            <label htmlFor="teeth">Teeth: </label>
            <input id="domoTeeth" type="text" name="teeth" placeholder="Number of Teeth" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="makeDomoSubmit" type="submit" value="Make Domo" />
        </form>
    );
}

const DomoList = (props) => {
    if (props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos yet</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map((domo) => {
        return (
            <form action="/edit" method="POST" onSubmit={editDomo} key={domo._id} className="domo">
                <input type="hidden" name="_csrf" value={props.csrf} />
                <input type="hidden" name="_id" value={domo._id} />
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName"> Name: <input name="name" type="text" defaultValue={domo.name} /></h3>
                <h3 className="domoAge"> Age: <input name="age" type="text" defaultValue={domo.age} /></h3>
                <h3 className="domoTeeth">Teeth: <input name="teeth" type="text" defaultValue={domo.teeth} /></h3>
                <input type="submit" value="Edit Domo" />
            </form>
        );
    });

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    );
};

const loadDomosFromServer = () => {
    sendAjax('GET', '/getDomos', null, (data) => {
        ReactDOM.render(
            <DomoList csrf={csrf} domos={data.domos} />,
            document.querySelector("#domos")
        );
    });
};

const setup = () => {
    ReactDOM.render(
        <DomoForm csrf={csrf} />,
        document.querySelector("#makeDomo")
    );

    ReactDOM.render(
        <DomoList csrf={csrf} domos={[]} />,
        document.querySelector("#domos")
    );

    loadDomosFromServer();
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        csrf = result.csrfToken;
        setup();
    });
};

// window.onload
$(document).ready(getToken);