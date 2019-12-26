class EffectExamp extends eui.Component{
	public img:eui.Image;
	public slider:eui.VSlider;
	public list:eui.List;
	public attrGroup:eui.Group;
	private effTypeGroup:eui.Group;
	private radioGroup:eui.RadioButtonGroup;
	private curEffect = null;
	private curData:any = null;
	private mataData;
	private touchPointComp:EffectPointsUI;
	public constructor() {
		super();
		this.skinName = "EffectExampSkin"
		this.mataData = RES.getRes("effect_json").effect;
		this.radioGroup = new eui.RadioButtonGroup();
	}
	protected childrenCreated(){
		this.initEffectGroup();
		this.radioGroup.addEventListener(egret.Event.CHANGE,(value)=>{
			let num = this.radioGroup.selection.$indexNumber;
			this.createEffect(num)
		},this)
		this.createEffect(0);
	}
	private initEffectGroup(){
		let y = 0;
		this.mataData.forEach((item,index)=>{
			let t = new eui.RadioButton();
			if(index == 0){
				t.selected = true;
			}
			t.label = item.name;
			this.effTypeGroup.addChild(t);
			t.group = this.radioGroup;
			t.y = y;
			y+=t.height + 50;
		})
	}
	private createEffect(n){
		if(this.curEffect){
			this.curEffect.dispose();
			this.attrGroup.removeChildren();
			this.curEffect = null;
			if(this.touchPointComp){
				this.removeChild(this.touchPointComp); 
				this.touchPointComp = null;
			}
		}
		let effectArr = this.getEffectArr();
		let effectClass = effectArr[n];
		let effect = SpecialEffects.createEffects(this.img,effectClass)
		this.curEffect = effect;
		this.curData = JSON.parse(JSON.stringify(this.mataData[n]));  
		if(effectClass == SpecialEffects.EffectPerspective){
			this.touchPointComp = new EffectPointsUI(this);
			this.addChild(this.touchPointComp);
			this.touchPointComp.x = this.img.x;
			this.touchPointComp.y = this.img.y;
			this.touchPointComp.width = this.img.width;
			this.touchPointComp.height = this.img.height;
			let arr1 = this.curData.initPoint;
			let arr2 = this.curData.usePoint;
			this.refreshSpecialEffects(arr2)
			for(let i = 0;i<arr2.length;i+=2){
				this.touchPointComp.createPoint(arr2[i],arr2[i+1])
			}
		} else {
			let y = 0;
			this.curData.attr.forEach((item)=>{
				let t = new EffectItemUI(this);
				this.attrGroup.addChild(t)
				t.y = y;
				t.initData(item)
				y+=t.height
			})
		}
	}
	public refresh(){
		let m = this.curData.attr.map(item=>item.curNum)
		this.curEffect.refreshData(...m)
	}
	public refreshSpecialEffects(data){
		this.curEffect.refreshData(data,this.curData.initPoint)
	}
	private getEffectArr(){
		return [
			SpecialEffects.EffectBrightnessContrast,
			SpecialEffects.EffectHueSaturation,
			SpecialEffects.EffectVibrance,
			SpecialEffects.EffectDenoise,
			SpecialEffects.EffectNoise,
			SpecialEffects.EffectSepia,
			SpecialEffects.EffectVignette,
			SpecialEffects.EffectZoomblur,
			SpecialEffects.EffectTriangleblur,
			SpecialEffects.EffectTiltShift,
			SpecialEffects.EffectSwirl,
			SpecialEffects.EffectBulgePinch,
			SpecialEffects.EffectPerspective
		]
	}
}