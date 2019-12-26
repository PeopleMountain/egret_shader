/**
 * shader 特效组件
 * 使用例子
 * let e = SpecialEffects.createEffects(new egret.Bitmap(),SpecialEffects.EffectBrightnessContrast)
 * e.refreshData(...args)
 * @author doudou
 */
namespace SpecialEffects{
    const V_SHADER = `attribute vec2 aVertexPosition;attribute vec2 aTextureCoord;attribute vec4 aColor;uniform vec2 projectionVector;varying vec2 vTextureCoord;varying vec4 vColor;const vec2 center = vec2(-1.0, 1.0);void main(void) {gl_Position = vec4( (aVertexPosition / projectionVector) + center , 0.0, 1.0);vTextureCoord = aTextureCoord;vColor = aColor;}`;
    const BRIGHTNESS_CONTRAST_F_SHADER =`precision lowp float;varying vec4 vColor;uniform sampler2D uSampler;uniform float brightness;uniform float contrast;varying vec2 vTextureCoord;void main(){vec4 color=texture2D(uSampler,vTextureCoord)*vColor;color.rgb+=brightness;if(contrast>0.0){color.rgb=(color.rgb-0.5)/(1.0-contrast)+0.5;}else{color.rgb=(color.rgb-0.5)*(1.0+contrast)+0.5;}gl_FragColor=color;}`;
    const HUE_SATURATION_F_SHADER =`precision lowp float;varying vec4 vColor;uniform sampler2D uSampler;uniform float hue;uniform float saturation;varying vec2 vTextureCoord;void main(){vec4 color=texture2D(uSampler,vTextureCoord)*vColor;float angle=hue*3.14159265;float s=sin(angle),c=cos(angle);vec3 weights=(vec3(2.0*c,-sqrt(3.0)*s-c,sqrt(3.0)*s-c)+1.0)/3.0;float len=length(color.rgb);color.rgb=vec3(dot(color.rgb,weights.xyz),dot(color.rgb,weights.zxy),dot(color.rgb,weights.yzx));float average=(color.r+color.g+color.b)/3.0;if(saturation>0.0){color.rgb+=(average-color.rgb)*(1.0-1.0/(1.001-saturation));}else{color.rgb+=(average-color.rgb)*(-saturation);}gl_FragColor=color;}`;
    const VIBRANCE_F_SHADER = `precision lowp float;varying vec4 vColor;uniform sampler2D uSampler;uniform float amount;varying vec2 vTextureCoord;void main(){vec4 color=texture2D(uSampler,vTextureCoord)*vColor;float average=(color.r+color.g+color.b)/3.0;float mx=max(color.r,max(color.g,color.b));float amt=(mx-average)*(-amount*3.0);color.rgb=mix(color.rgb,vec3(mx),amt);gl_FragColor=color;}`;
    const DENOISE_F_SHADER=`precision lowp float;varying vec4 vColor;uniform sampler2D uSampler;uniform float exponent;uniform float strength;uniform float texSizeW;uniform float texSizeH;varying vec2 vTextureCoord;void main(){vec2 texSize = vec2(texSizeW,texSizeH);vec4 center=texture2D(uSampler,vTextureCoord)*vColor;vec4 color=vec4(0.0);float total=0.0;for(float x=-4.0;x<=4.0;x+=1.0){for(float y=-4.0;y<=4.0;y+=1.0){vec4 sample=texture2D(uSampler,vTextureCoord+vec2(x,y)/texSize)*vColor;float weight=1.0-abs(dot(sample.rgb-center.rgb,vec3(0.25)));weight=pow(weight,exponent);color+=sample*weight;total+=weight;}}gl_FragColor=color/total;}`;
    const NOISE_F_SHADER =`precision lowp float;varying vec2 vTextureCoord;varying vec4 vColor;uniform sampler2D uSampler;uniform float amount;float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}void main(void) {vec4 color=texture2D(uSampler, vTextureCoord) * vColor;float diff=(rand(vTextureCoord)-0.5)*amount;color.r+=diff;color.g+=diff;color.b+=diff;gl_FragColor=color;}`;
    const SEPIA_F_SHADER =`precision lowp float;varying vec4 vColor;uniform sampler2D uSampler;uniform float amount;varying vec2 vTextureCoord;void main(){vec4 color=texture2D(uSampler,vTextureCoord)*vColor;float r=color.r;float g=color.g;float b=color.b;color.r=min(1.0,(r*(1.0-(0.607*amount)))+(g*(0.769*amount))+(b*(0.189*amount)));color.g=min(1.0,(r*0.349*amount)+(g*(1.0-(0.314*amount)))+(b*0.168*amount));color.b=min(1.0,(r*0.272*amount)+(g*0.534*amount)+(b*(1.0-(0.869*amount))));gl_FragColor=color;}`;
    const VIGNETTE_F_SHADER = "precision lowp float;varying vec4 vColor;uniform sampler2D uSampler;uniform float size;uniform float amount;varying vec2 vTextureCoord;void main(){vec4 color=texture2D(uSampler,vTextureCoord)*vColor;float dist=distance(vTextureCoord,vec2(0.5,0.5));color.rgb*=smoothstep(0.8,size*0.799,dist*(amount+size));gl_FragColor=color;}"
    const ZOOM_BLUR_F_SHADER = `precision lowp float;varying vec4 vColor;uniform sampler2D uSampler;uniform float strength;varying vec2 vTextureCoord;uniform float centerX;uniform float centerY;uniform float texSizeW;uniform float texSizeH;float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}void main(){vec2 texSize = vec2(texSizeW,texSizeH);vec2 center = vec2(centerX,centerY);vec4 color=vec4(0.0);float total=0.0;vec2 toCenter=center-vTextureCoord*texSize;float offset=random(vec3(12.9898,78.233,151.7182),0.0);for(float t=0.0;t<=40.0;t++){float percent=(t+offset)/40.0;float weight=4.0*(percent-percent*percent);vec4 sample=texture2D(uSampler,vTextureCoord+toCenter*percent*strength/texSize);sample.rgb*=sample.a;color+=sample*weight;total+=weight;}gl_FragColor=color/total;gl_FragColor.rgb/=gl_FragColor.a+0.00001;}`;
    const TRIANGLE_BLUR_F_SHADER =`precision lowp float;varying vec4 vColor;uniform sampler2D uSampler;uniform vec2 delta;uniform float deltaX;uniform float deltaY;varying vec2 vTextureCoord;float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}void main(){vec2 delta = vec2(deltaX,deltaY);vec4 color=vec4(0.0);float total=0.0;float offset=random(vec3(12.9898,78.233,151.7182),0.0);for(float t=-30.0;t<=30.0;t++){float percent=(t+offset-0.5)/30.0;float weight=1.0-abs(percent);vec4 sample=texture2D(uSampler,vTextureCoord+delta*percent)*vColor;sample.rgb*=sample.a;color+=sample*weight;total+=weight;}gl_FragColor=color/total;gl_FragColor.rgb/=gl_FragColor.a+0.00001;}`;
    const TILT_SHIFT_F_SHADER =`precision lowp float;varying vec4 vColor;uniform sampler2D uSampler;uniform float blurRadius;uniform float gradientRadius;uniform float startX;uniform float startY;uniform float endX;uniform float endY;uniform float deltaX;uniform float deltaY;uniform float texSizeW;uniform float texSizeH;varying vec2 vTextureCoord;float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}void main(){vec2 start = vec2(startX,startY);vec2 end = vec2(endX,endY);vec2 delta = vec2(deltaX,deltaY);vec2 texSize = vec2(texSizeW,texSizeH);vec4 color=vec4(0.0);float total=0.0;float offset=random(vec3(12.9898,78.233,151.7182),0.0);vec2 normal=normalize(vec2(start.y-end.y,end.x-start.x));float radius=smoothstep(0.0,1.0,abs(dot(vTextureCoord*texSize-start,normal))/gradientRadius)*blurRadius;for(float t=-30.0;t<=30.0;t++){float percent=(t+offset-0.5)/30.0;float weight=1.0-abs(percent);vec4 sample=texture2D(uSampler,vTextureCoord+delta/texSize*percent*radius)*vColor;sample.rgb*=sample.a;color+=sample*weight;total+=weight;}gl_FragColor=color/total;gl_FragColor.rgb/=gl_FragColor.a+0.00001;}`;
    const SWIRL_F_SHADER = `precision lowp float;varying vec2 vTextureCoord;varying vec4 vColor;uniform sampler2D uSampler;uniform float radius;uniform float angle;uniform float centerX;uniform float centerY;uniform float texSizeW;uniform float texSizeH;void main(){vec2 texSize = vec2(texSizeW,texSizeH);vec2 center = vec2(centerX,centerY);vec2 coord=vTextureCoord*texSize;coord-=center;float distance=length(coord);if(distance<radius){float percent=(radius-distance)/radius;float theta=percent*percent*angle;float s=sin(theta);float c=cos(theta);coord=vec2(coord.x*c-coord.y*s,coord.x*s+coord.y*c);}coord+=center;vec2 result = coord/texSize;if(result.x < 0.0 || result.y < 0.0 || result.x > 1.0 || result.y>1.0){gl_FragColor=vec4(0.0,0.0,0.0,0.0);return;}gl_FragColor=texture2D(uSampler,result)*vColor;vec2 clampedCoord=clamp(coord,vec2(0.0),texSize);if(coord!=clampedCoord){gl_FragColor.a*=max(0.0,1.0-length(coord-clampedCoord));}}`;

    const BULGE_PICH_F_SHADER =`precision lowp float;uniform float radius;varying vec4 vColor;uniform float strength;uniform sampler2D uSampler;uniform float centerX;uniform float centerY;uniform float texSizeW;uniform float texSizeH;varying vec2 vTextureCoord;void main(){vec2 center = vec2(centerX,centerY);vec2 texSize = vec2(texSizeW,texSizeH);vec2 coord=vTextureCoord*texSize;coord-=center;float distance=length(coord);if(distance<radius){float percent=distance/radius;if(strength>0.0){coord*=mix(1.0,smoothstep(0.0,radius/distance,percent),strength*0.75);}else{coord*=mix(1.0,pow(percent,1.0+strength*0.75)*radius/distance,1.0-percent);}}coord+=center;vec2 result = coord/texSize;if(result.x < 0.0 || result.y < 0.0 || result.x > 1.0 || result.y>1.0){gl_FragColor=vec4(0.0,0.0,0.0,0.0);return;}gl_FragColor=texture2D(uSampler,result)*vColor;vec2 clampedCoord=clamp(coord,vec2(0.0),texSize);if(coord!=clampedCoord){gl_FragColor.a*=max(0.0,1.0-length(coord-clampedCoord));}}`
    const PERSPECTIVE_F_SHADER = `precision lowp float;uniform bool useTextureSpace;uniform sampler2D uSampler;uniform float texSizeW;uniform float texSizeH;varying vec2 vTextureCoord;varying vec4 vColor;uniform float m0;uniform float m1;uniform float m2;uniform float m3;uniform float m4;uniform float m5;uniform float m6;uniform float m7;uniform float m8;void main(){mat3 matrix = mat3(m0,m1,m2,m3,m4,m5,m6,m7,m8);vec2 texSize = vec2(texSizeW,texSizeH);vec2 coord=vTextureCoord*texSize;if(useTextureSpace)coord=coord/texSize*2.0-1.0;vec3 warp=matrix*vec3(coord,1.0);coord=warp.xy/warp.z;if(useTextureSpace)coord=(coord*0.5+0.5)*texSize;vec2 result = coord/texSize;if(result.x < 0.0 || result.y < 0.0 || result.x > 1.0 || result.y>1.0){gl_FragColor=vec4(0.0,0.0,0.0,0.0);return;}gl_FragColor=texture2D(uSampler,result)*vColor;vec2 clampedCoord=clamp(coord,vec2(0.0),texSize);if(coord!=clampedCoord){gl_FragColor.a*=max(0.0,1.0-length(coord-clampedCoord));}}`
    const q = function(a, d, c){
        return Math.max(a, Math.min(d, c))
    }
    const createCustomFilter = function(fShader,uniformObj?){
        return new egret.CustomFilter(V_SHADER,fShader,uniformObj);
    }
    abstract class IEffect{
        protected uniform:any;
        protected target;
        public constructor(target){
            this.target = target;
        }        
        /**刷新数据 */
        public abstract refreshData(...args);
        /**销毁 */
        public dispose(){
            this.uniform = null;
            this.target.filters = [];
            this.target = null;
        }
    }
    /**
     * 创建特效对象
     * @param target egret.bitmap | eui.Image
     * @param EffectPerspective 下的类
     */
    export const createEffects = function (target,effectClass):IEffect{
        return new effectClass(target);
    }
    export class EffectBrightnessContrast extends IEffect{
        protected uniform = {
            brightness:0,
            contrast:0
        };
        /**
         * 明亮对比度
         */
        public constructor(target){
            super(target)
            this.refreshData();
            target.filters = [createCustomFilter(BRIGHTNESS_CONTRAST_F_SHADER,this.uniform)];
        }
        /**b -1~1 d -1~1 */
        public refreshData(b = 0,d = 0){
            this.uniform.brightness = q(-1, b, 1);
            this.uniform.contrast = q(-1,d,1);
        }
    }
    export class EffectHueSaturation extends IEffect{
        protected uniform = {
            hue:0,
            saturation:0
        }   
        /**饱和度 */
        public constructor(target){
            super(target)
            this.refreshData();
            target.filters = [createCustomFilter(HUE_SATURATION_F_SHADER,this.uniform)];
        }
        /**hue -1~1 saturation -1~1 */
        public refreshData(hue = 0,saturation = 0){
            this.uniform.hue = q(-1, hue, 1);
            this.uniform.saturation = q(-1, saturation, 1);
        }
    }
    export class EffectVibrance extends IEffect{
        protected uniform = {
            amount: 0
        }
        /**亮度 */
        public constructor(target){
            super(target)
            this.refreshData();
            target.filters = [createCustomFilter(VIBRANCE_F_SHADER,this.uniform)];
        }
        /**-1 1 */
        public refreshData(b = 0){
            this.uniform.amount =  q(-1, b, 1)
        }
    }
    /**降噪 */
    export class EffectDenoise extends IEffect{
        protected uniform = {
            exponent: 0,
            texSizeW: 0,
            texSizeH: 0
        }
        public constructor(target){
            super(target)
            this.refreshData(0,target.width || 100,target.height || 100);
            target.filters = [createCustomFilter(DENOISE_F_SHADER,this.uniform)];
        }
        /**降噪 0-50 */
        public refreshData(b = 0,width?,height?){
            this.uniform.exponent = Math.max(0, b);
            if(!isNaN(width)){
                this.uniform.texSizeW = width;
            }
            if(!isNaN(height)){
                this.uniform.texSizeH = height;
            }
        }
    }
    /**锐化 未实现 */
    class EffectUnsharpMask{}
    /** */
    export class EffectNoise extends IEffect{
        protected uniform = {
			amount:0
        }
        public constructor(target){
            super(target)
            this.refreshData(0);
            target.filters = [createCustomFilter(NOISE_F_SHADER,this.uniform)];
        }
        /** 0-1 */
        public refreshData(a){
            this.uniform.amount = q(0, a, 1)
        }
    }
    /**
     * 增加墨色
     * @param 0-1
     */
    export class EffectSepia extends IEffect{
        protected uniform = {
			amount:0
        }
        public constructor(target){
            super(target)
            this.refreshData(0);
            target.filters = [createCustomFilter(SEPIA_F_SHADER,this.uniform)];
        }
        /** 0-1 */
        public refreshData(a){
            this.uniform.amount = q(0, a, 1)
        }
    }
    /**
     * 序幕
     */
    export class EffectVignette extends IEffect{
        protected uniform = {
            size: 0,
            amount: 0
        }
        public constructor(target){
            super(target)
            this.refreshData(0,0);
            target.filters = [createCustomFilter(VIGNETTE_F_SHADER,this.uniform)];
        }
        /** 0-1 */
        public refreshData(b,d){
            this.uniform.size = q(0, b, 1),
            this.uniform.amount = q(0, d, 1)
        }
    }
    /**
     */
    export class EffectZoomblur extends IEffect{
        protected uniform = {
            strength: 0,
			centerX:0,
			centerY:0,
			texSizeW: 0,
			texSizeH: 0
        }
        public constructor(target){
            super(target)
            this.refreshData(0,target.width/2,target.height/2,target.width,target.height);
            target.filters = [createCustomFilter(ZOOM_BLUR_F_SHADER,this.uniform)];
        }
        /** 0-1 */
        public refreshData(a,b,c,d,e){
            this.uniform.strength = a
            if(!isNaN(b)){
                this.uniform.centerX = b
            }
            if(!isNaN(c)){
                this.uniform.centerY = c
            }
            if(!isNaN(d)){
                this.uniform.texSizeW = d
            }
            if(!isNaN(e)){
                this.uniform.texSizeH = e
            }
        }
    }
    export class EffectTriangleblur extends IEffect{
        protected uniform = {
			deltaX:0,
			deltaY:0
        }
        protected uniform2= {
			deltaX:0,
			deltaY:0
        }
        public constructor(target){
            super(target)
            this.refreshData(0);
            target.filters = [
                createCustomFilter(TRIANGLE_BLUR_F_SHADER,this.uniform)
                ,createCustomFilter(TRIANGLE_BLUR_F_SHADER,this.uniform2)
            ];
        }
        /** 0-n */
        public refreshData(b){
            this.uniform.deltaX = b / this.target.width
            this.uniform.deltaY = 0

            this.uniform2.deltaX = 0
            this.uniform.deltaY = b / this.target.height
        }
    }
    export class EffectTiltShift extends IEffect{
        protected uniform = {
			blurRadius: 0,
            gradientRadius: 0,
			startX:0,
			startY:0,
			endX:0,
			endY:0,
			deltaX:0,
			deltaY:0,
			texSizeW:0,
			texSizeH:0
        }
        protected uniform2= {
			blurRadius: 0,
            gradientRadius: 0,
			startX:0,
			startY:0,
			endX:0,
			endY:0,
			deltaX:0,
			deltaY:0,
			texSizeW:0,
			texSizeH:0
        }
        public constructor(target){
            super(target)
            this.refreshData(0,0,0,0,this.target.width,this.target.height,this.target.width,this.target.height);
            target.filters = [
                createCustomFilter(TILT_SHIFT_F_SHADER,this.uniform)
                ,createCustomFilter(TILT_SHIFT_F_SHADER,this.uniform2)
            ];
        }
        /**强度 0-50 宽度 0-n */
        public refreshData(a,b,c,d,e,f,w,h){
            var n = e - c
            , p = f - d
            , m = Math.sqrt(n * n + p * p);

            this.uniform.blurRadius = a
            this.uniform.gradientRadius = b

            if(!isNaN(c )){
                this.uniform.startX = c
            }
            if(!isNaN(d)){
                this.uniform.startY = this.target.height - d
            }
            if(!isNaN(e)){
                this.uniform.endX = e
            }
            if(!isNaN(f)){
                this.uniform.endY = this.target.height -f
            }
            if(!isNaN(n)){
                this.uniform.deltaX = n/m
            }
            if(!isNaN(p)){
                this.uniform.deltaY = p/m
            }
            if(!isNaN(w)){
                this.uniform.texSizeW = w;
            }
            if(!isNaN(h)){
                this.uniform.texSizeH = h
            }

            this.uniform2.blurRadius = a
            this.uniform2.gradientRadius = b
            
            if(!isNaN(c)){
            this.uniform2.startX = c
            }            
            if(!isNaN(d)){
            this.uniform2.startY = this.target.height -d
            }            
            if(!isNaN(e)){
            this.uniform2.endX = e
            }            
            if(!isNaN(f)){
            this.uniform2.endY = this.target.height -f
            }            
            if(!isNaN(p)){
            this.uniform2.deltaX = -p / m
            }            
            if(!isNaN(n)){
            this.uniform2.deltaY = n / m
            }            
            if(!isNaN(w)){
                this.uniform2.texSizeW = w;
            }
            if(!isNaN(h)){
                this.uniform2.texSizeH = h
            }   
        }
    }
    export class EffectSwirl extends IEffect{
        protected uniform = {
            radius: 0,
            centerX:0,
			centerY:0,
            angle: 0,
            texSizeW: 0,
			texSizeH: 0
        }
        public constructor(target){
            super(target)
            this.refreshData(0,0,this.target.width/2,this.target.height/2,this.target.width,this.target.height);
            target.filters = [
                createCustomFilter(SWIRL_F_SHADER,this.uniform)
            ];
        }
        /** 0-n */
        public refreshData(angle,radius,centerX,centerY,w,h){
            this.uniform.radius = radius
            if(!isNaN(angle)){
                this.uniform.angle = angle
            }
            if(!isNaN(centerX)){
                this.uniform.centerX = centerX
            }
            if(!isNaN(centerY)){
                this.uniform.centerY = centerY
            }
            if(!isNaN(w)){
                this.uniform.texSizeW = w
            }
            if(!isNaN(h)){
                this.uniform.texSizeH = h
            }
        }
    }
    export class EffectBulgePinch extends IEffect{
        protected uniform = {
            radius: 0,
            centerX:0,
			centerY:0,
			strength:0,
            texSizeW:0,
			texSizeH:0
        }
        public constructor(target){
            super(target)
            this.refreshData(0,0,this.target.width/2,this.target.height/2,this.target.width,this.target.height);
            target.filters = [
                createCustomFilter(BULGE_PICH_F_SHADER,this.uniform)
            ];
        }
        /** 0-n */
        public refreshData(strength,radius,centerX,centerY,w,h){
            this.uniform.radius = radius
            if(!isNaN(centerX)){
                this.uniform.centerX = centerX
            }
            if(!isNaN(strength)){
                this.uniform.strength = q(-1,strength,1)
            }
            if(!isNaN(centerY)){
                this.uniform.centerY = centerY
            }
            if(!isNaN(w)){
                this.uniform.texSizeW = w
            }
            if(!isNaN(h)){
                this.uniform.texSizeH = h
            }
        }
    }
    export class EffectPerspective extends IEffect{
        protected uniform = {
            m1:0,
            m2:0,
            m3:0,
            m4:0,
            m5:0,
            m6:0,
            m7:0,
            m8:0,
            m0:0,
            texSizeW:0,
            texSizeH:0,
            useTextureSpace:0
        }
        public constructor(target){
            super(target)
            this.refreshData([0,0,this.target.width,0,0,this.target.height,this.target.width,this.target.height],[0,0,this.target.width,0,0,this.target.height,this.target.width,this.target.height],0,this.target.width,this.target.height);
            target.filters = [
                createCustomFilter(PERSPECTIVE_F_SHADER,this.uniform)
            ];
        }
        private x(a, d, c, e, g, l, n, p) {
            var m = c - g
            , h = e - l
            , f = n - g
            , k = p - l;
            g = a - c + g - n;
            l = d - e + l - p;
            var q = m * k - f * h
            , f = (g * k - f * l) / q
            , m = (m * l - g * h) / q;
            return [c - a + f * c, e - d + f * e, f, n - a + m * n, p - d + m * p, m, a, d, 1]
        }
        private y(a) {
            var d = a[0]
            , c = a[1]
            , e = a[2]
            , g = a[3]
            , l = a[4]
            , n = a[5]
            , p = a[6]
            , m = a[7];
            a = a[8];
            var f = d * l * a - d * n * m - c * g * a + c * n * p + e * g * m - e * l * p;
            return [(l * a - n * m) / f, (e * m - c * a) / f, (c * n - e * l) / f, (n * p - g * a) / f, (d * a - e * p) / f, (e * g - d * n) / f, (g * m - l * p) / f, (c * p - d * m) / f, (d * l - c * g) / f]
        }
        public refreshData(d,a,useTextureSpace,width,height) {
            var c = this.x.apply(null, d)
            let e = this.x.apply(null, a)
            c = this.y(c);
            return this.matrixWarp([c[0] * e[0] + c[1] * e[3] + c[2] * e[6], c[0] * e[1] + c[1] * e[4] + c[2] * e[7], c[0] * e[2] + c[1] * e[5] + c[2] * e[8], c[3] * e[0] + c[4] * e[3] + c[5] * e[6], c[3] * e[1] + c[4] * e[4] + c[5] * e[7], c[3] * e[2] + c[4] * e[5] + c[5] * e[8], c[6] * e[0] + c[7] * e[3] + c[8] * e[6], c[6] * e[1] + c[7] * e[4] + c[8] * e[7], c[6] * e[2] + c[7] * e[5] + c[8] * e[8]],0,width,height)
        }
        /** 0-n */
        public matrixWarp(m,useTextureSpace,width,height){
            this.uniform.m0 = m[0];
            this.uniform.m1 = m[1];
            this.uniform.m2 = m[2];
            this.uniform.m3 = m[3];
            this.uniform.m4 = m[4];
            this.uniform.m5 = m[5];
            this.uniform.m6 = m[6];
            this.uniform.m7 = m[7];
            this.uniform.m8 = m[8];
            this.uniform.texSizeW = this.target.width;
            this.uniform.texSizeH = this.target.height;
            this.uniform.useTextureSpace = 0;
        }
    }
}