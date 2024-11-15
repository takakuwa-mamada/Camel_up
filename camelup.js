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
    { color: "#f00", position: 9 }, //赤
    { color: "#00f", position: 2 }, //青
    { color: "#0f0", position: 3 }, //緑
    { color: "#ff0", position: 4 }, //黄
    { color: "rgb(200, 0, 255)", position: 7 }, //紫
];

new Vue({
    el: "#app",
    data:{
        cells: Array(16).fill().map((_, index) => index + 1),
        camels: camels,
    },
    methods:{
        CamelPosition(camel){
            const mass_size = 83;
            const camel_size = 30;

            for (let mass = 0; mass < 16; mass++){
                if (camel.position == mass+ 1){
                    return{
                        top: `${(mass_size - camel_size) / 2}px`,
                        left: `${mass_size * mass + (mass_size - camel_size) / 2}px`,
                        backgroundColor: camel.color,
                    };
                }
            }
            return {};
        }
    }
});