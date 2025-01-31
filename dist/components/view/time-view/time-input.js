import { get } from "svelte/store";

function timeInput(node, store) {
    node.addEventListener("keydown", types);
    node.addEventListener("focus", resetTime);
    node.addEventListener("blur", attemptValuePersist);

    let time;

    const unsubscribe = store.subscribe((given) => {
        time = given.split("");
        syncInput();
    });

    function syncInput() {
        node.value = time.join("");
    }

    function resetTime() {
        time = [];
        syncInput();
    }

    function persistTime() {
        store.set(time.join(""));
        syncInput();
    }

    function attemptValuePersist() {
        if (time.digits === 5) {
            persistTime();
            return;
        }

        time = get(store).split("");
        syncInput();
    }

    function types(e) {
        e.preventDefault();
        const k = e.key;

        const nk = Number(k);
        if (nk >= 0 && nk <= 9) {
            addDigit(nk);
        }

        if (k === "Backspace") {
            backspaceDigit();
        }
        if (k === "Delete") {
            resetTime();
        }
    }

    function backspaceDigit() {
        time.pop();
        time.length === 3 && time.pop();
        syncInput();
    }

    function isInvalidDigit(digit) {
        const tooManyDigits = time.length > 4;
        const invalidFirstDigit =
            time.length === 0 && ![0, 1, 2].includes(digit);
        const invalidSecondDigit =
            time.length === 1 && time[0] === 2 && digit > 3;
        const invalidThirdDigit =
            (time.length === 2 || time.length === 3) && digit > 5;
        return (
            tooManyDigits ||
            invalidFirstDigit ||
            invalidSecondDigit ||
            invalidThirdDigit
        );
    }

    function addDigit(digit) {
        if (isInvalidDigit(digit)) {
            return;
        }

        time.length === 2 && time.push(":");
        time.push(digit);
        time.length === 2 && time.push(":");

        if (time.length === 5) {
            persistTime();
            node.blur();
        }

        syncInput();
    }

    return {
        destroy() {
            unsubscribe();
            node.removeEventListener("keydown", types);
            node.removeEventListener("focus", resetTime);
            node.removeEventListener("blur", attemptValuePersist);
        },
    };
}

export { timeInput };
