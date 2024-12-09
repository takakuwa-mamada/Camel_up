//version 1.4.0
/*
「」はフローチャートに対応

--1.3.0までに実装した機能--
・ゲームボードの要素
・投票チケットの配置
・最初に3EP配布
・最終予想カードの配布
・競争ラクダ
・プレイヤーの手番選択（ダイスor最終予想orレグの投票）
・ダイス選択時に1EP獲得（ピラミッドチケットは無し）
・１つのレグで被らないようにダイスを振る
・ダイスに応じたラクダ集団の移動（競争ラクダのみ）
・最終予想（「レース全体の勝者か敗者に投票」）
・レグの投票（「投票チケットを１枚取る」）
・手番のループ
・レグのループ
・レグの終了判定
・「レグの得点ラウンド」
・レグ終了時にチケットを戻す
・「ゲーム終了時の得点ラウンド」
・ゲームの終了判定

--1.4.0で実装した機能--
・イカれたラクダ、灰ダイス
・灰ダイス時の動かすラクダの判定
・逆走時の移動


--未実装の機能--
・通信機能
・プレイヤーの参加
・ゲームの開始
・観客タイルの配布
・プレイヤーの手番選択（タイル設置）
・タイルを踏んだ時の動作（応援面、ブーイング面）
・タイルを踏んだ時に設置者がEP獲得
・タイル設置（「観客タイルを置く」）
・レグ終了時に観客タイルを戻す
・勝者判定
*/

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // socket.ioをサーバに統合

const PORT = 4000;
app.use(express.static('public'));


//スペース
class space{
    constructor(num){
        this.num = num;     //スペースの番号
    }
    top = null;         //スペースにいるラクダの最上段
    bottom = null;      //スペースにいるラクダの最下段
    count = 0;          //スペースにいるラクダの数
}

//トラック
const track = new Array;
s0 = new space(0); track.push(s0); s1 = new space(1); track.push(s1);
s2 = new space(2); track.push(s2); s3 = new space(3); track.push(s3);
s4 = new space(4); track.push(s4); s5 = new space(5); track.push(s5);
s6 = new space(6); track.push(s6); s7 = new space(7); track.push(s7);
s8 = new space(8); track.push(s8); s9 = new space(9); track.push(s9);
s10 = new space(10); track.push(s10); s11 = new space(11); track.push(s11);
s12 = new space(12); track.push(s12); s13 = new space(13); track.push(s13);
s14 = new space(14); track.push(s14); s15 = new space(15); track.push(s15);
s16 = new space(16); track.push(s16); s17 = new space(17); track.push(s17);



//レグの投票チケット
class legTicket{
    constructor(color, winEP){
        this.color = color;     //投票するラクダの色
        this.winEP = winEP;     //1位の賞金
    }
}

const legRed=[]; const legBlue=[]; const legYellow=[]; const legGreen=[]; const legPurple=[];

const red1 = new legTicket("red", 5); const red2 = new legTicket("red", 3);
const red3 = new legTicket("red", 2); const red4 = new legTicket("red", 2);
legRed.push(red1); legRed.push(red2); legRed.push(red3); legRed.push(red4);

const blue1 = new legTicket("blue", 5); const blue2 = new legTicket("blue", 3);
const blue3 = new legTicket("blue", 2); const blue4 = new legTicket("blue", 2);
legBlue.push(blue1); legBlue.push(blue2); legBlue.push(blue3); legBlue.push(blue4);

const yellow1 = new legTicket("yellow", 5); const yellow2 = new legTicket("yellow", 3);
const yellow3 = new legTicket("yellow", 2); const yellow4 = new legTicket("yellow", 2);
legYellow.push(yellow1); legYellow.push(yellow2); legYellow.push(yellow3); legYellow.push(yellow4);

const green1 = new legTicket("green", 5); const green2 = new legTicket("green", 3);
const green3 = new legTicket("green", 2); const green4 = new legTicket("green", 2);
legGreen.push(green1); legGreen.push(green2); legGreen.push(green3); legGreen.push(green4);

const purple1 = new legTicket("purple", 5); const purple2 = new legTicket("purple", 3);
const purple3 = new legTicket("purple", 2); const purple4 = new legTicket("purple", 2);
legPurple.push(purple1); legPurple.push(purple2); legPurple.push(purple3); legPurple.push(purple4);


//ラクダ
class camel{
    constructor(color, type){
        this.color = color;     //色
        this.type = type;       //種類　0:競争ラクダ　1:イカれたラクダ
    }
    location = 0;   //ラクダの位置
    layer = 1;      //ラクダ集団での位置　下から1
    above = null;       //上にいるラクダ
    below = null;       //下にいるラクダ
}
const COURSE_LENGTH = 16;
let diceBox = ["red", "blue", "green", "yellow", "purple"];
let drawnDice = [];

//競争ラクダ
const camels = [];
const redCam = new camel("red", 0); camels.push(redCam);
const blueCam = new camel("blue", 0); camels.push(blueCam);
const yellowCam = new camel("yellow", 0); camels.push(yellowCam);
const greenCam = new camel("green", 0); camels.push(greenCam);
const purpleCam = new camel("purple", 0); camels.push(purpleCam);

//イカれたラクダ
const whiteCam = new camel("white", 1); camels.push(whiteCam);
const blackCam = new camel("black", 1); camels.push(blackCam);



//ダイス
const diceColor = ["red", "blue", "yellow", "green", "purple", "gray"];

//振った後のダイス
class dice{
    constructor(color, num){
        this.color = color;
        this.num = num;
    }
}



//プレイヤー
class player{
    constructor(name){
        this.name = name;
    }
    order = 0;      //順番 
    EP = 3;     //所持金　最初に3EP配布される
    ranking = 0;    //最終順位
    raceCard = ["red", "blue", "yellow", "green", "purple"]; //所持している最終投票カード
    ticket = [];    //所持しているレグの投票チケット
}



//最終予想投票
class vote{
    constructor(name, color){
        this.name = name;       //投票者
        this.color = color;     //投票先
    }
}



const topVote = [];         //全体の一位投票
const bottomVote = [];      //全体の最下位予想
const players = [];         //ゲームの参加者
let startPlayerMarker = 0;  //手番プレイヤー

//ゲーム全体の実行
function game(){

    //プレイヤーの追加(４人)
    playerJoin();

    //競争ラクダの配置
    setCamel();

    //レグのループ

    var goal = 0;
    while(goal==0){
        console.log("=========================================");
        goal = leg();
        //legPoint();

        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        legPoint();
        //プレイヤーの獲得金額
        for(let i=0; i<players.length; i++){
            p = players[i];
            console.log(p.name, p.EP);
        }
    }



    //ゲーム終了
    console.log("###############################");
    
    //ラクダの最終位置
    for(let i=0; i<camels.length; i++){
        c = camels[i];
        console.log(c.color, c.location, c.layer);
    }

    //プレイヤーの獲得金額
    for(let i=0; i<players.length; i++){
        p = players[i];
        console.log(p.name, p.EP);
    }
    gamepoint();
    //ranking();

    //全体の１位の投票
    for(let i=0; i<topVote.length; i++){
        t = topVote[i];
        console.log("top: ",t.name.name, t.color);
    }
    //全体の最下位の投票
    for(let i=0; i<bottomVote.length; i++){
        b = bottomVote[i]
        console.log("bottom: ",b.name.name, b.color);
    }
    //プレイヤーの獲得金額
    for(let i=0; i<players.length; i++){
        p = players[i];
        console.log(p.name, p.EP);
    }


}



function playerJoin(){
    const A = new player("Tom"); players.push(A);
    const B = new player("Bob"); players.push(B);
    const C = new player("Jhon"); players.push(C);
    const D = new player("Mike"); players.push(D);
}



function setCamel(){
    var startDice = diceColor.concat();
    startDice.pop();
    console.log(startDice);
    for(let i=0; i<5; i++){
        //色
        var j = Math.floor(Math.random()*startDice.length);
        //目
        var n = Math.floor(Math.random()*3+1);

        console.log(startDice[j], n);

        //ダイスと同じ色のラクダを動かす
        for(let k=0; k<camels.length; k++){
            if(camels[k].color==startDice[j]){
                move(camels[k], n);
            }
        }

        //出たダイスを取り除く
        startDice.splice(j,1);
    }

    
    var wb = Math.floor(Math.random()*2);
    if(wb == 0){
        console.log("white", n);
        move(whiteCam, 17-n);
        console.log("black", n);
        move(blackCam, 17-n);
    }else{
        console.log("black", n);
        move(blackCam, 17-n);
        console.log("white", n);
        move(whiteCam, 17-n);
    }


    //開始時のラクダの位置
    for(let i=0; i<camels.length; i++){
        c = camels[i];
        console.log(c.color, c.location, c.layer);
    }
}
//追加した(高鍬)
function moveCamel() {
    if (diceBox.length === 0) {
      diceBox = ["red", "blue", "green", "yellow", "purple"];
      drawnDice = [];
    }
  
    const diceIndex = Math.floor(Math.random() * diceBox.length);
    const camelColor = diceBox[diceIndex];
    diceBox.splice(diceIndex, 1);
    drawnDice.push(camelColor);
  
    const camel = camels.find((c) => c.color === camelColor);
    const steps = rollDice();
    camel.position += steps;
  
    if (camel.position >= COURSE_LENGTH) {
      camel.position = COURSE_LENGTH;
    }
  
    return { camel, steps, drawnDice };
}

//ラクダ集団の移動
function move(cam, n){
    //移動前のスペースの整理
    track[cam.location].count = cam.layer-1;
    track[cam.location].top = cam.below;
    //下にラクダがいない場合
    if(cam.below == null){
        track[cam.location].bottom = null;
    }
    //下にラクダがいる場合
    else{
        cam.below.above = null;
    }

    //移動
    cam.location += n;
    //ゴールした場合
    if(cam.location > 16){
        cam.location = 17;
    }

    //移動先のスペースの整理
    track[cam.location].count += 1;
    //移動先にラクダがいない場合
    if(track[cam.location].count==1){
        track[cam.location].top = cam;
        track[cam.location].bottom = cam;
        cam.below = null;
        cam.layer = 1;
    }
    //移動先にラクダがいる場合
    else{
        cam.below = track[cam.location].top;
        track[cam.location].top.above = cam;
        track[cam.location].top = cam;
        cam.layer = cam.below.layer + 1;
    }
    //移動するラクダの上にラクダがいる場合
    if(cam.above != null){
        aboveCam = cam.above;
        while(aboveCam != null){
            aboveCam.location += n;
            if(cam.location == 17){
                aboveCam.location = 17;
            }
            aboveCam.layer = aboveCam.below.layer + 1;
            track[cam.location].count += 1;
            track[cam.location].top = aboveCam;
            aboveCam = aboveCam.above;
        }
    }
}



//レグの処理
function leg(){
    var restDice = diceColor.concat();
    var rolledDice =[]      //出たダイス
    var legR = legRed.concat();
    var legB = legBlue.concat();
    var legY = legYellow.concat();
    var legG = legGreen.concat();
    var legP = legPurple.concat();
    var tickets=[];
    tickets.push(legR); tickets.push(legB); tickets.push(legY); tickets.push(legG); tickets.push(legP);

    //プレイヤーの手番
    while(rolledDice.length!=5){
        console.log("***************************************");
        console.log(players[startPlayerMarker].name);
        var choice = Math.floor(Math.random()*4);       //今回は乱数で行動を選択

        //投票
        if(choice == 0){
            console.log("vote");

            //投票できないときはサイコロを振る
            if(players[startPlayerMarker].raceCard.length==0){
                choice = 10;
            }
            
            else{
                //投票先、色を乱数で決定　tb:１位or最下位　c:色
                var tb = Math.floor(Math.random()*2);       
                var c = Math.floor(Math.random()*players[startPlayerMarker].raceCard.length);

                var col = players[startPlayerMarker].raceCard[c];  //色名の取得
                players[startPlayerMarker].raceCard.splice(c,1);   //投票した色を手札からなくす
                var v = new vote(players[startPlayerMarker], col);
                
                //投票
                if(tb == 0){
                    topVote.push(v);
                    console.log("top", col);
                }else{
                    bottomVote.push(v);
                    console.log("bottom", col);
                }

                //残り手札の表示
                console.log("hand:",players[startPlayerMarker].raceCard);
            }
        }

        if(choice == 1){
            console.log("legVote");
            if(tickets.length==0){
                choice = 10;
            }
            else{
                //色を乱数で決定
                var c = Math.floor(Math.random()*tickets.length);
                //チケットをプレイヤーに与える
                players[startPlayerMarker].ticket.push(tickets[c][0]);
                console.log(tickets[c][0].color, tickets[c][0].winEP)
                //場からチケットを削除
                tickets[c].shift();
                if(tickets[c].length==0){
                    tickets.splice(c,1);
                } 
            }          
        }

        //ダイスを振る
        if(choice > 1){
            console.log("rollDice");

            //ピラミッドチケットは無し　選択してすぐに1EP獲得
            players[startPlayerMarker].EP+=1;

            //色と目の決定
            var c = Math.floor(Math.random()*restDice.length);
            var col = restDice[c];
            var n = Math.floor(Math.random()*3+1);
            console.log("color:", col, "  num:", n);

            //出たダイスの処理
            var d = new dice(col, n);
            rolledDice.push(d);
            restDice.splice(c,1);
            

            //灰ダイス時
            if(col=="gray"){
                if(whiteCam.above==blackCam){
                    move(blackCam, -n);
                    console.log("black");
                }else if(blackCam.above==whiteCam){
                    move(whiteCam, -n);
                    console.log("white");
                }else if(whiteCam.above!=null && blackCam.above==null){
                    move(whiteCam, -n);
                    console.log("white");
                }else if(blackCam.above!=null && whiteCam.above==null){
                    move(blackCam, -n);
                    console.log("black");
                }else{
                    var wb = Math.floor(Math.random()*2);
                    if(wb == 0){
                        move(whiteCam, -n);
                        console.log("white");
                    }else{
                        move(blackCam, -n);
                        console.log("black");
                    }
                }
            }
            //他のダイス
            else{
                //ラクダの移動
                for(let k=0; k<camels.length; k++){
                    if(camels[k].color==col){
                        move(camels[k], n);
                        
                        //ゴール(16を越える)したら終了
                        if(camels[k].location==17){
                            return 1;
                        }
                    }
                }
            }
        }

        //手番の移動
        startPlayerMarker += 1;

        //４番手から１番手へ
        if(startPlayerMarker==4){
            startPlayerMarker = 0;
        }
    
    }
    
    return 0;   //レグ終了時にゴールしてない
}



function legPoint(){
    //レグ終了時のラクダの位置
    for(let i=0; i<camels.length; i++){
        c = camels[i];
        console.log(c.color, c.location, c.layer);
    }

    var getEP;
    var cam1st = redCam;
    var cam2nd = blueCam;

    //順位決定
    for(let i=1; i<5; i++){
        var c=camels[i];
        if(cam1st.location<c.location){
            cam2nd = cam1st;
            cam1st = c;
        }else if(cam1st.location == c.location){
            if(cam1st.layer < c.layer){
                cam2nd = cam1st;
                cam1st = c;
            }else if(cam2nd.location < c.location){
                cam2nd = c;
            }else if(cam2nd.location == c.location){
                if(cam2nd.layer < c.layer){
                    cam2nd = c;
                }
            }
        }else if(cam2nd.location<c.location){
            cam2nd = c;
        }else if(cam2nd.location == c.location){
            if(cam2nd.layer < c.layer){
                cam2nd = c;
            }
        }
    }
    console.log("1st: ", cam1st.color);
    console.log("2nd: ", cam2nd.color);    

    for(let i=0; i<players.length; i++){
        getEP = 0;
        
        //得点計算
        while(players[i].ticket.length>0){
            if(players[i].ticket[0].color == cam1st.color){
                getEP += players[i].ticket[0].winEP;
            }else if(players[i].ticket[0].color == cam2nd.color){
                getEP += 1;
            }else{
                getEP -= 1;
            }
            console.log(players[i].name, players[i].ticket[0], getEP);
            players[i].ticket.shift();
        }

        //所持金はマイナスにならない
        players[i].EP += getEP;
        if(players[i].EP<0){
            players[i].EP = 0; 
        }
    }
}



function gamepoint(){
    topCamel = redCam;      //全体の一位
    bottomCamel = redCam;   //全体の最下位

    //一位と最下位の決定
    for(let i=1; i<5; i++){
        //一位
        if(camels[i].location > topCamel.location){
            topCamel = camels[i];
        }else if(camels[i].location == topCamel.location){
            if(camels[i].layer > topCamel.layer){
                topCamel = camels[i];
            }
        }

        //最下位
        if(camels[i].location < bottomCamel.location){
            bottomCamel = camels[i];
        }else if(camels[i].location == bottomCamel.location){
            if(camels[i].layer < bottomCamel.layer){
                bottomCamel = camels[i];
            }
        }        
    }
    topColor = topCamel.color;          //一位の色
    bottomColor = bottomCamel.color;    //最下位の色

    console.log("topColor:", topColor);
    console.log("bottomColor:", bottomColor);

    //一位の投票の賞金
    var count=0;
    for(let i=0; i<topVote.length; i++){
        if(topVote[i].color == topColor){
            if(count==0){
                topVote[i].name.EP += 8;
            }else if(count==1){
                topVote[i].name.EP += 5;
            }else if(count==2){
                topVote[i].name.EP += 3;
            }else if(count==3){
                topVote[i].name.EP += 2;
            }else if(count==4){
                topVote[i].name.EP += 1;
            }
            count += 1;
        }else{
            if(topVote[i].name.EP>0){
                topVote[i].name.EP -= 1;
            }
        }
    }

    //最下位の投票の賞金
    count=0;
    for(let i=0; i<bottomVote.length; i++){
        if(bottomVote[i].color == bottomColor){
            if(count==0){
                bottomVote[i].name.EP += 8;
            }else if(count==1){
                bottomVote[i].name.EP += 5;
            }else if(count==2){
                bottomVote[i].name.EP += 3;
            }else if(count==3){
                bottomVote[i].name.EP += 2;
            }else if(count==4){
                bottomVote[i].name.EP += 1;
            }
            count += 1;
        }else{
            if(bottomVote[i].name.EP>0){
                bottomVote[i].name.EP -= 1;
            }
        }
    }
}



function ranking(){

}



// game();

// ソケットの処理 
//接続中のプレーヤーからロールダイスイベントが来た時，そのダイスの出目と色をindex.jsに送信
io.on("connection", (socket) => {
    console.log("New player connected");

    socket.on("rollDice", () => {
        // サイコロを振る
        const result = moveCamel(); // moveCamel関数で色と出目を決定
        // console.log("サイコロの結果:", result);
    
        // クライアントにサイコロの結果を送信
        io.emit("camelMoved", { camels, result });
    });
    
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});