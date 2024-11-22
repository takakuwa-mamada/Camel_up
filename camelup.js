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


const camels=[
    { color: "#f00", position: 1 }, //赤
    { color: "#00f", position: 2 }, //青
    { color: "#0f0", position: 3 }, //緑
    { color: "#ff0", position: 11 }, //黄
    { color: "rgb(200, 0, 255)", position: 7 }, //紫
];

const commands=[
    [
        { word: "▶サイコロをふる"},
        { word: "▶投票チケットをとる"},
        { word: "▶観客タイルを置く"},
        { word: "▶順位予想をする"},
    ],
    [
        { word: "▶赤"},
        { word: "▶青"},
        { word: "▶緑"},
        { word: "▶黄"},
        { word: "▶紫"},
        { word: "▶戻る"},
    ],
    [
        { word: "▶+1タイル"},
        { word: "▶-1タイル"},
        { word: "▶戻る"},
    ],
    [
        { word: "▶1位予想"},
        { word: "▶最下位予想"},
        { word: "▶戻る"},
    ],
];

const tickets=[
    [
        { image: "ticketlist/ticket_red_3.png"},
        { image: "ticketlist/ticket_red_3.png"},
        { image: "ticketlist/ticket_red_2.png"},
        { image: "ticketlist/ticket_red_1.png"},
    ],
    [
        { image: "ticketlist/ticket_blue_3.png"},
        { image: "ticketlist/ticket_blue_3.png"},
        { image: "ticketlist/ticket_blue_2.png"},
        { image: "ticketlist/ticket_blue_1.png"},
    ],
    [
        { image: "ticketlist/ticket_green_3.png"},
        { image: "ticketlist/ticket_green_3.png"},
        { image: "ticketlist/ticket_green_2.png"},
        { image: "ticketlist/ticket_green_1.png"},
    ],
    [
        { image: "ticketlist/ticket_yellow_3.png"},
        { image: "ticketlist/ticket_yellow_3.png"},
        { image: "ticketlist/ticket_yellow_2.png"},
        { image: "ticketlist/ticket_yellow_1.png"},
    ],
    [
        { image: "ticketlist/ticket_purple_3.png"},
        { image: "ticketlist/ticket_purple_3.png"},
        { image: "ticketlist/ticket_purple_2.png"},
        { image: "ticketlist/ticket_purple_1.png"},
    ],
];

const remaindices=[
    { image: "dicelist/dice_red.png", word: "reddice"},
    { image: "dicelist/dice_blue.png", word: "bluedice"},
    { image: "dicelist/dice_green.png", word: "greendice"},
    { image: "dicelist/dice_yellow.png", word: "yellowdice"},
    { image: "dicelist/dice_purple.png", word: "purpledice"},
    { image: "dicelist/dice_gray.png", word: "graydice"},
];

new Vue({
    el: "#app",
    data:{
        cells: Array(16).fill().map((_, index) => index + 1), //マス目
        camels: camels,
        commands: commands,
        command_flag: 0, //表示するコマンドを決定
        tickets: tickets,
        ticket_flag: [4,4,4,4,4], //前から赤、青、緑、黄、紫のチケットの残り枚数
        remaindices: remaindices,
        dice_flag: [0,0,0,0,0,0], //前から赤、青、緑、黄、紫のサイコロが残っているかどうか。0ならある。1ならない。
        remaindice_count: 0,

        playerturn: 1,//自分のターンでは1、それ以外では0とし、自分のターン以外ではコマンドが出ないようにする
    },
    methods:{
        PlayerTurn(){
            if (this.playerturn == 4){
                this.playerturn = 1;
            }
            else {
                this.playerturn += 1;
            }
        },

        RollDice(){ //サイコロを振った時の処理
            while (1){
                let randomdice = Math.floor(Math.random() * 6);
                if (this.remaindice_count > 4){
                    alert("error");
                    break;
                }
                if (this.dice_flag[randomdice] === 0){
                    this.$set(this.dice_flag, randomdice, 1);
                    alert(remaindices[randomdice].word);
                    this.remaindice_count += 1;
                    this.PlayerTurn();
                    break;
                }
            }
        },

        CommandClick(command_word){ //各コマンドを押したときの処理
            if (this.command_flag == 0){
                if (command_word === commands[0][0]){
                    alert("サイコロを振ります");
                    this.RollDice();
                }
                else if (command_word === commands[0][1]){
                    alert("投票チケットを取得します");
                    this.command_flag = 1;
                }
                else if (command_word === commands[0][2]){
                    alert("観客タイルを置きます");
                    this.command_flag = 2;
                }
                else {
                    alert("レースの順位予想をします");
                    this.command_flag = 3;
                }
            }
            else if (this.command_flag == 1){
                if (command_word === commands[1][5]){
                    this.command_flag = 0;
                }
                else {
                    if (command_word === commands[1][0]){
                        alert("赤");
                        this.$set(this.ticket_flag, 0, this.ticket_flag[0] -= 1);
                    }
                    else if (command_word === commands[1][1]){
                        alert("青");
                        this.ticket_flag[1] -= 1;
                    }
                    else if (command_word === commands[1][2]){
                        alert("緑");
                        this.ticket_flag[2] -= 1;
                    }
                    else if (command_word === commands[1][3]){
                        alert("黄");
                        this.ticket_flag[3] -= 1;
                    }
                    else if (command_word === commands[1][4]){
                        alert("紫");
                        this.ticket_flag[4] -= 1;
                    }
                    this.PlayerTurn();
                }
            }
            else if (this.command_flag == 2){
                if (command_word === commands[2][0]){
                    alert("＋1");
                }
                else if (command_word === commands[2][1]){
                    alert("ー1");
                }
                else if (command_word === commands[2][2]){
                    this.command_flag = 0;
                }
            }
            else if (this.command_flag == 3){
                if (command_word === commands[3][0]){
                    alert("1位");
                    this.command_flag = 4;
                }
                else if (command_word === commands[3][1]){
                    alert("最下位");
                    this.command_flag = 4;
                }
                else if (command_word === commands[3][2]){
                    this.command_flag = 0;
                }
            }
            else if (this.command_flag == 4){
                if (command_word === commands[1][5]){
                    this.command_flag = 3;
                }
                else {
                    if (command_word === commands[1][0]){
                        alert("赤");
                    }
                    else if (command_word === commands[1][1]){
                        alert("青");
                    }
                    else if (command_word === commands[1][2]){
                        alert("緑");
                    }
                    else if (command_word === commands[1][3]){
                        alert("黄");
                    }
                    else if (command_word === commands[1][4]){
                        alert("紫");
                    }
                    this.PlayerTurn();
                }
            }
        },

        CamelPosition(camel){ //駒の位置決定
            const mass_size_side = 80;
            const mass_size_warp = 50;
            const camel_size = 30;

            for (let mass = 0; mass < 16; mass++){
                if (camel.position == mass+ 1){
                    return{
                        top: `${(mass_size_warp - camel_size) / 2}px`,
                        left: `${mass_size_side * mass + (mass_size_side - camel_size) / 2}px`,
                        backgroundColor: camel.color,
                    };
                }
            }
            return {};
        },

        CamelMove(){
        }
    }
});
