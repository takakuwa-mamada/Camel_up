//version 1.0.1
/*
「」はフローチャートに対応

--1.0.0までに実装した機能--
・最初に3EP配布
・最終予想カードの配布
・競争ラクダ
・プレイヤーの手番選択（最終予想orダイス）
・最終予想（「レース全体の勝者か敗者に投票」）
・ダイス選択時に1EP獲得（ピラミッドチケットは無し）
・１つのレグで被らないようにダイスを振る
・ダイスに応じたラクダの移動（重なりなし）
・手番のループ
・レグのループ
・レグの終了判定
・ゲームの終了判定

--1.0.1で実装した機能--
・ダイス選択時に1EP獲得（ピラミッドチケットは無し）
・スペース、トラックの作成
・camel クラスに情報追加　layer, above, below
・playerクラス piramid_ticketの削除
・変数 topCamel, bottomCamel の追加（全体の一位と最下位）
・関数 move の追加
・ラクダの重なり
・重なったラクダの移動



--未実装の機能--
・通信機能
・プレイヤーの参加
・ゲームの開始
・投票チケットの配置
・観客タイルの配布
・イカれたラクダ、灰ダイス
・プレイヤーの手番選択（タイル設置orレグの投票）
・灰ダイス時の動かすラクダの判定
・逆走時の移動
・タイルを踏んだ時の動作（応援面、ブーイング面）
・タイルを踏んだ時に設置者がEP獲得
・タイル設置（「観客タイルを置く」）
・レグの投票（「投票チケットを１枚取る」）
・「盤面の整理」
・「レグの得点ラウンド」
・「ゲーム終了時の得点ラウンド」
・勝者判定
*/



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
s18 = new space(18); track.push(s18); s19 = new space(19); track.push(s19);



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
const yellowCam = new camel("yellow", 0); camels.push(yellowCam);
const greenCam = new camel("green", 0); camels.push(greenCam);
const purpleCam = new camel("purple", 0); camels.push(purpleCam);

//イカれたラクダ
//const whiteCam = new camel("white", 1); camels.push(whiteCam);
//const blackCam = new camel("black", 1); camels.push(blackCam);



//ダイス
const diceColor = ["red", "blue", "yellow", "green", "purple"];      //今回grayは無し

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
    order=0;      //順番 
    EP = 3;     //所持金　最初に3EP配布される
    race_card = ["red", "blue", "yellow", "green", "purple"]; //所持している最終投票カード
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
let topCamel=null;          //一位
let bottomCamel=null;       //最下位

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
    }

    //legPoint();
    //gamepoint();
    //ranking();

    //ゲーム終了
    console.log("###############################");
    
    //ラクダの最終位置
    for(let i=0; i<camels.length; i++){
        c = camels[i];
        console.log(c.color, c.location, c.layer);
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
    //startDice.pop();     //grayがあるとき
    for(let i=0; i<diceColor.length; i++){
        //色
        var j = Math.floor(Math.random()*startDice.length);
        //目
        var n = Math.floor(Math.random()*3+1);

        console.log("j:",startDice[j]);
        console.log("n:",n);

        //ダイスと同じ色のラクダを動かす
        for(let k=0; k<camels.length; k++){
            if(camels[k].color==startDice[j]){
                move(camels[k], n);
            }
        }


        //出たダイスを取り除く
        startDice.splice(j,1);
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
            if(cam.location = 17){
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

    //レグ開始時のラクダの位置
    for(let i=0; i<camels.length; i++){
        c = camels[i];
        console.log(c.color, c.location, c.layer);
    }

    //プレイヤーの手番
    while(rolledDice.length!=5){
        console.log("***************************************");
        console.log(players[startPlayerMarker].name);
        var choice = Math.floor(Math.random()*3);       //今回は乱数で行動を選択

        //投票
        if(choice == 0){
            console.log("vote");

            //投票できないときはサイコロを振る
            if(players[startPlayerMarker].race_card.length==0){
                choice = 1;
            }
            
            else{
                //投票先、色を乱数で決定　tb:１位or最下位　c:色
                var tb = Math.floor(Math.random()*2);       
                var c = Math.floor(Math.random()*players[startPlayerMarker].race_card.length);

                var col = players[startPlayerMarker].race_card[c];  //色名の取得
                players[startPlayerMarker].race_card.splice(c,1);   //投票した色を手札からなくす
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
                console.log("hand:",players[startPlayerMarker].race_card);
            }
        }

        //ダイスを振る
        if(choice != 0){
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

}

function gamepoint(){

}

function ranking(){

}

game();
