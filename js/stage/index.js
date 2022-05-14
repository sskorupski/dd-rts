function history() {
    return $('#say').data('history').split(' ').filter(word => word !== '');
}

let debug = false;
let states = ['hello']
let hello_states = ['recidieu', 'livre', 'isekai', 'monstre', 'carte', 'relate-faits']
let _say;


let conditions = {
    "hello": {
        trigger: (v) => ["bonjour", "salut", "hello"].includes(v),
        action: () => say('hello'),
        msg: [
            "Voyons voir, où en suis-je déjà ?",
            "Ha ! Voici quelques sujets sur lesquels je puis vous renseigner :",
        ].concat(hello_states.map(e => '- '+ e)),
        next: hello_states,
    },
    "sorts": {
        trigger: (v) => ["livre", "règle", "manuel", "sorts"].includes(v),
        action: () => say('sorts'),
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
    "monstre": {
        trigger: (v) => ["monstre"].includes(v),
        action: () => say('monstre'),
        msg: [
            "Il y en a beaucoup trop à mon goût.",
            "Cependant, mieux les connaitre vous permettra d'augmenter vos chances de survies.",
            "Voyons voir...",
            "Ha nous y voilà: \"Le manuel des monstres D&D 5\", une véritable encyclopédie !",
            "Je vous l'apporte ?"
        ],
        next: ['oui', 'non'],
        go: 'https://www.gdfl.be/wp-content/uploads/2018/10/DD5-Monstres.pdf'
    },
    "carte":{
        trigger: (v) => ["carte", "monde"].includes(v),
        action: () => say("carte"),
        msg:[
            "Une carte du royaume des terres Scindées ?",
            "Humm... Oui, j'ai une carte... ancienne mais suffisamment précise pour situer l'emplacement des principaux royaumes.",
            "Désirez-vous la voir ?",
        ],
        next: ["oui", "non"],
        go: 'https://drive.google.com/file/d/1kDOXRiRr2-9NGCcC4Wx0ZBsG5T2WM9b8/view?usp=sharing',
    },
    "relate-faits":{
        trigger: (v) => ["relate-faits", "résumés"].includes(v),
        action: () => say("relate-faits"),
        msg:[
            "Haha ! Vous aimez l'histoire ?",
            "J'ai pu mettre la main sur les notes d'un barde.",
            "C'est assez sommaire, mais on y retrouve les des faits, des noms de lieux et de personnages.",
            "Ça vous intéresse ?",
        ],
        next: ["oui", "non"],
        go: 'https://docs.google.com/document/d/1BP-72ZgUDZZj3-BBhTh3h-jV8g-K3FsjY0W_vS3_UhI/edit?usp=sharing'
    },
    "oui": {
        trigger: (v) => ["oui", "ok", "c'est parti"].includes(v),
        action: () => oui(),
    },
    "non": {
        trigger: (v) => ["non", "bof"].includes(v),
        action: () => say('non', reset),
        msg: ['🤔 ... Une autre fois peut-être ?'],
    }
}

function oui() {
    let cond = _say.data('history');
    if (conditions[cond].go) {
        window.location.href = conditions[cond].go
    }
}

function reset(){
    states = ['hello']
    setTimeout( () => understand('hello'), 500)
}

function say(speechKey, then) {
    _say.prop("disabled", true)
    _say.data('history', speechKey)
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
        if (iTextPos++ === iArrLength) {
            iTextPos = 0;
            iIndex++;
            if (iIndex !== aText.length) {
                iArrLength = aText[iIndex].length;
                timerId = setTimeout(type, 500);
            } else {
                _say.prop("disabled", false)
                _say.val('')
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
    _say = $('#say')
    _say.focus();
    _say.keyup(_ => {
        const v = $('#say').val()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        understand(v);
    })
    setTimeout(() => understand('hello'), 500)
});