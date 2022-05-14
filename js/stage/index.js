function history() {
    return $('#say').data('history').split(' ').filter(word => word !== '');
}

let debug = false;
let states = ['hello']

let conditions = {
    "hello": {
        trigger: (v) => ["bonjour", "salut", "hello"].includes(v),
        action: () => say('hello'),
        msg: [
            "Un renseignement ???"
        ],
        next: ['recidieu', 'livre', 'isekai'],
    },
    "livre": {
        trigger: (v) => ["livre", "règle", "manuel", "sorts"].includes(v),
        action: () => say('livre'),
        msg: [
            "J'ai en ma possession un ouvrage qui pourrait correspondre à votre demande.",
            "Il s'agit d'un supplément aux règles de base de D&D5 (Donjon et Dragon 5e édition).",
            "Voulez-vous y jeter un coup d'oeil ?",
        ],
        next: ['oui', 'non'],
        go: 'https://www.gdfl.be/wp-content/uploads/2018/10/DD5-Races-Classes.pdf',
    },
    "recidieu": {
        trigger: (v) => ["recidieu"].includes(v),
        action: () => say('recidieu', reset),
        msg: ["Le petit gnome ?",
            "Qui se promène toujours avec sa lyre ?",
            "C'est surprenant que vous me parliez de lui ...",
            "C'est comment dire ...",
            "Je ne sais pas, je vais me pencher sur le sujet, revenez plus tard !"],
    },
    "isekai": {
        trigger: (v) => ["isekai", "autre monde"].includes(v),
        action: () => say('isekai'),
        msg: ['Isekai signifie les "autres mondes" ou "monde parallèle"',
            "J'ai quelques références à vous conseiller.",
            "Je peux vous montrer ?",
        ],
        go: 'https://docs.google.com/document/d/1GuiKf34OjyZl6V7ORNPeUScA_yLbLeMbRbviBuIRGAU/edit?usp=sharing',
        next: ["oui", "non"]
    },
    "oui": {
        trigger: (v) => ["oui", "ok", "c'est parti"].includes(v),
        action: () => oui(),
    },
    "non": {
        trigger: (v) => ["non", "bof"].includes(v),
        action: () => say('non', reset),
        msg: ['Hmm 🤔... Une autre fois peut-être ?'],
    }
}

function oui() {
    let cond = $('#say').data('history');
    if (conditions[cond].go) {
        window.location.href = conditions[cond].go
    }
}

function reset(){
    states = ['hello']
    setTimeout( () => understand('hello'), 500)
}

function say(speechKey, then) {
    $('#say').prop("disabled", true)
    $('#say').data('history', speechKey)
    let aText = conditions[speechKey].msg
    let iSpeed = 25; // time delay of print out
    let iIndex = 0; // start printing array at this posision
    let iArrLength = aText[0].length; // the length of the text array
    let iScrollAt = 20; // start scrolling up at this many lines

    let iTextPos = 0; // initialise text position
    let sContents = ''; // initialise contents letiable
    let iRow; // initialise current row

    let timerId = 0

    function type() {
        sContents = ' ';
        iRow = Math.max(0, iIndex - iScrollAt);
        let destination = document.getElementById("hearing");

        while (iRow < iIndex) {
            sContents += aText[iRow++] + '<br />';
        }
        destination.innerHTML = sContents + aText[iIndex].substring(0, iTextPos) + "";
        if (iTextPos++ == iArrLength) {
            iTextPos = 0;
            iIndex++;
            if (iIndex != aText.length) {
                iArrLength = aText[iIndex].length;
                timerId = setTimeout(type, 500);
            } else {
                $('#say').prop("disabled", false)
                $('#say').val('')
                if (then) {
                    then()
                }
            }
        } else {
            timerId = setTimeout(type, iSpeed);
        }
    }

    type()
}

function understand(v) {
    Object.keys(conditions)
        .filter(k => debug || states.includes(k))
        .forEach((key) => {
            if (conditions[key].trigger(v)) {
                if (conditions[key].next) {
                    states = conditions[key].next
                }
                conditions[key].action()
            }
        })
}

$(document).ready(function () {

    console.log("ready!");
    $('#say').keyup(_ => {
        const v = $('#say').val()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        understand(v);
    })
});