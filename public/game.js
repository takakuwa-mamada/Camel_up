// socket.ioのクライアント接続
const socket = io(); // サーバー側のioと接続
const board = document.getElementById("board");
const drawnDiceContainer = document.getElementById("Roll_Dice");
const chatWindow = document.getElementById("chatWindow");

function adjustScale() {
    const originalWidth = 1400;  // デザインの基準幅
    const scale = window.innerWidth / originalWidth;
    document.body.style.transform = `scale(${scale})`;
    document.body.style.transformOrigin = '0 0';
    document.body.style.width = `${originalWidth}px`; // 元の幅を維持
}

// ページの読み込み時とリサイズ時に縮小を調整
window.addEventListener('load', adjustScale);
window.addEventListener('resize', adjustScale);

//背景暗くする処理
document.addEventListener("DOMContentLoaded", function () {
    const boxHoverElements = document.querySelectorAll('.box_hover'); // .box_hover を取得
    const backGray = document.querySelector('.backgray'); // 背景暗くする要素を取得

    boxHoverElements.forEach(function (element) {
        element.addEventListener('mouseenter', function () {
            backGray.style.display = 'block'; // 背景を表示
        });

        element.addEventListener('mouseleave', function () {
            backGray.style.display = 'none'; // 背景を非表示
        });
    });
});

// 4人集まるまでボタン無効化(高鍬)
// document.getElementById('startButton').disabled = true;

const camels = [
    { image: "camellist/redCamel.png", position: 1, startposition: 1, heightposition: 0, startheightposition: 0 }, //赤
    { image: "camellist/blueCamel.png", position: 1, startposition: 1, heightposition: 1, startheightposition: 1 }, //青
    { image: "camellist/greenCamel.png", position: 3, startposition: 3, heightposition: 0, startheightposition: 0 }, //緑
    { image: "camellist/yellowCamel.png", position: 1, startposition: 1, heightposition: 2, startheightposition: 2 }, //黄
    { image: "camellist/purpleCamel.png", position: 2, startposition: 2, heightposition: 0, startheightposition: 0 }, //紫
    { image: "camellist/whiteCamel.png", position: 16, startposition: 16, heightposition: 0, startheightposition: 0 }, //白
    { image: "camellist/blackCamel.png", position: 15, startposition: 15, heightposition: 0, startheightposition: 0 }, //黒
];
// 追加(高鍬)
// 色名とインデックスのマッピング
const camelColorMap = {
    red: 0,
    blue: 1,
    green: 2,
    yellow: 3,
    purple: 4,
    white: 5, 
    black: 6  
};


function move() {
    const diceRoll = rollDice(); // サイコロを振る
    const randomCamelIndex = Math.floor(Math.random() * camels.length);
    camels[randomCamelIndex].position += diceRoll; // ラクダを移動させる
    return diceRoll; // サイコロの結果を返す
}
const commands = [
    [
        { word: "▶サイコロをふる" },
        { word: "▶投票チケットをとる" },
        { word: "▶観客タイルを置く" },
        { word: "▶順位予想をする" },
    ],
    [
        { word: "▶赤" },
        { word: "▶青" },
        { word: "▶緑" },
        { word: "▶黄" },
        { word: "▶紫" },
        { word: "▶戻る" },
    ],
    [
        { word: "▶+1タイル" },
        { word: "▶-1タイル" },
        { word: "▶戻る" },
    ],
    [
        { word: "▶1位予想" },
        { word: "▶最下位予想" },
        { word: "▶戻る" },
    ],
];

const tickets = [
    [
        { image: "ticketlist/ticket_red_3.png" },
        { image: "ticketlist/ticket_red_3.png" },
        { image: "ticketlist/ticket_red_2.png" },
        { image: "ticketlist/ticket_red_1.png" },
    ],
    [
        { image: "ticketlist/ticket_blue_3.png" },
        { image: "ticketlist/ticket_blue_3.png" },
        { image: "ticketlist/ticket_blue_2.png" },
        { image: "ticketlist/ticket_blue_1.png" },
    ],
    [
        { image: "ticketlist/ticket_green_3.png" },
        { image: "ticketlist/ticket_green_3.png" },
        { image: "ticketlist/ticket_green_2.png" },
        { image: "ticketlist/ticket_green_1.png" },
    ],
    [
        { image: "ticketlist/ticket_yellow_3.png" },
        { image: "ticketlist/ticket_yellow_3.png" },
        { image: "ticketlist/ticket_yellow_2.png" },
        { image: "ticketlist/ticket_yellow_1.png" },
    ],
    [
        { image: "ticketlist/ticket_purple_3.png" },
        { image: "ticketlist/ticket_purple_3.png" },
        { image: "ticketlist/ticket_purple_2.png" },
        { image: "ticketlist/ticket_purple_1.png" },
    ],
];

const remaindices = [
    { image: "dicelist/dice_red.png", word: "reddice" },
    { image: "dicelist/dice_blue.png", word: "bluedice" },
    { image: "dicelist/dice_green.png", word: "greendice" },
    { image: "dicelist/dice_yellow.png", word: "yellowdice" },
    { image: "dicelist/dice_purple.png", word: "purpledice" },
    { image: "dicelist/dice_gray.png", word: "graydice" },
];

const dicemovie = [ //gifファイル作成途中．現在5個まで終わっており，残り16個．ただ，gifファイルが重い
    [
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_2.gif" },
        { movie: "dicemovie/reddice_3.gif" },
    ],
    [
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/bluedice_2.gif" },
        { movie: "dicemovie/bluedice_3.gif" },
    ],
    [
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
    ],
    [
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
    ],
    [
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
    ],
    [
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
    ],
    [
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
        { movie: "dicemovie/reddice_1.gif" },
    ],
]

const app = new Vue({
    el: "#app",
    data: {
        cells: Array(16).fill().map((_, index) => index + 1), //マス目
        camels: camels,
        commands: commands,
        command_flag: 0, //表示するコマンドを決定
        tickets: tickets,
        ticket_flag: [4, 4, 4, 4, 4], //前から赤、青、緑、黄、紫のチケットの残り枚数
        playerticket: [[], [], [], []],
        remaindices: remaindices,
        dice_flag: [0, 0, 0, 0, 0, 0], //前から赤、青、緑、黄、紫、灰のサイコロが残っているかどうか。0ならある。1ならない。
        dicemovie: dicemovie,
        remaindice_count: 0,
        startflag: 1,
        tile_flag: 0, //0ならSelectTileは起動しない。1だと+1タイル、2だと-1タイル選択
        tile_color: Array(16).fill(null),

        topforecast_count: 0, //今一位予想が何枚あるのか
        bottomforecast_count: 0,//今最下位予想が何枚あるのか

        playerturn: 1,//自分のターンでは1、それ以外では0とし、自分のターン以外ではコマンドが出ないようにする
        gif: "",
    },
    methods: {
        PlayerTurn() {
            if (this.playerturn == 4) {
                this.playerturn = 1;
            }
            else {
                this.playerturn += 1;
            }
        },

        SoundEffect() { //コマンド押したときの効果音
            const sound = new Audio("sound_effect.mp3");
            sound.volume = 0.3;
            sound.play();
        },

        DiceMovie(color, number) { //サイコロ転がるアニメーション
            this.gif = this.dicemovie[color][number - 1].movie;
            setTimeout(() => {
                this.gif = "";
                setTimeout(() => {
                    this.gif = "transparency.png"; // リセット用の透明画像に戻す
                }, 50);
            }, 6000);
        },

        Rollreset() { //チェック用　後で消す
            for (let i = 0; i < 7; i++) {
                this.$set(this.dice_flag, i, 0);
            }
            this.remaindice_count = 0;
        },

        RollDice(dicecolor,number) { //サイコロを振った時の処理
            // console.log(remaindice_count);
            while (this.remaindice_count <= 4) {
                console.log(dicecolor)
                console.log(number)
                // colorが文字列の場合、インデックスに変換する
                if (typeof dicecolor === 'string') {
                    color = camelColorMap[dicecolor];
                }
                console.log(color);
                if (this.dice_flag[color] === 0) {
                    //this.DiceMovie(dicecolor, dicenumber);
                    setTimeout(() => {
                        this.CamelMove(color, number);
                        if (this.tile_color[camels[color].position - 1] === "#0f0") { //緑タイルを踏んだ時
                            setTimeout(() => {
                                this.CamelMove(color, 1);
                            }, 5000);
                        }
                        else if (this.tile_color[camels[color].position - 1] === "#f00") { //赤タイルを踏んだ時
                            setTimeout(() => {
                                this.MinusMove(color);
                            }, 2500);
                        }
                        if (color !== 6) {
                            this.$set(this.dice_flag, color, 1);
                        }
                        else {
                            this.$set(this.dice_flag, 5, 1);
                        }
                        this.remaindice_count += 1;
                        this.PlayerTurn();
                    }, 5000);
                    break;
                }
                else {
                    continue;
                }
            }
            if (this.remaindice_count == 5) {
                this.Rollreset();
            }
        },

        CommandClick(command_word) { //各コマンドを押したときの処理
            // this.SoundEffect();
            if (this.command_word == "joinButton"){

            }
            if (this.command_flag == 0) {
                if (command_word === commands[0][0]) {
                    // document.getElementById(command_word)("click", (e) => {
                    socket.emit("rollDice");
                    e.preventDefault();
                    e.stopPropagation();
                    
                }
                else if (command_word === commands[0][1]) {
                    this.command_flag = 1;
                }
                else if (command_word === commands[0][2]) {
                    this.command_flag = 2;
                }
                else {
                    this.command_flag = 3;
                }
            }
            else if (this.command_flag == 1) {
                if (command_word === commands[1][5]) {
                    this.command_flag = 0;
                }
                else {
                    if (command_word === commands[1][0]) {
                        this.ticket_flag[0] -= 1;
                        this.playerticket[this.playerturn - 1].push(this.tickets[0][this.ticket_flag[0]].image);
                    }
                    else if (command_word === commands[1][1]) {
                        this.ticket_flag[1] -= 1;
                        this.playerticket[this.playerturn - 1].push(this.tickets[1][this.ticket_flag[1]].image);
                    }
                    else if (command_word === commands[1][2]) {
                        this.ticket_flag[2] -= 1;
                        this.playerticket[this.playerturn - 1].push(this.tickets[2][this.ticket_flag[2]].image);
                    }
                    else if (command_word === commands[1][3]) {
                        this.ticket_flag[3] -= 1;
                        this.playerticket[this.playerturn - 1].push(this.tickets[3][this.ticket_flag[3]].image);
                    }
                    else if (command_word === commands[1][4]) {
                        this.ticket_flag[4] -= 1;
                        this.playerticket[this.playerturn - 1].push(this.tickets[4][this.ticket_flag[4]].image);
                    }
                    this.PlayerTurn();
                }
            }
            else if (this.command_flag == 2) {
                if (command_word === commands[2][0]) {
                    this.tile_flag = 1;
                }
                else if (command_word === commands[2][1]) {
                    this.tile_flag = 2;
                }
                else if (command_word === commands[2][2]) {
                    this.command_flag = 0;
                }
            }
            else if (this.command_flag == 3) {
                if (command_word === commands[3][0]) {
                    this.command_flag = 4;
                }
                else if (command_word === commands[3][1]) {
                    this.command_flag = 4;
                }
                else if (command_word === commands[3][2]) {
                    this.command_flag = 0;
                }
            }
            else if (this.command_flag == 4) {
                if (command_word === commands[1][5]) {
                    this.command_flag = 3;
                }
                else {
                    if (command_word === commands[1][0]) {
                    }
                    else if (command_word === commands[1][1]) {
                    }
                    else if (command_word === commands[1][2]) {
                    }
                    else if (command_word === commands[1][3]) {
                    }
                    else if (command_word === commands[1][4]) {
                    }
                    this.PlayerTurn();
                }
            }
        },

        SelectTile(mass_index) {
            if (this.tile_flag !== 0) {
                const targetmass = document.getElementById(`mass-${mass_index + 1}`);
                if (!targetmass) return;

                const tilecolor = this.tile_color[mass_index];
                if (tilecolor !== null) return;

                if (this.tile_flag === 1) {
                    if (targetmass) {
                        targetmass.style.background = "#0f0";
                        this.tile_color[mass_index] = "#0f0";
                        this.tile_color[mass_index - 1] = "";
                        this.tile_color[mass_index + 1] = "";
                    }
                }
                else if (this.tile_flag === 2) {
                    if (targetmass) {
                        targetmass.style.background = "#f00";
                        this.tile_color[mass_index] = "#f00";
                        this.tile_color[mass_index - 1] = "";
                        this.tile_color[mass_index + 1] = "";
                    }
                }
                this.tile_flag = 0;
            }
        },

        HoverTile(mass_index) {
            if (this.tile_flag !== 0) {
                const targetmass = document.getElementById(`mass-${mass_index + 1}`);
                if (!targetmass) {
                    return;
                }
                const tilecolor = this.tile_color[mass_index];
                if (tilecolor === null) {
                    if (this.tile_flag === 1) {
                        if (targetmass) {
                            targetmass.style.background = "#0f0";

                        }
                    }
                    else if (this.tile_flag === 2) {
                        if (targetmass) {
                            targetmass.style.background = "#f00";
                        }
                    }
                }
            }
        },

        LeaveTile(mass_index) {
            if (this.tile_flag !== 0) {
                const targetmass = document.getElementById(`mass-${mass_index + 1}`);
                if (!targetmass) return;

                const tilecolor = this.tile_color[mass_index];
                if (tilecolor !== null) {
                    targetmass.style.background = tilecolor;
                }
                else {
                    targetmass.style.background = "";
                }
            }
        },

        StartPosition(color) { //駒の初期位置決定
            const mass_size_side = 80;
            const mass_size_warp = 50;
            const camel_size = 60;

            for (let mass = 0; mass < 16; mass++) {
                if (camels[color].startposition == mass + 1) {
                    if (color !== 5 && color !== 6) {
                        return {
                            top: `${(mass_size_warp - camel_size) / 2 - camels[color].startheightposition * 25}px`,
                            left: `${mass_size_side * mass + (mass_size_side - camel_size) / 2}px`,
                        };
                    }
                    else {
                        return {
                            top: `${(mass_size_warp - camel_size) / 2 - camels[color].startheightposition * 25}px`,
                            left: `${(mass_size_side * mass + (mass_size_side - camel_size) / 2) - 5}px`,
                        };
                    }
                }
            }
        },
        // CamelMove(color, newnumber) { //駒のアニメーション
        
        //     const camel = this.camels[color];
        //     const uplist = [];
        //     console.log("ラクダを動かします．");
            
        //     for (let up = 0; up < this.camels.length; up++) {
        //         const camelUp = this.camels[up];
        //         const zindex = document.getElementById(`camel-${up}`);
        
        //         if (!camelUp) continue;
        
        //         if (camel.position === camelUp.position && camel.heightposition <= camelUp.heightposition) {
        //             uplist.push(up);
        //             if (zindex) zindex.style.zIndex = camelUp.heightposition + 10;
        //         } else {
        //             if (zindex) zindex.style.zIndex = camelUp.heightposition;
        //         }
        //     }
        
        //     const direction = (color === 5 || color === 6) ? -1 : 1; // 灰色ダイスかどうか判定
        //     const newPosition = camel.position + direction * newnumber;
        //     const newHeightPosition = this.camels.filter(c => c.position === newPosition).length;
        
        //     // アニメーション処理
        //     if (newnumber === 1) {
        //         anime({
        //             targets: uplist.map(up => `#camel-${up}`),
        //             translateX: `${direction === 1 ? "+=" : "-="} ${80}`,
        //             translateY: `-= ${25 * (newHeightPosition - camel.heightposition)}`,
        //             easing: 'easeInOutSine',
        //             duration: 800,
        //             delay: 0,
        //         });
        //     } else {
        //         anime({
        //             targets: uplist.map(up => `#camel-${up}`),
        //             keyframes: [
        //                 {
        //                     translateX: `${direction === 1 ? "+=" : "-="} ${80}`,
        //                     translateY: `+= ${25 * camel.heightposition}`,
        //                     easing: 'easeInOutSine',
        //                     duration: 800,
        //                     delay: 0,
        //                 },//一旦降りる
        //                 {
        //                     translateX: `${direction === 1 ? "+=" : "-="} ${80 * (newnumber - 2)}`,
        //                     easing: 'easeInOutSine',
        //                     duration: 800,
        //                     delay: 0,
        //                 },//降りた後進む
        //                 {
        //                     translateX: `${direction === 1 ? "+=" : "-="} ${80}`,
        //                     translateY: `-= ${25 * newHeightPosition}`,
        //                     easing: 'easeInOutSine',
        //                     duration: 800,
        //                     delay: 0,
        //                 }//乗る
        //             ],
        //         });
        //     }
        
        //     // 高さと位置の更新
        //     const originalHeightPosition = camel.heightposition;
        //     const originalPosition = camel.position;
        
        //     for (let i = 0; i < uplist.length; i++) {
        //         const upIndex = uplist[i];
        //         const camelUp = this.camels[upIndex];
        //         if (camelUp) {
        //             this.$set(camelUp, 'heightposition', newHeightPosition - originalHeightPosition + camelUp.heightposition);
        //             this.$set(camelUp, 'position', originalPosition + direction * newnumber);
        //         }
        //     }
        // },
        
        CamelMove(color, newnumber) { //駒のアニメーション
            const camel = this.camels[color];
            const uplist = [];
            console.log("ラクダを動かします．")
            for (let up = 0; up < 7; up++) {
                const zindex = document.getElementById(`camel-${up}`);
                if (camel.position === this.camels[up].position && camel.heightposition <= this.camels[up].heightposition){

                    uplist.push(up);
                    zindex.style.zIndex = this.camels[up].heightposition + 10;
                }
                else {
                    zindex.style.zIndex = this.camels[up].heightposition;
                }
            }
            if (color === 5 || color === 6) { //灰色ダイスが出たとき
                const newheightpositon = this.camels.filter(c => c.position === camel.position - newnumber).length;
                if (newnumber === 1) { //1進んだとき
                    anime({
                        targets: uplist.map(up => `#camel-${up}`),
                        translateX: `-= ${80}`,
                        translateY: `-= ${25 * (newheightpositon - camel.heightposition)}`,
                        easing: 'easeInOutSine',
                        duration: 800,
                        delay: 0,

                    })
                }
                else {
                    anime({
                        targets: uplist.map(up => `#camel-${up}`),
                        keyframes: [
                            {
                                translateX: `-= ${80}`,
                                translateY: `+= ${25 * camel.heightposition}`,
                                easing: 'easeInOutSine',
                                duration: 800,
                                delay: 0,
                            }, //一旦降りる処理
                            {
                                translateX: `-= ${80 * (newnumber - 2)}`,
                                easing: 'easeInOutSine',
                                duration: 800,
                                delay: 0,
                            }, //降りた後進む処理
                            {
                                translateX: `-= ${80}`,
                                translateY: `-= ${25 * newheightpositon}`,
                                easing: 'easeInOutSine',
                                duration: 800,
                                delay: 0,
                            } //乗る処理
                        ],

                    });
                }
                const colorheightposition = camel.heightposition;
                const colorposition = camel.position;
                for (let i = 0; i < uplist.length; i++) {
                    this.$set(this.camels[uplist[i]], 'heightposition', newheightpositon - colorheightposition + this.camels[uplist[i]].heightposition);
                    this.$set(this.camels[uplist[i]], 'position', colorposition - newnumber);
                }
            }
            else { //灰色ダイス以外が出たとき
                const newheightpositon = this.camels.filter(c => c.position === camel.position + newnumber).length;
                if (newnumber === 1) { //1進んだとき
                    anime({
                        targets: uplist.map(up => `#camel-${up}`),
                        translateX: `+= ${80}`,
                        translateY: `-= ${25 * (newheightpositon - camel.heightposition)}`,
                        easing: 'easeInOutSine',
                        duration: 800,
                        delay: 0,

                    })
                }
                else {
                    anime({
                        targets: uplist.map(up => `#camel-${up}`),
                        keyframes: [
                            {
                                translateX: `+= ${80}`,
                                translateY: `+= ${25 * camel.heightposition}`,
                                easing: 'easeInOutSine',
                                duration: 800,
                                delay: 0,
                            }, //一旦降りる処理
                            {
                                translateX: `+= ${80 * (newnumber - 2)}`,
                                easing: 'easeInOutSine',
                                duration: 800,
                                delay: 0,
                            }, //降りた後進む処理
                            {
                                translateX: `+= ${80}`,
                                translateY: `-= ${25 * newheightpositon}`,
                                easing: 'easeInOutSine',
                                duration: 800,
                                delay: 0,
                            } //乗る処理
                        ],

                    });
                }
                const colorheightposition = camel.heightposition;
                const colorposition = camel.position;
                for (let i = 0; i < uplist.length; i++) {
                    this.$set(this.camels[uplist[i]], 'heightposition', newheightpositon - colorheightposition + this.camels[uplist[i]].heightposition);
                    this.$set(this.camels[uplist[i]], 'position', colorposition + newnumber);
                }
            }
        },

        MinusMove(color) {
            const camel = this.camels[color];
            const uplist = [];
            const minuslist = [];
            for (let up = 0; up < 7; up++) {
                const zindex = document.getElementById(`camel-${up}`);
                if (camel.position === this.camels[up].position && camel.heightposition <= this.camels[up].heightposition) {
                    uplist.push(up);
                    zindex.style.zIndex = this.camels[up].heightposition + 10;
                }
                else {
                    zindex.style.zIndex = this.camels[up].heightposition;
                }

                if (camel.position - 1 === this.camels[up].position && color !== 5 && color !== 6) {
                    minuslist.push(up);
                    zindex.style.zIndex = this.camels[up].heightposition + 15;
                }
                else if (camel.position + 1 === this.camels[up].position && (color === 5 || color === 6)) {
                    minuslist.push(up);
                    zindex.style.zIndex = this.camels[up].heightposition + 15;
                }
            }
            const colorheightposition = camel.heightposition;
            const colorposition = camel.position;
            if (color === 5 || color === 6) {
                anime({
                    targets: uplist.map(up => `#camel-${up}`),
                    translateX: `+= ${80}`,
                    easing: 'easeInOutSine',
                    duration: 800,
                    delay: 100,
                });

                if (minuslist.length !== 0) {
                    anime({
                        targets: minuslist.map(up => `#camel-${up}`),
                        translateY: `-= ${25 * uplist.length}`,
                        easing: 'easeInOutSine',
                        duration: 800,
                        delay: 100,
                    });
                }

                if (colorheightposition !== 0) {
                    anime({
                        targets: uplist.map(up => `#camel-${up}`),
                        translateX: `+= ${80}`,
                        translateY: `+= ${25 * colorheightposition}`,
                        easing: 'easeInOutSine',
                        duration: 800,
                        delay: 100,
                    });
                }
                for (let i = 0; i < uplist.length; i++) {
                    this.$set(this.camels[uplist[i]], 'heightposition', this.camels[uplist[i]].heightposition - colorheightposition);
                    this.$set(this.camels[uplist[i]], 'position', colorposition + 1);
                }
                if (minuslist.length !== 0) {
                    for (let i = 0; i < minuslist.length; i++) {
                        this.$set(this.camels[minuslist[i]], 'heightposition', this.camels[minuslist[i]].heightposition + uplist.length);
                    }
                }
            }

            else if (color !== 5 && color !== 6) {
                anime({
                    targets: uplist.map(up => `#camel-${up}`),
                    translateX: `-= ${80}`,
                    easing: 'easeInOutSine',
                    duration: 800,
                    delay: 100,
                });
                if (minuslist.length !== 0) {
                    anime({
                        targets: minuslist.map(up => `#camel-${up}`),
                        translateY: `-= ${25 * uplist.length}`,
                        easing: 'easeInOutSine',
                        duration: 800,
                        delay: 100,
                    });
                }
                if (colorheightposition !== 0) {
                    anime({
                        targets: uplist.map(up => `#camel-${up}`),
                        translateX: `-= ${80}`,
                        translateY: `+= ${25 * colorheightposition}`,
                        easing: 'easeInOutSine',
                        duration: 800,
                        delay: 100,
                    });
                }
                for (let i = 0; i < uplist.length; i++) {
                    this.$set(this.camels[uplist[i]], 'heightposition', this.camels[uplist[i]].heightposition - colorheightposition);
                    this.$set(this.camels[uplist[i]], 'position', colorposition - 1);
                }
                if (minuslist.length !== 0) {
                    for (let i = 0; i < minuslist.length; i++) {
                        this.$set(this.camels[minuslist[i]], 'heightposition', this.camels[minuslist[i]].heightposition + uplist.length);
                    }
                }
            }
        }
    }
});

function createBoard(camels) {
    // camelsが配列でない場合の対策
    if (!Array.isArray(camels)) {
        console.error("Camels is not an array:", camels);
        return;
    }

    const board = document.getElementById("board");
    if (!board) {
        console.error("Board element not found!");
        return;
    }

    board.innerHTML = ""; // ボードをクリア

    camels.forEach((camel) => {
        const camelDiv = document.createElement("div");
        camelDiv.style.position = "absolute";
        camelDiv.style.left = `${camel.position * 50}px`; // 位置を反映
        camelDiv.innerText = camel.color;
        board.appendChild(camelDiv);
    });
}
// 引かれたサイコロの表示を更新
function updateDrawnDice(drawnDice) {
    drawnDiceContainer.innerHTML = "";
    drawnDice.forEach((color) => {
        const dice = document.createElement("div");
        dice.classList.add("dice");
        dice.innerText = color[0].toUpperCase();
        dice.style.color = color;
        drawnDiceContainer.appendChild(dice);
    });
}

// チャットウィンドウにメッセージを追加これ参考にログ実装できるかも
function addChatMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.innerText = message;
    chatWindow.appendChild(messageElement);

    chatWindow.scrollTop = chatWindow.scrollHeight;
}
// 接続時の処理(Vueへ移動しました．)
// socket.on("connect", () => {
//     console.log("Connected to server");
//     document.getElementById("aaa").addEventListener("click", (e) => {
//         socket.emit(key);
//         e.preventDefault();
//         e.stopPropagation();
//     });
// });

// サーバー(server.js)からラクダの位置更新を受信
socket.on("camelMoved", (data) => {
    console.log("受信したラクダの状態:", data.result.camel.color);
    createBoard(data); // 最新状態でボードを更新
    app.RollDice(data.result.camel.color, data.result.steps);
});