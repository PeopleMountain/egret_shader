class EffectPointsUI extends eui.Group{
	private pointImgArr = [];
	private curPointImg;
	private _m;
	public isActive = false;
	public constructor(m) {
		super();
		this._m = m;
	}
	protected childrenCreated(){
		this.touchEnabled = true;
		this.touchChildren = true;
		let r = new eui.Rect(this.width,this.height);
		r.alpha = 0
		this.addChild(r)
		this.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.handleTouchBegin,this)
		this.addEventListener(egret.TouchEvent.TOUCH_END,this.handleTouchEnd,this)
		this.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.handleTouchMove,this)
	}
	private handleTouchBegin(e){
		if(this.pointImgArr.indexOf(e.target) > -1){
			this.curPointImg = e.target;
		}
	}
	private handleTouchMove(e){
		if(this.curPointImg){
			this.curPointImg.x = e.stageX - this.x;
			this.curPointImg.y = e.stageY - this.y;
			this._m.refreshSpecialEffects(this.getData())
		}
	}
	private getData(){
		let data = [];
		this.pointImgArr.forEach((item)=>{
			data.push(item.x);
			data.push(item.y);
		})
		return data;
	}
	private handleTouchEnd(){
		this.curPointImg = null;
	}
	public createPoint(x,y){
		let img = new eui.Image(RES.getRes("radiobutton_select_up_png"));
		img.width = img.height = 20;
		img.anchorOffsetX = 10;
		img.anchorOffsetY = 10
		img.x = x;
		img.y = y;
		this.pointImgArr.push(img)
		this.addChild(img);
	}
	public partRemoved(){
		this.removeChildren();
		this.pointImgArr = null;
	}
}