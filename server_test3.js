//version 2.0.0
/*
「」はフローチャートに対応

--1.4.0までに実装した機能--
・ゲーム進行の処理（勝者判定以外）


--2.0.0で実装した機能--
・通信機能
・勝者判定

--未実装の機能--
・プレイヤーの参加
・ゲームの開始
*/

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {}; // 各ルーム情報を保持
const playerNameMap = new Map(); // socket と名前を紐付ける

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
    tile = null;               //スペースに置かれているタイル
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

//色ごとにリスト化
const legRed=[]; const legBlue=[]; const legGreen=[]; const legYellow=[]; const legPurple=[];

const red1 = new legTicket("red", 5); const red2 = new legTicket("red", 3);
const red3 = new legTicket("red", 2); const red4 = new legTicket("red", 2);
legRed.push(red1); legRed.push(red2); legRed.push(red3); legRed.push(red4);

const blue1 = new legTicket("blue", 5); const blue2 = new legTicket("blue", 3);
const blue3 = new legTicket("blue", 2); const blue4 = new legTicket("blue", 2);
legBlue.push(blue1); legBlue.push(blue2); legBlue.push(blue3); legBlue.push(blue4);

const green1 = new legTicket("green", 5); const green2 = new legTicket("green", 3);
const green3 = new legTicket("green", 2); const green4 = new legTicket("green", 2);
legGreen.push(green1); legGreen.push(green2); legGreen.push(green3); legGreen.push(green4);

const yellow1 = new legTicket("yellow", 5); const yellow2 = new legTicket("yellow", 3);
const yellow3 = new legTicket("yellow", 2); const yellow4 = new legTicket("yellow", 2);
legYellow.push(yellow1); legYellow.push(yellow2); legYellow.push(yellow3); legYellow.push(yellow4);

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

//競争ラクダ
const camels = [];
const redCam = new camel("red", 0); camels.push(redCam);
const blueCam = new camel("blue", 0); camels.push(blueCam);
const greenCam = new camel("green", 0); camels.push(greenCam);
const yellowCam = new camel("yellow", 0); camels.push(yellowCam);
const purpleCam = new camel("purple", 0); camels.push(purpleCam);

//イカれたラクダ
const whiteCam = new camel("white", 1); camels.push(whiteCam);
const blackCam = new camel("black", 1); camels.push(blackCam);


//ダイス
const diceColor = ["red", "blue", "green", "yellow", "purple", "gray"];

//振った後のダイス
class dice{
    constructor(color, num){
        this.color = color;
        this.num = num;
    }
}


class tile{
    constructor(name){
        this.name = name;       //所有者
    }
    type = 0;       //タイルの状況　0:手元　1:応援面　2:ブーイング面
    space = null;      //置かれているスペース
}

const tiles = [];


//プレイヤー
class player{
    constructor(name){
        this.name = name;
    }
    socket;     //接続時のsocket
    ID;         //接続時のID
    order;      //手番の順番
    EP = 3;     //所持金　最初に3EP配布される
    ranking = 0;    //最終順位
    raceCard = ["red", "blue", "green", "yellow", "purple"]; //所持している最終投票カード
    ticket = [];    //所持しているレグの投票チケット
    tile;           //所持しているタイル
}


//最終予想投票
class vote{
    constructor(name, color){
        this.name = name;       //投票者
        this.color = color;     //投票先
    }
}



//ゲーム全体の実行
async function game(room, name, ID){
    const topVote = [];         //全体の一位投票
    const bottomVote = [];      //全体の最下位予想
    const players = [];         //ゲームの参加者
    let SPM = 0;  //手番プレイヤー

    const r = room;
    const keys = Array.from(ID.keys()); 
    //プレイヤーの追加(４人)
    playerJoin(name,keys);

    console.log("gameStart");
    var pData=[];
    for(let i=0; i<4; i++){
        pData.push([players[i].name, players[i].ID, players[i].order])
    }
    console.log(pData);
    sendDataToAll("gameStart", pData);

    //競争ラクダの配置
    setCamel();
    console.log("setCamel");
    var cams = [];
    cams.push([redCam.location, redCam.layer]);
    cams.push([blueCam.location, blueCam.layer]);
    cams.push([greenCam.location, greenCam.layer]);
    cams.push([yellowCam.location, yellowCam.layer]);
    cams.push([purpleCam.location, purpleCam.layer]);
    cams.push([whiteCam.location, whiteCam.layer]);
    cams.push([blackCam.location, blackCam.layer]);
    sendDataToAll("setCamel", cams);

    //レグのループ
    var goal = 0;
    while(goal==0){
        console.log("=========================================");
        goal = await leg();

        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        legPoint();
        //プレイヤーの獲得金額
        for(let i=0; i<players.length; i++){
            p = players[i];
            console.log(p.name, p.EP);
        }
        resetTile();
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

    gamepoint();

    //プレイヤーの獲得金額
    for(let i=0; i<players.length; i++){
        p = players[i];
        console.log(p.name, p.EP);
    }
    ranking();



    function playerJoin(name,socket){ 
    
        const P1 = new player(name[0]); players.push(P1);
        P1.socket = socket[0];
        P1.ID = socket[0].id;
        const tileP1 = new tile(P1); tiles.push(tileP1); P1.tile = tileP1;
        P1.order = 0;
        
        const P2 = new player(name[1]); players.push(P2);
        P2.socket = socket[1];
        P2.ID = socket[1].id;
        const tileP2 = new tile(P2); tiles.push(tileP2); P2.tile = tileP2;
        P2.order = 1;
    
        const P3 = new player(name[2]); players.push(P3);
        P3.socket = socket[2];
        P3.ID = socket[2].id;
        const tileP3 = new tile(P3); tiles.push(tileP3); P3.tile = tileP3;
        P3.order = 2;
    
        const P4 = new player(name[3]); players.push(P4);
        P4.socket = socket[3];
        P4.ID = socket[3].id;
        const tileP4 = new tile(P4); tiles.push(tileP4); P4.tile = tileP4;
        P4.order = 3;
    }
    
    
    function setCamel(){
        var startDice = diceColor.concat();
        startDice.pop();
    
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
    
        n = Math.floor(Math.random()*3+1);
        console.log("white", n);
        move(whiteCam, 17-n);
        n = Math.floor(Math.random()*3+1);
        console.log("black", n);
        move(blackCam, 17-n);
    
    
        //開始時のラクダの位置
        for(let i=0; i<camels.length; i++){
            c = camels[i];
            console.log(c.color, c.location, c.layer);
        }
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
    
        if(track[cam.location].tile!=null){
            sendDataToAll("onTile", track[cam.location].tile.name.order);
            track[cam.location].tile.name.EP += 1;
            console.log(track[cam.location].tile.name.name, "tileEP");
            if(track[cam.location].tile.type==1){
                n++;
                cam.location++;
            }
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
    
        if(track[cam.location].tile!=null){
            if(track[cam.location].tile.type==2){
                tileBack(cam.location);
            }
        }
    }
    
    
    //タイルで1戻る
    function tileBack(n){
        var cam = track[n].bottom;
        var cam1 = track[n].bottom;
        cam.location--;
        track[n].count++;
        
        while(cam.above!=null){
            cam = cam.above;
            cam.location--;
            track[n].count++;
        }
        l = cam.layer;
    
        if(track[n-1].bottom!=null){
            cam.above = track[n-1].bottom;
            track[n-1].bottom.below = cam;
            while(cam.above!=null){
                cam = cam.above;
                cam.layer = cam.below.layer + 1;
            }
        }else{
            track[n-1].top = cam;
        }
    
        track[n-1].bottom = cam1;
        track[n].count = 0;
        track[n].bottom = null;
        track[n].top = null;
    }
    
    
    //レグの処理
    async function leg(){
        sendDataToAll("legStart", 0);
    
        var count=0      //出たダイス
        var restDice = diceColor.concat();
        var legR = legRed.concat();
        var legB = legBlue.concat();
        var legG = legGreen.concat();
        var legY = legYellow.concat();
        var legP = legPurple.concat();
        var tickets=[];
        var data = [];
        tickets.push(legR); tickets.push(legB); tickets.push(legG); tickets.push(legY); tickets.push(legP);
        //プレイヤーの手番
        while(count!=5){
            console.log("***************************************");
            console.log(players[SPM].name);
            sendDataToTurnPlayer(players[SPM].ID, "yourTurn", 0);
            sendDataToOtherPlayer("otherTurn", players[SPM].order);
            const data = await receiveData();
            console.log("data--", data);
    
            //投票
            if(data[0] == "setTile"){
                var t = data[1];
                console.log("setTile");
    
                //タイルを別のスペースから移動させる場合
                if(players[SPM].tile.space != null){
                    track[players[SPM].tile.space].tile = null;
                }
    
                //設置
                players[SPM].tile.space = t[0];
                players[SPM].tile.type = t[1];
                track[t[0]].tile = players[SPM].tile;
                console.log("space: ", t[0]);
                if(t[1] == 1){
                    console.log("応援面")
                }else if(t[1] == 2){
                    console.log("ブーイング面")
                }    
                sendDataToAll("setTile", t);       
            }
    
    
            //最終予想
            if(data[0] == "finalVote"){
                console.log("finalVote");
                
                var c = data[1][0];  //色の取得
                var col = diceColor[c];
                for(let i=0; i<players[SPM].raceCard.length; i++){
                    if(players[SPM].raceCard[i]==col){
                        players[SPM].raceCard.splice(i,1);   //投票した色を手札からなくす
                    }
                }
                var v = new vote(players[SPM], col);
                    
                //投票
                if(data[1][1] == 0){
                    topVote.push(v);
                    console.log("top", col);
                }else{
                    bottomVote.push(v);
                    console.log("bottom", col);
                }
    
                //残り手札の表示
                console.log("hand:",players[SPM].raceCard);
    
                sendDataToAll("finalVote", data[1][1]);
            }
    
            //レグの投票
            if(data[0] == "legVote"){
                console.log("legVote");
                var c = data[1];
                //チケットをプレイヤーに与える
                players[SPM].ticket.push(tickets[c][0]);
                console.log(tickets[c][0].color, tickets[c][0].winEP)
                //場からチケットを削除
                tickets[c].shift();
                sendDataToAll("legVote", data[1]);
            }
    
            //ダイスを振る
            if(data[0] == "rollDice"){
                console.log("rollDice");
    
                //ピラミッドチケットは無し　選択してすぐに1EP獲得
                players[SPM].EP+=1;
                sendDataToAll("DiceEP", players[SPM].order);
    
                //色と目の決定
                var c = Math.floor(Math.random()*restDice.length);
                var col = restDice[c];
                var n = Math.floor(Math.random()*3+1);
                console.log("color:", col, "  num:", n);
    
                //出たダイスの処理
                restDice.splice(c,1);
                
                //灰ダイス時
                if(col=="gray"){
                    if(whiteCam.above==blackCam){
                        move(blackCam, -n);
                        col = "black";
                        console.log(col);
                    }else if(blackCam.above==whiteCam){
                        move(whiteCam, -n);
                        col = "white";
                        console.log(col);
                    }else if(whiteCam.above!=null && blackCam.above==null){
                        move(whiteCam, -n);
                        col = "white";
                        console.log(col);
                    }else if(blackCam.above!=null && whiteCam.above==null){
                        move(blackCam, -n);
                        col = "black";
                        console.log(col);
                    }else{
                        var wb = Math.floor(Math.random()*2);
                        if(wb == 0){
                            move(whiteCam, -n);
                            col = "white";
                            console.log(col);
                        }else{
                            move(blackCam, -n);
                            col = "black";
                            console.log(col);
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
                var d = new dice(col, n);
                sendDataToAll("rollDice", d);
                count++;
            }
    
            //手番の移動
            SPM += 1;
    
            //４番手から１番手へ
            if(SPM==players.length){
                SPM = 0;
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
    
        var pEP = [players[0].EP, players[1].EP, players[2].EP, players[3].EP];
        sendDataToAll("legPoint", pEP);
    }
    
    
    function resetTile(){
        for(let i=0; i<4; i++){
            if(players[i].tile.type!=0){
                track[players[i].tile.space].tile = null;
                players[i].tile.type = 0;
                players[i].tile.space = null;
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
    
        var pEP = [players[0].EP, players[1].EP, players[2].EP, players[3].EP];
        sendDataToAll("gamePoint", pEP);
    }
    
    
    function ranking(){
        for(let i=0; i<4; i++){
            players[i].ranking=1;
            for(let j=0; j<4; j++){
                if(i!=j){
                    if(players[i].EP<players[j].EP){
                        players[i].ranking += 1;
                    }
                }
            }
            console.log(players[i].name, players[i].ranking);
        }
    
        var pRank = [players[0].ranking, players[1].ranking, players[2].ranking, players[3].ranking];
        sendDataToAll("ranking", pRank);
    }
    
    
    function receiveData() {        //クライアントからの受取
        socket = players[SPM].socket;
        return new Promise((resolve) => {
            // 古いリスナーを削除
            socket.removeAllListeners("setTile");
            socket.removeAllListeners("finalVote");
            socket.removeAllListeners("legVote");
            socket.removeAllListeners("rollDice");
    
            socket.once("setTile", (data) => {
                console.log("data:", data);
                resolve(["setTile", data]);
            });
            socket.once("finalVote", (data) => {
                console.log("data:", data);
                resolve(["finalVote", data]);
            });
            socket.once("legVote", (data) => {
                console.log("data:", data);
                resolve(["legVote", data]);
            });
            socket.once("rollDice", (data) => {
                console.log("data:", data);
                resolve(["rollDice", data]);
            });
        });
    }   
    
    
    function sendDataToAll(tag, data){    //ルームの全クライアントに送信
        io.to(r).emit(tag, data);
    }
    
    
    function sendDataToTurnPlayer(ID, tag, data){     //手番のプレイヤーに送信
        io.to(ID).emit(tag, data);
    }

    
    function sendDataToOtherPlayer(tag, data){    //手番以外のプレイヤーに送信
        for(let i=0; i<4; i++){
            if(i!=SPM){
                io.to(players[i].ID).emit(tag, data);
            }
        }
    }
}





let received_name = "";
const name = []; // 名前を格納する配列 
io.on("connection", (socket) => {

    // const player = { id: socket.id };
    socket.on("request", (myname) => {
        console.log(`${myname} が参加しました (ID: ${socket.id})`);
        playerNameMap.set(socket, myname);
        // 既存ルーム探索
        let roomAssigned = false;
        for (const room in rooms) {
            if (rooms[room].players.length < 4) {  // 4人以下の場合参加可能
                rooms[room].players.push({ id: socket.id, name: myname });
                socket.join(room);
                io.to(room).emit("updateRoom", rooms[room].players);
                roomAssigned = true;
                break;
            }
        }
    
        // 新規ルーム作成
        if (!roomAssigned) {
            const newRoom = `room-${Object.keys(rooms).length + 1}`;
            rooms[newRoom] = { players: [{ id: socket.id, name: myname }] };
            socket.join(newRoom);
            io.to(newRoom).emit("updateRoom", rooms[newRoom].players);
        }
    
        // ルーム内プレイヤーリストの取得
        const room = Object.keys(rooms).find(r => rooms[r].players.some(p => p.id === socket.id));
        if (room && rooms[room].players.length === 4) {
            const playerNames = rooms[room].players.map(p => p.name);
            game(room, playerNames, playerNameMap);  // ゲーム処理の開始
            console.log(`Game started in room: ${room}`);
        }
    });
    

    // 未完成．抜けたプレイヤーの識別ができていない．
    socket.on("disconnect", () => {
        const playerName = playerNameMap.get(socket);
    
        // プレイヤー情報の削除
        if (playerName) {
            console.log(`プレイヤー ${playerName} が退出しました (ID: ${socket.id})`);
            playerNameMap.delete(socket);  // playerNameMapから削除
        } else {
            console.log(`対応するプレイヤー情報が見つかりませんでした (ID: ${socket.id})`);
        }
    
        // ルーム内のプレイヤーを探して削除
        for (const room in rooms) {
            const playerIndex = rooms[room].players.findIndex(player => player.id === socket.id);
    
            if (playerIndex !== -1) {
                rooms[room].players.splice(playerIndex, 1);
                console.log(`ルーム: ${room} からプレイヤー (ID: ${socket.id}) を削除`);
    
                // ルームが空になった場合削除
                if (rooms[room].players.length === 0) {
                    delete rooms[room];
                    console.log(`ルーム ${room} を削除`);
                } else {
                    // 更新情報をクライアントへ送信
                    io.to(room).emit("updateRoom", rooms[room].players);
                }
                break;
            }
        }
    });
    
    
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//プレイヤーの識別，